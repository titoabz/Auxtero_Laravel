import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup({ onLogin }) {
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
      if (!user || !pass) {
        throw new Error('Username and password are required');
      }
      
      const res = await axios.post('/api/signup', { user, pass });
      const token = res.data.token;
      
      // Save token to localStorage
      localStorage.setItem('portal_token', token);
      localStorage.setItem('token_created', new Date().toISOString());
      
      if (onLogin) onLogin(token);
      setUser('');
      setPass('');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Faculty Signup</h4>
          <p className="text-muted small">Faculty</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <div className="mb-2">
              <label className="form-label">Username</label>
              <input 
                className="form-control" 
                value={user} 
                onChange={e => setUser(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                className="form-control" 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-outline-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Signup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
