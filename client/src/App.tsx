import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './app/ProtectedRoute'
import { GuestRoute } from './features/auth/components/GuestRoute'
import { AuthPage } from './features/auth/pages/AuthPage'
import { WorkspaceLayout } from './features/dashboard/components/WorkspaceLayout'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { ManagementPage } from './features/dashboard/pages/ManagementPage'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<GuestRoute><AuthPage /></GuestRoute>}
      />
      <Route element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/management" element={<ManagementPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
