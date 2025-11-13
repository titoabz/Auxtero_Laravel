import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup({ onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // HeaderBar handles token display / logout

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!emailUser || !password || !firstName) {
        throw new Error('Please fill required fields (Name, Email Username and Password)');
      }

      // The backend expects 'user' and 'pass' — send the email username as user
      const payload = {
        user: emailUser,
        pass: password,
        // Additional info could be sent and handled by backend later
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        employee_id: employeeId
      };

      const res = await axios.post('/api/signup', payload);
      const token = res.data.token;

      // Save token to localStorage
      localStorage.setItem('portal_token', token);
      localStorage.setItem('token_created', new Date().toISOString());
      // Prefer backend-provided display name when available
      const backendName = res.data?.name;
      if (backendName) {
        localStorage.setItem('faculty_name', backendName);
      } else {
        try {
          const display = firstName ? (firstName.charAt(0).toUpperCase() + firstName.slice(1)) : '';
          if (display) localStorage.setItem('faculty_name', display);
        } catch (e) { /* ignore */ }
      }

      if (onLogin) onLogin(token);
      // Clear and navigate
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setEmployeeId('');
      setEmailUser('');
      setPassword('');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <div style={{flex:1, display:'flex', justifyContent:'center', alignItems:'center', paddingTop:'2rem'}}>
      <div className="auth-container">
        <img src="/img/logo.png" alt="Faculty Portal" className="auth-logo" />
        <h1 className="auth-title">Faculty Portal</h1>
        <p className="auth-subtitle">Sign in to manage your respective department students</p>

        <div className="auth-card">
          <h5 className="mb-3">Create an account</h5>

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{display: 'flex', gap: '0.75rem', marginBottom: '0.75rem'}}>
              <input
                type="text"
                placeholder="Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={loading}
                required
                style={{flex: 1}}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={loading}
                style={{flex: 1}}
              />
            </div>

            <div style={{display: 'flex', gap: '0.75rem', marginBottom: '0.75rem'}}>
              <input
                type="text"
                placeholder="Middle Name"
                value={middleName}
                onChange={e => setMiddleName(e.target.value)}
                disabled={loading}
                style={{flex: 1}}
              />
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                disabled={loading}
                style={{flex: 1}}
              />
            </div>

            <div style={{marginBottom: '0.75rem'}}>
              <input
                type="text"
                placeholder="Email"
                value={emailUser}
                onChange={e => setEmailUser(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div style={{marginBottom: '1rem'}}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'}}>
              <button type="submit" disabled={loading} style={{padding: '0.5rem 1rem'}}>
                {loading ? 'Creating...' : 'Create account'}
              </button>

              <Link to="/login" className="btn btn-sm" style={{background: '#f3f4f6', padding: '0.4rem 0.8rem', borderRadius: 6}}>
                Log In
              </Link>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
