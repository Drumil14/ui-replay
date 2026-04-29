'use client';

import { useState } from 'react';

const INITIAL_TASKS = [
  { id: 1, title: 'Design new dashboard layout', status: 'In Progress', tag: 'Design', priority: 'High' },
  { id: 2, title: 'Refactor authentication module', status: 'Todo', tag: 'Backend', priority: 'Medium' },
  { id: 3, title: 'Write API documentation', status: 'Done', tag: 'Docs', priority: 'Low' },
  { id: 4, title: 'Migrate database schema', status: 'In Progress', tag: 'Backend', priority: 'High' },
  { id: 5, title: 'Improve onboarding flow', status: 'Todo', tag: 'Product', priority: 'Medium' },
  { id: 6, title: 'Add dark mode toggle', status: 'Todo', tag: 'Frontend', priority: 'Low' },
];

const STATS = [
  { label: 'Active sprints', value: 3 },
  { label: 'Recent commits', value: 24 },
  { label: 'Open PRs', value: 7 },
  { label: 'Linked issues', value: 12 },
];

const FILTERS = ['all', 'Todo', 'In Progress', 'Done'];

export default function DemoWorkspace({ readOnly = false, inputValues = {} }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState('');

  const displaySearch = readOnly ? inputValues.search ?? '' : search;
  const displayNewTask = readOnly ? inputValues['new-task'] ?? '' : newTask;
  const activeFilter = readOnly ? 'all' : filter;

  const filtered = tasks.filter((task) => {
    if (activeFilter !== 'all' && task.status !== activeFilter) return false;
    if (displaySearch && !task.title.toLowerCase().includes(displaySearch.toLowerCase())) return false;
    return true;
  });

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed || readOnly) return;
    setTasks([
      ...tasks,
      { id: Date.now(), title: trimmed, status: 'Todo', tag: 'New', priority: 'Medium' },
    ]);
    setNewTask('');
  };

  return (
    <div className="min-h-full w-full bg-zinc-900 text-zinc-100">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-zinc-900/85 border-b border-zinc-800">
        <div className="px-6 pt-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center text-[10px] font-bold">
                  A
                </div>
                <h1 className="text-lg font-semibold tracking-tight">Project Atlas</h1>
              </div>
              <p className="text-xs text-zinc-500">Engineering · {tasks.length} tasks</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-label="Notifications"
                disabled={readOnly}
                className="w-8 h-8 grid place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700/60 disabled:hover:bg-zinc-800"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5.5a4 4 0 1 1 8 0v3l1 2H2l1-2v-3z" strokeLinejoin="round" />
                  <path d="M5.5 11a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
                </svg>
              </button>
              <button
                data-label="Settings"
                disabled={readOnly}
                className="w-8 h-8 grid place-items-center rounded-md bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700/60 disabled:hover:bg-zinc-800"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="2" />
                  <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M2.5 11.5l1-1M10.5 3.5l1-1" strokeLinecap="round" />
                </svg>
              </button>
              <button
                data-label="Invite"
                disabled={readOnly}
                className="px-3 h-8 text-xs font-medium rounded-md bg-violet-600/90 hover:bg-violet-500 transition"
              >
                Invite
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="6" cy="6" r="4" />
                <path d="M9 9l3 3" strokeLinecap="round" />
              </svg>
              <input
                data-field="search"
                type="text"
                placeholder="Search tasks…"
                value={displaySearch}
                onChange={(e) => !readOnly && setSearch(e.target.value)}
                readOnly={readOnly}
                className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition"
              />
            </div>
            <div className="flex bg-zinc-800/80 border border-zinc-700/60 rounded-md p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  data-label={`Filter: ${f === 'all' ? 'All' : f}`}
                  onClick={() => !readOnly && setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded transition ${
                    activeFilter === f
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="flex gap-2">
          <input
            data-field="new-task"
            type="text"
            placeholder="Add a new task and press Enter…"
            value={displayNewTask}
            onChange={(e) => !readOnly && setNewTask(e.target.value)}
            onKeyDown={(e) => !readOnly && e.key === 'Enter' && addTask()}
            readOnly={readOnly}
            className="flex-1 bg-zinc-800/80 border border-zinc-700/60 rounded-md px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition"
          />
          <button
            data-label="Add task"
            onClick={addTask}
            disabled={readOnly}
            className="px-4 py-2 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 transition rounded-md text-sm font-medium shadow-sm shadow-violet-950/40"
          >
            Add task
          </button>
        </div>

        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              data-label={`Task: ${task.title}`}
              className="group flex items-center justify-between gap-3 p-3.5 bg-zinc-800/50 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-800/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === 'Done'
                      ? 'bg-emerald-500'
                      : task.status === 'In Progress'
                      ? 'bg-amber-500'
                      : 'bg-zinc-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{task.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {task.status} · {task.priority} priority
                  </div>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-medium px-2 py-1 bg-zinc-700/50 border border-zinc-700/60 rounded text-zinc-300">
                {task.tag}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
              No tasks match your filters.
            </div>
          )}
        </div>

        <div className="mt-6 p-5 bg-gradient-to-br from-violet-950/40 via-zinc-900/40 to-blue-950/30 border border-violet-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <h3 className="text-sm font-semibold tracking-tight">Weekly summary</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your team shipped 8 tasks this week, 22% above average. Review velocity is strong and
            blockers are clearing faster than last sprint.
          </p>
          <div className="flex gap-2 mt-3.5">
            <button
              data-label="View report"
              disabled={readOnly}
              className="px-3 py-1.5 text-xs bg-zinc-800/80 hover:bg-zinc-700 rounded-md transition border border-zinc-700/60"
            >
              View report
            </button>
            <button
              data-label="Share summary"
              disabled={readOnly}
              className="px-3 py-1.5 text-xs bg-zinc-800/80 hover:bg-zinc-700 rounded-md transition border border-zinc-700/60"
            >
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              data-label={stat.label}
              className="p-4 bg-zinc-800/40 border border-zinc-800 rounded-lg hover:border-zinc-700 transition cursor-pointer"
            >
              <div className="text-xs text-zinc-500">{stat.label}</div>
              <div className="text-2xl font-semibold tracking-tight mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="pt-4 pb-2">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Activity</h3>
          <div className="space-y-2.5">
            {[
              { who: 'Maya', what: 'merged PR #247', when: '2 minutes ago' },
              { who: 'Daniel', what: 'commented on the auth refactor', when: '14 minutes ago' },
              { who: 'Priya', what: 'closed the database migration ticket', when: '1 hour ago' },
              { who: 'Alex', what: 'opened a new design review', when: '3 hours ago' },
            ].map((item, i) => (
              <div
                key={i}
                data-label={`Activity: ${item.who}`}
                className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-zinc-800/60 rounded-md text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 grid place-items-center text-xs font-medium">
                  {item.who[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-zinc-300">{item.who}</span>{' '}
                  <span className="text-zinc-500">{item.what}</span>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">{item.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
