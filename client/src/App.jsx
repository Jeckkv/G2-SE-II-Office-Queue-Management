import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import RoleSelectionPage from './pages/RoleSelectionPage.jsx'
import CustomerPage from './pages/CustomerPage.jsx'
import OfficerPage from './pages/OfficerPage.jsx'
import DisplayPage from './pages/DisplayPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/customer" element={<CustomerPage />} />   
        <Route path="/officer" element={<OfficerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/display" element={<DisplayPage />} />
    </Routes>
  )
}