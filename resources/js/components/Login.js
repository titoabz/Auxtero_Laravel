import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/login', { user, pass });
      const token = res.data.token;

      // Save token to localStorage for protected routes
      localStorage.setItem('portal_token', token);
      // Prefer backend-provided display name when available
      const backendName = res.data?.name;
      if (backendName) {
        localStorage.setItem('faculty_name', backendName);
      } else {
        // Fallback: infer first name from username
        try {
          const raw = user || '';
          const first = raw.split(/[.\s@_-]/)[0] || raw;
          const display = first ? (first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()) : '';
          if (display) localStorage.setItem('faculty_name', display);
        } catch (e) {
          // ignore
        }
      }

      localStorage.setItem('token_created', new Date().toISOString());
      
      if (onLogin) onLogin(token);
      setUser('');
      setPass('');
      
      // navigate to portal after login
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <div style={{flex:1, display:'flex', justifyContent:'center', alignItems:'center', paddingTop:'2rem'}}>
      <div className="auth-container">
  <img src="/img/logo.png" alt="School Logo" className="auth-logo" />
        <h1 className="auth-title">Faculty Portal</h1>
        <p className="auth-subtitle">Sign in to manage your respective department students</p>
        
        <div className="auth-card">
          <div className="auth-tabs">
            <Link to="/login" className="tab active">Sign In</Link>
            <Link to="/signup" className="tab">Sign Up</Link>
          </div>

          {error && <div className="alert alert-danger mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
