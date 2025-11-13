import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function ArchivePage() {
  const navigate = useNavigate();
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivedStudents();
  }, []);

  const loadArchivedStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      
      // Fetch all students from section_students table
      const res = await axios.get('/api/students/all', { headers });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      // Filter to show only inactive/archived students
      const inactiveStudents = data.filter(student => student.active === false || student.active === 0);
      
      setArchivedStudents(inactiveStudents);
    } catch (err) {
      console.error('Failed to load archived students', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreStudent = async (id) => {
    if (!confirm('Are you sure you want to restore this student?')) {
      return;
    }

    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      
      await axios.put(`/api/students/${id}/status`, { active: true }, { headers });
      
      alert('Student restored successfully');
      loadArchivedStudents();
    } catch (error) {
      console.error('Error restoring student:', error);
      alert('Error restoring student');
    }
  };

  return (
    <>
      <HeaderBar />
      <div className="container mt-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="m-0">Archive</h4>
                <p className="text-muted mb-0">Archived students and records</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : archivedStudents.length === 0 ? (
              <div className="text-center text-muted py-5">
                <h5>No archived records</h5>
                <p>Archived students will appear here</p>
              </div>
            ) : (
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
                    {archivedStudents.map(student => {
                      const isAtRisk = student.at_risk === true || student.at_risk === 1;
                      
                      return (
                        <tr key={student.id} style={{ opacity: 0.8 }}>
                          <td>
                            {student.profile_picture ? (
                              <img 
                                src={student.profile_picture} 
                                alt={student.name}
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
                                {(student.name || '?')[0].toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td>
                            <div>
                              {student.name}
                              {isAtRisk && (
                                <span className="badge bg-warning ms-2" style={{ fontSize: '0.7em' }}>
                                  At Risk
                                </span>
                              )}
                              <span className="badge bg-secondary ms-2" style={{ fontSize: '0.7em' }}>
                                Archived
                              </span>
                            </div>
                          </td>
                          <td><strong>{student.student_id}</strong></td>
                          <td>{student.email}</td>
                          <td>
                            {student.gpa !== null && student.gpa !== undefined ? 
                              <span className="badge bg-primary">{Number(student.gpa).toFixed(2)}</span>
                              : '-'
                            }
                          </td>
                          <td>
                            {student.attendance !== null && student.attendance !== undefined ? 
                              `${student.attendance}%` : '-'
                            }
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary me-1"
                              onClick={() => navigate(`/student/${student.id}`)}
                              title="View Profile"
                            >
                              👁️ View
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => restoreStudent(student.id)}
                              title="Restore to Students"
                            >
                              ↩️ Restore
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
