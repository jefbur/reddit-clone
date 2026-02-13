import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'url(https://www.redditstatic.com/accountmanager/bbb584033aa89e39bad69436c504c9bd.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div style={{ 
        marginLeft: 'auto',
        width: '400px',
        background: '#fff',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Sign Up</h1>
        <p style={{ fontSize: '14px', color: '#787c7e', marginBottom: '24px' }}>
          By continuing, you are setting up a Reddit account and agree to our User Agreement and Privacy Policy.
        </p>
        
        {error && <p style={{ color: '#ea0027', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '10px', 
              fontWeight: 600, 
              color: '#787c7e',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #edeff1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '10px', 
              fontWeight: 600, 
              color: '#787c7e',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #edeff1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '10px', 
              fontWeight: 600, 
              color: '#787c7e',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #edeff1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            Sign Up
          </button>
        </form>
        
        <p style={{ fontSize: '12px', color: '#787c7e' }}>
          Already a redditor? <Link to="/login" style={{ color: '#0079d3', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
