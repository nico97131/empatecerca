import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginForm from './components/LoginForm';
import AdminDashboard from './pages/AdminDashboard';
import VoluntarioPanel from './pages/VoluntarioPanel';
import TutorPanel from './pages/TutorPanel';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/voluntario/panel"
            element={
              <PrivateRoute allowedRoles={['voluntario']}>
                <VoluntarioPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/tutor/panel"
            element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorPanel />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#059669',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;