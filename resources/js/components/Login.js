import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { user, pass });
      const token = res.data.token;
  if (onLogin) onLogin(token);
  setUser('');
  setPass('');
  // navigate to portal after login
  navigate('/');
    } catch (err) {
      alert('Login failed: invalid credentials');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Faculty Login</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">User</label>
              <input className="form-control" value={user} onChange={e => setUser(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <div className="d-grid">
              <button className="btn btn-primary">Login</button>
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
