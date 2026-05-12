'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pbajbvzjadplzkxfejbu.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_yMMh0Ez4nm1Amyvzyq7vLQ_sqMTyHhT'
);

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  owner: string;
  createdAt: string;
  completedAt: string | null;
  taskNumber: number;
}

const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_HR_PASSWORD || "FelixHR2026";
const sanitize = (str: string) => String(str).replace(/[<>&]/g, '');

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('hr_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
    }}>
      <div style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '360px',
        width: '90%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 16px',
          background: '#21262d',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 600,
          color: '#58a6ff',
        }}>FA</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#e6edf3' }}>HR Command Center</h2>
        <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '20px' }}>Enter password to access</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${error ? '#f85149' : '#30363d'}`,
              background: '#0d1117',
              color: '#e6edf3',
              borderRadius: '8px',
              marginBottom: '12px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          />
          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            background: '#238636',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer',
          }}>Access</button>
        </form>
        {error && (
          <p style={{ color: '#f85149', fontSize: '13px', marginTop: '10px' }}>Incorrect password</p>
        )}
      </div>
    </div>
  );
}

export default function HRDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    owner: 'HR',
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const auth = localStorage.getItem('hr_auth') === 'true';
    setIsAuthenticated(auth);
    if (auth) fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await SB.from('tasks').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        setTasks(data.map((t: any, i: number) => ({
          id: t.id, title: t.title, description: t.description || '', status: t.status,
          priority: t.priority, owner: t.owner || 'HR', createdAt: t.created_at, completedAt: t.completed_at,
          taskNumber: i + 1,
        })));
        setLoading(false);
        return;
      }
    } catch {}

    // Fallback to API
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const { data, error } = await SB.from('tasks').insert({
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        status: 'open',
        priority: formData.priority || 'Medium',
        owner: formData.owner || 'HR',
      }).select().single();

      if (!error && data) {
        setFormData({ title: '', description: '', priority: 'Medium', owner: 'HR' });
        fetchTasks();
      } else {
        showToast('Failed to create task');
      }
    } catch {
      showToast('Network error');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await SB.from('tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', id);
      fetchTasks();
    } catch {
      showToast('Failed to update');
    }
  };

  const deleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      try {
        await SB.from('tasks').delete().eq('id', id);
        fetchTasks();
      } catch {
        showToast('Failed to delete');
      }
    }
  };

  const deleteAllTasks = async () => {
    if (confirm('Delete ALL tasks? This cannot be undone.')) {
      try {
        await SB.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        fetchTasks();
      } catch {
        showToast('Failed to delete all');
      }
    }
  };

  const exportCSV = () => {
    const csv = 'ID,Title,Description,Status,Priority,Owner,Created,Completed\n' +
      tasks.map(t => `"${sanitize(t.id)}","${sanitize(t.title)}","${sanitize(t.description)}","${sanitize(t.status)}","${sanitize(t.priority)}","${sanitize(t.owner)}","${sanitize(t.createdAt)}","${sanitize(t.completedAt || '')}"`).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'hr_tasks.csv';
    a.click();
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusCount = (status: string) => filteredTasks.filter(t => t.status === status).length;
  const totalDone = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length ? Math.round((totalDone / tasks.length) * 100) : 0;

  const statusColors: Record<string, string> = {
    open: '#58a6ff',
    progress: '#d29922',
    review: '#a371f7',
    done: '#3fb950',
  };

  const columns = ['open', 'progress', 'review', 'done'];
  const columnTitles: Record<string, string> = {
    open: 'Open',
    progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => { setIsAuthenticated(true); fetchTasks(); }} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#e6edf3', background: '#0d1117' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0d1117; --bg-elevated: #161b22; --bg-subtle: #21262d; --border: #30363d;
          --text: #e6edf3; --text-secondary: #8b949e; --accent: #58a6ff;
          --success: #3fb950; --warning: #d29922; --danger: #f85149; --purple: #a371f7;
          --primary: #238636;
        }
        .header { position: sticky; top: 0; z-index: 50; background: rgba(13,17,23,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 28px; height: 28px; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 6px; display: grid; place-items: center; font-size: 12px; font-weight: 600; color: var(--accent); }
        .logo-text { font-size: 15px; font-weight: 600; }
        .nav { display: flex; gap: 4px; }
        .nav a { color: var(--text-secondary); font-size: 14px; padding: 6px 12px; border-radius: 6px; }
        .nav a:hover { color: var(--text); background: var(--bg-subtle); }
        .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 8px 14px; font-size: 14px; font-weight: 500; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:hover { background: #2ea043; }
        .btn-secondary { background: var(--bg-elevated); color: var(--text); border-color: var(--border); }
        .btn-secondary:hover { background: var(--bg-subtle); }
        .btn-danger { background: rgba(248,81,73,0.1); color: var(--danger); }
        .btn-danger:hover { background: rgba(248,81,73,0.2); }
        .btn-ghost { background: transparent; color: var(--text-secondary); }
        .btn-ghost:hover { background: var(--bg-subtle); color: var(--text); }
        .main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .hero { display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start; padding: 40px 0; }
        .hero-title { font-size: clamp(28px,4vw,42px); font-weight: 600; line-height: 1.2; margin-bottom: 12px; }
        .hero-desc { color: var(--text-secondary); font-size: 15px; margin-bottom: 20px; max-width: 520px; }
        .hero-actions { display: flex; gap: 10px; margin-bottom: 24px; }
        .tags { display: flex; gap: 8px; }
        .tag { background: var(--bg-subtle); color: var(--text-secondary); padding: 6px 10px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border); }
        .stats-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .stats-title { font-size: 14px; font-weight: 600; }
        .stats-badge { font-size: 11px; background: rgba(88,166,255,0.1); color: var(--accent); padding: 4px 8px; border-radius: 6px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .stat-item { background: var(--bg); border-radius: 8px; padding: 14px; }
        .stat-label { font-size: 11px; color: #6e7681; margin-bottom: 4px; }
        .stat-value { font-size: 22px; font-weight: 600; }
        .section { margin-top: 40px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .section-title { font-size: 20px; font-weight: 600; }
        .toolbar { display: flex; gap: 8px; flex-wrap: wrap; }
        .search-input { padding: 8px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; width: 200px; }
        .search-input:focus { outline: none; border-color: var(--accent); }
        .kanban { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .kanban-col { background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 12px; padding: 16px; min-height: 300px; }
        .col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .col-title { font-size: 14px; font-weight: 600; }
        .col-count { font-size: 12px; color: #6e7681; background: var(--bg); padding: 2px 8px; border-radius: 6px; }
        .task-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 10px; transition: border-color 0.15s; position: relative; padding-left: 18px; }
        .task-card:hover { border-color: var(--accent); }
        .task-card::before { content: ""; position: absolute; left: 7px; top: 10px; bottom: 10px; width: 3px; border-radius: 2px; }
        .task-id { font-size: 10px; color: #6e7681; margin-bottom: 6px; letter-spacing: 0.05em; }
        .task-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
        .task-desc { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.4; }
        .task-meta { font-size: 11px; color: #6e7681; display: flex; justify-content: space-between; margin-bottom: 10px; }
        .task-status { width: 100%; padding: 4px 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; font-size: 11px; color: var(--text-secondary); cursor: pointer; }
        .task-delete { margin-top: 8px; font-size: 11px; color: var(--danger); cursor: pointer; border: none; background: none; width: 100%; }
        .form-section { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-top: 40px; }
        .form-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
        .form-desc { color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-secondary); }
        .form-input { width: 100%; padding: 10px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; }
        .form-input:focus { outline: none; border-color: var(--accent); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-submit { grid-column: span 2; }
        .analytics-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 40px; }
        .analytics-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
        .analytics-label { font-size: 12px; color: #6e7681; margin-bottom: 8px; }
        .analytics-value { font-size: 28px; font-weight: 600; }
        .analytics-trend { font-size: 11px; margin-top: 4px; }
        .progress-section { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 24px; }
        .progress-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
        .progress-bar { height: 8px; background: var(--bg-subtle); border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--accent); border-radius: 999px; transition: width 0.5s ease; }
        .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
        .empty { text-align: center; padding: 30px; color: #6e7681; font-size: 13px; border: 1px dashed var(--border); border-radius: 8px; }
        .shortcuts-btn { position: fixed; bottom: 20px; right: 20px; width: 44px; height: 44px; border-radius: 50%; background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-secondary); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: none; align-items: center; justify-content: center; }
        .modal-overlay.visible { display: flex; }
        .modal { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; }
        .modal-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .shortcut-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
        .shortcut-key { background: var(--bg); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-family: monospace; }
        .shortcut-desc { color: var(--text-secondary); font-size: 13px; }
        .footer { border-top: 1px solid var(--border); padding: 20px; margin-top: 40px; text-align: center; color: #6e7681; font-size: 13px; }
        @media(max-width:900px) { .hero { grid-template-columns: 1fr; } .kanban { grid-template-columns: repeat(2,1fr); } .form-row { grid-template-columns: 1fr; } .form-submit { grid-column: span 1; } .analytics-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">FA</div>
            <div className="logo-text">HR Command Center</div>
          </div>
          <nav className="nav">
            <a href="#tasks">Tasks</a>
            <a href="#analytics">Analytics</a>
            <a href="#intake">New Task</a>
          </nav>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('hr_auth'); setIsAuthenticated(false); }}>Logout</button>
            <a href="#tasks" className="btn btn-secondary">Tasks</a>
            <a href="#intake" className="btn btn-primary">+ New</a>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div>
            <h1 className="hero-title">HR Task Command Center</h1>
            <p className="hero-desc">Manage HR tasks from creation to completion. Track progress, analyze performance, and streamline your workflow.</p>
            <div className="hero-actions">
              <a href="#tasks" className="btn btn-primary">View Tasks</a>
              <a href="#intake" className="btn btn-secondary">Create Task</a>
            </div>
            <div className="tags">
              <span className="tag">Task Management</span>
              <span className="tag">Analytics</span>
              <span className="tag">Workflow</span>
            </div>
          </div>
          <aside className="stats-card">
            <div className="stats-header">
              <span className="stats-title">Live Stats</span>
              <span className="stats-badge">HR</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item"><div className="stat-label">Open</div><div className="stat-value">{getStatusCount('open')}</div></div>
              <div className="stat-item"><div className="stat-label">Total</div><div className="stat-value">{tasks.length}</div></div>
              <div className="stat-item"><div className="stat-label">Done</div><div className="stat-value">{totalDone}</div></div>
              <div className="stat-item"><div className="stat-label">Rate</div><div className="stat-value">{completionRate}%</div></div>
            </div>
          </aside>
        </section>

        <section className="section" id="tasks">
          <div className="section-header">
            <h2 className="section-title">Task Board</h2>
            <div className="toolbar">
              <input type="text" className="search-input" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className="btn btn-secondary" onClick={exportCSV}>Export</button>
              <button className="btn btn-danger" onClick={deleteAllTasks}>Delete All</button>
            </div>
          </div>
          <div className="kanban">
            {columns.map(status => (
              <div className="kanban-col" key={status}>
                <div className="col-header">
                  <span className="col-title">{columnTitles[status]}</span>
                  <span className="col-count">{getStatusCount(status)}</span>
                </div>
                <div>
                  {filteredTasks.filter(t => t.status === status).length === 0 ? (
                    <div className="empty">No tasks</div>
                  ) : (
                    filteredTasks.filter(t => t.status === status).map(task => (
                      <div className="task-card" key={task.id} style={{ borderLeftColor: statusColors[status] }}>
                        <div className="task-id">TASK-{String(task.taskNumber).padStart(3, '0')}</div>
                        <div className="task-title">{task.title}</div>
                        <div className="task-desc">{task.description}</div>
                        <div className="task-meta">
                          <span>{task.owner}</span>
                          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        <select className="task-status" value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)}>
                          <option value="open">Open</option>
                          <option value="progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                        <button className="task-delete" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section" id="intake">
          <h2 className="form-title">Create New Task</h2>
          <p className="form-desc">Add a new HR task to the board.</p>
          <form onSubmit={createTask}>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input type="text" className="form-input" placeholder="What needs to be done?" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Task details..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Owner</label>
                <input type="text" className="form-input" placeholder="HR" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary form-submit" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
          </form>
        </section>

        <section id="analytics">
          <h2 className="section-title" style={{ marginBottom: '20px' }}>Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card"><div className="analytics-label">Total Tasks</div><div className="analytics-value">{tasks.length}</div></div>
            <div className="analytics-card"><div className="analytics-label">Completed</div><div className="analytics-value">{totalDone}</div></div>
            <div className="analytics-card"><div className="analytics-label">In Progress</div><div className="analytics-value">{getStatusCount('progress')}</div></div>
            <div className="analytics-card"><div className="analytics-label">Rate</div><div className="analytics-value">{completionRate}%</div></div>
          </div>

          <div className="progress-section">
            <div className="progress-title">Completion Progress</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionRate}%` }}></div></div>
            <div className="progress-label"><span>Progress</span><span>{completionRate}%</span></div>
          </div>
        </section>

        <footer className="footer">
          HR Task Command Center © 2026
        </footer>
      </main>

      <button className="shortcuts-btn" onClick={() => setShowShortcuts(!showShortcuts)}>?</button>
      <div className={`modal-overlay ${showShortcuts ? 'visible' : ''}`} onClick={() => setShowShortcuts(false)}>
        <div className="modal">
          <h3 className="modal-title">Keyboard Shortcuts</h3>
          <div className="shortcut-row"><span className="shortcut-key">Ctrl+N</span><span className="shortcut-desc">New Task</span></div>
          <div className="shortcut-row"><span className="shortcut-key">Ctrl+F</span><span className="shortcut-desc">Search</span></div>
          <div className="shortcut-row"><span className="shortcut-key">Ctrl+E</span><span className="shortcut-desc">Export</span></div>
          <div className="shortcut-row"><span className="shortcut-key">?</span><span className="shortcut-desc">Shortcuts</span></div>
        </div>
      </div>
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 80, background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#e6edf3', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}