import { Routes, Route } from 'react-router'
import RoleSelectionPage from './pages/RoleSelectionPage.jsx'
import CustomerPage from './pages/CustomerPage.jsx'
import OfficerPage from './pages/OfficerPage.jsx'
import DisplayPage from './pages/DisplayPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectionPage />} />
      <Route path="/customer" element={<CustomerPage />} />
      <Route path="/officer" element={<OfficerPage />} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}