import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // There is no server-side signup persistence in this demo.
    // We'll attempt to login with provided credentials (works if server env matches).
    try {
      const res = await axios.post('/api/signup', { user, pass });
      const token = res.data.token;
  if (onLogin) onLogin(token);
  setUser('');
  setPass('');
  navigate('/');
    } catch (err) {
      // Signup failed — show a simple alert
      alert('Signup failed. Check console for details.');
      console.error(err);
    }
  };


  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Faculty Signup</h4>
          <p className="text-muted small">Faculty</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">Desired User</label>
              <input className="form-control" value={user} onChange={e => setUser(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Desired Password</label>
              <input className="form-control" type="password" value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <div className="d-grid">
              <button className="btn btn-outline-primary">Signup</button>
            </div>
          </form>
          <div className="mt-3 text-muted small">This will create a local faculty account stored in the database.</div>
        </div>
      </div>
    </div>
  );
}
