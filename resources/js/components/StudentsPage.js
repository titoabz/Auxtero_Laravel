import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function StudentsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      
      // Fetch all students from section_students table
      const res = await axios.get('/api/students/all', { headers });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      // Filter to show only active students
      const activeStudents = data.filter(student => student.active !== false && student.active !== 0);
      
      setProfiles(activeStudents);
    } catch (err) {
      console.error('Failed to load students', err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  const onViewProfile = (profile) => {
    localStorage.setItem('viewed_students', JSON.stringify([profile]));
    navigate(`/profile/${profile.id}`);
  };

  const toggleActive = async (id) => {
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      const profile = profiles.find(p => p.id === id);
      
      await axios.put(`/api/students/${id}/status`, { active: !profile.active }, { headers });
      loadProfiles();
    } catch (err) {
      console.error('Failed to toggle active status', err);
    }
  };

  const markAtRisk = async (id, atRisk) => {
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      
      await axios.put(`/api/students/${id}/status`, { at_risk: atRisk }, { headers });
      loadProfiles();
    } catch (err) {
      console.error('Failed to mark at risk', err);
    }
  };

  // Filter students based on search query
  const filteredProfiles = profiles.filter(student => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const name = (student.name || `${student.first_name || ''} ${student.last_name || ''}`).toLowerCase();
    const studentId = (student.student_id || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    
    return name.includes(query) || 
           studentId.includes(query) || 
           email.includes(query);
  });

  return (
    <>
      <HeaderBar />
      <div className="container mt-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">Students</h4>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="input-group">
                <span className="input-group-text" style={{background:'#f8f9fa'}}>
                  <span style={{fontSize:18}}>🔍</span>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, student ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{fontSize:15}}
                />
                {searchQuery && (
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-muted small">
                  Found {filteredProfiles.length} student{filteredProfiles.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {loading && <div>Loading students...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!loading && !error && (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{width: '80px'}}></th>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Email</th>
                      <th>GPA</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          {searchQuery ? 'No students found matching your search' : 'No students available'}
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map(p => {
                        const isActive = p.active !== false && p.active !== 0;
                        const isAtRisk = p.at_risk === true || p.at_risk === 1;
                        
                        return (
                          <tr key={p.id} style={{ opacity: isActive ? 1 : 0.6 }}>
                            <td>
                              {p.profile_picture ? (
                                <img 
                                  src={p.profile_picture} 
                                  alt={p.name || `${p.first_name} ${p.last_name}`}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div 
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    background: '#6c757d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {(p.name || p.first_name || '?')[0].toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td>
                              <div>
                                {p.name || `${p.first_name || ''} ${p.middle_name || ''} ${p.last_name || ''}`.trim()}
                                {isAtRisk && (
                                  <span className="badge bg-warning ms-2" style={{ fontSize: '0.7em' }}>
                                    At Risk
                                  </span>
                                )}
                                {!isActive && (
                                  <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7em' }}>
                                    Archived
                                  </span>
                                )}
                              </div>
                            </td>
                            <td><strong>{p.student_id}</strong></td>
                            <td>{p.email}</td>
                            <td>
                              {p.gpa !== null && p.gpa !== undefined ? 
                                <span className="badge bg-primary">{Number(p.gpa).toFixed(2)}</span>
                                : '-'
                              }
                            </td>
                            <td>
                              {p.attendance !== null && p.attendance !== undefined ? 
                                `${p.attendance}%` : '-'
                              }
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => onViewProfile(p)}
                                title="View Profile"
                              >
                                👁️ View
                              </button>
                              <button 
                                className={`btn btn-sm me-1 ${isActive ? 'btn-secondary' : 'btn-success'}`}
                                onClick={() => toggleActive(p.id)}
                                title={isActive ? 'Archive' : 'Unarchive'}
                              >
                                {isActive ? '📦 Archive' : '✓ Unarchive'}
                              </button>
                              {!isAtRisk ? (
                                <button 
                                  className="btn btn-sm btn-warning"
                                  onClick={() => markAtRisk(p.id, true)}
                                  title="Mark as At Risk"
                                >
                                  ⚠️ Mark At Risk
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => markAtRisk(p.id, false)}
                                  title="Remove At Risk"
                                >
                                  ✓ Clear Risk
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
