import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Login.module.scss';
import SnackbarMessage from './SnackbarMessage';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/home');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = "http://localhost:5001";
    const url = isSignup ? `${apiUrl}/api/signup` : `${apiUrl}/api/login`;

    try {
      const response = await axios.post(url, { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Login failed. Please check your credentials.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  return (
    <div className={styles.container}>
      <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>

      <button onClick={handleGoogleLogin} className={styles.googleBtn}>
        Login with Google
      </button>

      <button
        className={styles.toggleBtn}
        onClick={() => setIsSignup(!isSignup)}
      >
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
      <SnackbarMessage
          snackbarOpen={snackbarOpen}
          snackbarSeverity={snackbarSeverity}
          snackbarMessage={snackbarMessage}
          handleSnackbarClose={handleSnackbarClose}
        />
    </div>
  );
};

export default LoginPage;