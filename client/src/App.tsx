import { Routes, Route, Navigate } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginPage'
import Home from './Home';

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    return <>{children}</>;
  };
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
