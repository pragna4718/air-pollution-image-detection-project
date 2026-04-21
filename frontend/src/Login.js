import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css';
import backgroundImage from './assets/background1.jpeg';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    if (!identifier) return "Email or Phone is required";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10}$/.test(identifier);
    
    if (!isEmail && !isPhone) return "Invalid Email or Phone Number (10 digits)";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError('');
    login(identifier);
    navigate('/dashboard');
  };

  return (
    <div 
      className="auth-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="auth-overlay"></div>
      <div className="auth-card">
        <h2>Air Pollution Level Detector</h2>
        <p className="auth-subtitle">Login to your Air Pollution Dashboard</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Phone Number</label>
            <input 
              type="text" 
              placeholder="Enter email or 10-digit phone" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter password (min 8 chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="auth-submit-btn">Login</button>
        </form>


        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
