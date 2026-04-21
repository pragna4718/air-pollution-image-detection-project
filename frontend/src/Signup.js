import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css'; // Reusing the common styling from Login
import backgroundImage from './assets/background1.jpeg';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneCode: '+91',
    phoneNumber: '',
    address: '',
    country: '',
    state: '',
    district: '',
    city: ''
  });

  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // Basic mock data for cascading dropdowns
  const countries = ['India', 'USA', 'UK'];
  const statesByCountry = {
    'India': ['Maharashtra', 'Karnataka', 'Delhi'],
    'USA': ['California', 'New York', 'Texas'],
    'UK': ['England', 'Scotland', 'Wales']
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent dropdowns when parent changes
      ...(name === 'country' && { state: '', district: '', city: '' }),
      ...(name === 'state' && { district: '', city: '' })
    }));
  };

  const validate = () => {
    // Check required
    for (const [key, value] of Object.entries(formData)) {
      if (!value) return `Please fill out ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address";

    // Phone validation (10 digits)
    if (!/^\d{10}$/.test(formData.phoneNumber)) return "Phone number must be exactly 10 digits";

    // Password validation: 8 chars, 1 upper, 1 lower, 1 number, 1 special
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(formData.password)) {
      return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

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
    const success = signup(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div 
      className="auth-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="auth-overlay"></div>
      <div className="auth-card signup-card">
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join us to monitor and improve air quality</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Strong password" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="phone-input-group">
              <select name="phoneCode" value={formData.phoneCode} onChange={handleChange} className="phone-code">
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder="10-digit number"
                className="phone-number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <select name="country" value={formData.country} onChange={handleChange}>
                <option value="">Select Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select name="state" value={formData.state} onChange={handleChange} disabled={!formData.country}>
                <option value="">Select State</option>
                {(statesByCountry[formData.country] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" disabled={!formData.state} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" disabled={!formData.district && !formData.state} />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">Sign Up</button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
