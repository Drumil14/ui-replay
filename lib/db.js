import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sessions.json');

async function ensureDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return { sessions: [] };
  }
}

async function writeDb(data) {
  await ensureDb();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export async function listSessions() {
  const db = await readDb();
  return db.sessions
    .map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      duration: s.duration,
      width: s.width,
      height: s.height,
      eventCount: Array.isArray(s.events) ? s.events.length : 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSession(id) {
  const db = await readDb();
  return db.sessions.find((s) => s.id === id) || null;
}

export async function saveSession(session) {
  const db = await readDb();
  db.sessions.push(session);
  await writeDb(db);
  return session;
}

export async function deleteSession(id) {
  const db = await readDb();
  const before = db.sessions.length;
  db.sessions = db.sessions.filter((s) => s.id !== id);
  if (db.sessions.length === before) return false;
  await writeDb(db);
  return true;
}
