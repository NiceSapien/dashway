import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Passwords } from "./pages/Passwords"
import { SecureNotes } from "./pages/SecureNotes"
import { PersonalInfo } from "./pages/PersonalInfo"
import { Payments } from "./pages/Payments"
import { SecurityDashboard } from "./pages/SecurityDashboard"
import { Settings } from "./pages/Settings"
import { BlankPage } from "./pages/BlankPage"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="passwords" element={<Passwords />} />
              <Route path="notes" element={<SecureNotes />} />
              <Route path="personal-info" element={<PersonalInfo />} />
              <Route path="payments" element={<Payments />} />
              <Route path="security" element={<SecurityDashboard />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App