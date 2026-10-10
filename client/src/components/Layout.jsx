import { Link, NavLink, Outlet } from 'react-router'
export default function Layout() {
  return <div className="app-shell">
    <aside className="side-panel"><Link className="logo" to="/">▦ <span>QueueFlow</span></Link><p className="side-caption">WORKSPACE</p>
      <nav aria-label="Main navigation"><NavLink end to="/">⌂ <span>Overview</span></NavLink><NavLink to="/officer">▤ <span>Officer dashboard</span></NavLink><NavLink to="/customer">♧ <span>Registration</span></NavLink><NavLink to="/display">▣ <span>Public display</span></NavLink></nav>
      <div className="side-footer"><span className="status-dot"/> Queue management system</div>
    </aside>
    <div className="app-content"><header className="top-panel"><div><strong>Office Queue Management</strong><small>Service desk workspace</small></div><Link className="outline-btn" to="/display">Open live display ↗</Link></header><main className="workspace"><Outlet /></main></div>
  </div>
}
