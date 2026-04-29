const HEATMAP_GRID = 4;
const REPEATED_CLICK_RADIUS = 48;

export function computeInsights(session) {
  if (!session) return null;

  const events = Array.isArray(session.events) ? session.events : [];
  const duration = session.duration || 0;
  const width = session.width || 1;
  const height = session.height || 1;

  const clicks = [];
  const moves = [];
  const inputs = [];
  const scrolls = [];

  for (const event of events) {
    if (event.type === 'click') clicks.push(event);
    else if (event.type === 'move') moves.push(event);
    else if (event.type === 'input') inputs.push(event);
    else if (event.type === 'scroll') scrolls.push(event);
  }

  const heatmap = Array.from({ length: HEATMAP_GRID }, () => Array(HEATMAP_GRID).fill(0));
  for (const click of clicks) {
    const gx = Math.min(HEATMAP_GRID - 1, Math.max(0, Math.floor((click.x / width) * HEATMAP_GRID)));
    const gy = Math.min(HEATMAP_GRID - 1, Math.max(0, Math.floor((click.y / height) * HEATMAP_GRID)));
    heatmap[gy][gx]++;
  }

  let hottest = { x: 0, y: 0, count: 0 };
  for (let y = 0; y < HEATMAP_GRID; y++) {
    for (let x = 0; x < HEATMAP_GRID; x++) {
      if (heatmap[y][x] > hottest.count) {
        hottest = { x, y, count: heatmap[y][x] };
      }
    }
  }

  const repeated = findRepeatedClicks(clicks);

  let firstInteractionTime = duration;
  for (const event of events) {
    if (event.type === 'click' || event.type === 'input') {
      firstInteractionTime = event.timestamp;
      break;
    }
  }

  let topHalf = 0;
  let bottomHalf = 0;
  const halfY = height / 2;
  for (const click of clicks) {
    if (click.y < halfY) topHalf++;
    else bottomHalf++;
  }
  const totalForDistribution = topHalf + bottomHalf;
  const topPct = totalForDistribution ? Math.round((topHalf / totalForDistribution) * 100) : 0;
  const bottomPct = totalForDistribution ? 100 - topPct : 0;

  let longestIdle = 0;
  for (let i = 1; i < events.length; i++) {
    const gap = events[i].timestamp - events[i - 1].timestamp;
    if (gap > longestIdle) longestIdle = gap;
  }

  const totalDistance = computeMoveDistance(moves);

  const uniqueFields = new Set(inputs.map((e) => e.fieldId)).size;

  return {
    counts: {
      total: events.length,
      clicks: clicks.length,
      moves: moves.length,
      inputs: inputs.length,
      scrolls: scrolls.length,
      uniqueFields,
    },
    heatmap,
    hottest,
    repeated,
    firstInteractionTime,
    distribution: { topPct, bottomPct, topHalf, bottomHalf },
    longestIdle,
    totalDistance,
    duration,
  };
}

function findRepeatedClicks(clicks) {
  const groups = [];
  for (const click of clicks) {
    let placed = false;
    for (const group of groups) {
      const dx = group.x - click.x;
      const dy = group.y - click.y;
      if (Math.hypot(dx, dy) < REPEATED_CLICK_RADIUS) {
        group.count++;
        group.x = (group.x * (group.count - 1) + click.x) / group.count;
        group.y = (group.y * (group.count - 1) + click.y) / group.count;
        if (click.value) group.label = click.value;
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push({ x: click.x, y: click.y, count: 1, label: click.value });
    }
  }
  return groups
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count);
}

function computeMoveDistance(moves) {
  let distance = 0;
  for (let i = 1; i < moves.length; i++) {
    const dx = moves[i].x - moves[i - 1].x;
    const dy = moves[i].y - moves[i - 1].y;
    distance += Math.hypot(dx, dy);
  }
  return Math.round(distance);
}
