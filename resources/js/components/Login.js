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
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Faculty Login</h4>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <div className="mb-2">
              <label className="form-label">User</label>
              <input 
                className="form-control" 
                value={user} 
                onChange={e => setUser(e.target.value)}
                disabled={loading} 
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
              />
            </div>
            <div className="d-grid">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-3 text-center">
            <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
          </div>
        </div>
      </div>
    </div>
  );
}
