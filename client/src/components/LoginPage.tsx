import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.scss';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = "http://localhost:5001";
    const url = isSignup ? `${apiUrl}/api/signup` : `${apiUrl}/api/login`;

    try {
      const response = await axios.post(url, { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (error) {
      console.error(error);
      alert("Error occurred during login/signup");
    }
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
      <button
        className={styles.toggleBtn}
        onClick={() => setIsSignup(!isSignup)}
      >
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default LoginPage;
