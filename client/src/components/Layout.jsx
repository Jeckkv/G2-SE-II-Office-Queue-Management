import { Link, NavLink, Outlet } from 'react-router'

// Shared frame for every page except the display board.
export default function Layout() {
  return (
    <>
      <header className="header">
        <Link to="/" className="brand">Office Queue</Link>
        <nav className="nav">
          <NavLink to="/customer">Customer</NavLink>
          <NavLink to="/officer">Officer</NavLink>
          <NavLink to="/display">Display</NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </>
  )
}