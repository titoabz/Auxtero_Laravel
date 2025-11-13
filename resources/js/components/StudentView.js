import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HeaderBar from './HeaderBar';

export default function StudentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('performance'); // Add active tab state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadStudent();
  }, [id]);

  async function loadStudent() {
    setLoading(true);
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      const res = await axios.get(`/api/students/${id}`, { headers });
      setProfile(res.data);
      setEditData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student');
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.delete(`/api/students/${id}`, { headers });
      alert('Student deleted successfully');
      navigate('/students');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      // Prepare payload without accidentally overwriting profile_picture
      const payload = { ...editData };

      // By default, don't send profile_picture to avoid overriding a new upload
      if (Object.prototype.hasOwnProperty.call(payload, 'profile_picture')) {
        delete payload.profile_picture;
      }

      if (selectedImage) {
        // Upload image first
        const formData = new FormData();
        formData.append('profile_picture', selectedImage);

        const uploadResponse = await axios.post(`/api/students/${id}/upload-picture`, formData, {
          headers: headers
          // Let axios set Content-Type automatically for FormData
        });

        // Ensure the subsequent PUT includes the new image path
        if (uploadResponse?.data?.profile_picture) {
          payload.profile_picture = uploadResponse.data.profile_picture;
        }
      }

      // Then update other data with safe payload
      await axios.put(`/api/students/${id}`, payload, { headers });
      alert('Student updated successfully');
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      loadStudent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    }
  }

  function handleEditChange(field, value) {
    setEditData(prev => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleDeletePicture() {
    if (!confirm('Are you sure you want to delete this profile picture?')) {
      return;
    }

    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.delete(`/api/students/${id}/delete-picture`, { headers });
      alert('Profile picture deleted successfully');
      setSelectedImage(null);
      setImagePreview(null);
      loadStudent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete picture');
    }
  }

  if (loading) return <><HeaderBar showHome showBack /><div className="p-4">Loading...</div></>;
  if (error) return <><HeaderBar showHome showBack /><div className="p-4 alert alert-danger">{error}</div></>;
  if (!profile) return <><HeaderBar showHome showBack /><div className="p-4">Student not found</div></>;

  const displayName = profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const gpa = profile.grade_percentage || 0;
  const attendance = (profile.attendance !== null && profile.attendance !== undefined && profile.attendance !== '') ? parseInt(profile.attendance, 10) : 0;
  const isAtRisk = profile.at_risk || attendance < 75 || gpa < 75;

  return (
    <>
      <HeaderBar />
      <div style={{minHeight: '100vh', backgroundColor: '#f3f4f6'}}>
        {/* Purple Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          color: 'white'
        }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'white',
                  border: '3px solid white',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: isEditing ? 'pointer' : 'default'
                }}
                onClick={() => isEditing && document.getElementById('profilePictureInput').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : profile.profile_picture ? (
                    <img src={profile.profile_picture} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    initials
                  )}
                  {isEditing && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '10px',
                      textAlign: 'center',
                      padding: '2px'
                    }}>
                      📷 Change
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  id="profilePictureInput"
                  accept="image/*"
                  style={{display: 'none'}}
                  onChange={handleImageChange}
                />
                <div>
                  <h3 className="mb-1" style={{fontWeight: '600', fontSize: '28px'}}>{displayName}</h3>
                  <p className="mb-0" style={{fontSize: '16px', opacity: 0.9}}>Student ID: {profile.student_id || '4555642'}</p>
                  {isEditing && (profile.profile_picture || imagePreview) && (
                    <button 
                      className="btn btn-sm btn-danger mt-2" 
                      style={{borderRadius: '6px', fontSize: '12px'}}
                      onClick={handleDeletePicture}
                    >
                      🗑️ Remove Picture
                    </button>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2">
                {!isEditing ? (
                  <>
                    <button className="btn btn-light" style={{borderRadius: '8px'}} onClick={() => setIsEditing(true)}>✏️ Edit</button>
                    <button className="btn btn-danger" style={{borderRadius: '8px'}} onClick={handleDelete}>🗑️ Delete</button>
                    <button className="btn btn-secondary" style={{borderRadius: '8px'}} onClick={() => navigate(-1)}>Back</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-success" style={{borderRadius: '8px'}} onClick={handleSave}>💾 Save</button>
                    <button className="btn btn-secondary" style={{borderRadius: '8px'}} onClick={() => { setIsEditing(false); setEditData(profile); setSelectedImage(null); setImagePreview(null); }}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="container" style={{padding: '30px 15px'}}>
          <div className="card mb-4" style={{border: '1px solid #e5e7eb', borderRadius: '12px'}}>
            <div className="card-body" style={{padding: '24px'}}>
              <div className="row g-4">
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Name</div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editData.name || ''} 
                      onChange={(e) => handleEditChange('name', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.name || '-'}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Student ID</div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editData.student_id || ''} 
                      onChange={(e) => handleEditChange('student_id', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.student_id || '-'}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Email</div>
                  {isEditing ? (
                    <input 
                      type="email" 
                      className="form-control" 
                      value={editData.email || ''} 
                      onChange={(e) => handleEditChange('email', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.email || '-'}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Grade Percentage</div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editData.grade_percentage || 0} 
                      onChange={(e) => handleEditChange('grade_percentage', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{gpa}%</div>
                  )}
                </div>
              </div>
              <div className="row g-4 mt-2">
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Attendance</div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editData.attendance || 0} 
                      onChange={(e) => handleEditChange('attendance', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{attendance}%</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Present</div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editData.present || 0} 
                      onChange={(e) => handleEditChange('present', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.present || 0}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Absent</div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editData.absent || 0} 
                      onChange={(e) => handleEditChange('absent', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.absent || 0}</div>
                  )}
                </div>
                <div className="col-md-3">
                  <div style={{color: '#9ca3af', fontSize: '14px', marginBottom: '4px'}}>Late</div>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editData.late || 0} 
                      onChange={(e) => handleEditChange('late', e.target.value)}
                    />
                  ) : (
                    <div style={{color: '#1f2937', fontSize: '15px', fontWeight: '500'}}>{profile.late || 0}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="row g-4">
            {/* Left: Student Information */}
            <div className="col-md-6">
              <div className="card h-100" style={{border: '1px solid #e5e7eb', borderRadius: '12px'}}>
                <div className="card-body" style={{padding: '24px'}}>
                  <h6 className="d-flex align-items-center gap-2 mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                    👤 Student Information
                  </h6>

                  <div className="d-flex align-items-start gap-3 mb-4">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#6b7280',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        initials
                      )}
                    </div>
                    
                    <div style={{flex: 1}}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="mb-0" style={{fontSize: '18px', fontWeight: '600', color: '#1f2937'}}>{displayName}</h6>
                        <span className="badge" style={{
                          backgroundColor: '#22c55e',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>Active</span>
                      </div>
                      
                      <div className="d-flex flex-column gap-2" style={{fontSize: '14px', color: '#6b7280'}}>
                        <div className="d-flex align-items-center gap-2">
                          <span>📧</span>
                          <span>{profile.email || '-'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span>🎓</span>
                          <span>{profile.course_name || '-'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span>📚</span>
                          <span>Section: {profile.section_name || '-'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span>🆔</span>
                          <span>ID: {profile.student_id || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Academic Summary */}
            <div className="col-md-6">
              <div className="card h-100" style={{border: '1px solid #e5e7eb', borderRadius: '12px'}}>
                <div className="card-body" style={{padding: '24px'}}>
                  <h6 className="d-flex align-items-center gap-2 mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                    🎓 Academic Summary
                  </h6>
                  
                  {/* GPA */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{fontSize: '14px', color: '#6b7280'}}>GPA</span>
                      <span style={{
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: gpa >= 90 ? '#22c55e' : gpa >= 85 ? '#86efac' : gpa >= 80 ? '#f59e0b' : gpa >= 75 ? '#fbbf24' : '#ef4444'
                      }}>
                        {gpa}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${gpa}%`,
                        height: '100%',
                        backgroundColor: gpa >= 90 ? '#22c55e' : gpa >= 85 ? '#86efac' : gpa >= 80 ? '#f59e0b' : gpa >= 75 ? '#fbbf24' : '#ef4444',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{fontSize: '14px', color: '#6b7280'}}>Credits</span>
                      <span style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>
                        120/120
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1f2937',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>

                  {/* Avg Attendance */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{fontSize: '14px', color: '#6b7280'}}>Avg Attendance</span>
                      <span style={{fontSize: '16px', fontWeight: '600', color: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444'}}>
                        {attendance}%
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${attendance}%`,
                        height: '100%',
                        backgroundColor: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>

                  {/* Upcoming Assignments */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{fontSize: '14px', color: '#6b7280'}}>Upcoming Assignments</span>
                      <span className="badge bg-light text-dark" style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid #e5e7eb'
                      }}>
                        1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Performance Section */}
          <div className="card mt-4" style={{border: '1px solid #e5e7eb', borderRadius: '12px'}}>
            <div className="card-body" style={{padding: '0'}}>
              {/* Tabs */}
              <ul className="nav nav-tabs" style={{borderBottom: '1px solid #e5e7eb', padding: '0 24px'}}>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    style={{
                      color: activeTab === 'performance' ? '#4f46e5' : '#6b7280',
                      borderBottom: activeTab === 'performance' ? '3px solid #4f46e5' : 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('performance')}
                  >
                    Course Performance
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    style={{
                      color: activeTab === 'attendance' ? '#4f46e5' : '#6b7280',
                      borderBottom: activeTab === 'attendance' ? '3px solid #4f46e5' : 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('attendance')}
                  >
                    Attendance Tracking
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    style={{
                      color: activeTab === 'progress' ? '#4f46e5' : '#6b7280',
                      borderBottom: activeTab === 'progress' ? '3px solid #4f46e5' : 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('progress')}
                  >
                    Academic Progress
                  </a>
                </li>
              </ul>

              {/* Tab Content */}
              <div style={{padding: '24px'}}>
                {/* Course Performance Tab */}
                {activeTab === 'performance' && (
                  <>
                    {profile.course_name ? (
                      <div className="d-flex justify-content-between align-items-center p-3 mb-3" style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #f3f4f6'
                      }}>
                        <div className="d-flex align-items-center gap-3" style={{flex: 1}}>
                          <span style={{fontSize: '18px'}}>📚</span>
                          <div>
                            <h6 className="mb-1" style={{fontSize: '15px', fontWeight: '600', color: '#1f2937'}}>
                              {profile.course_name}
                            </h6>
                            <div className="d-flex gap-4">
                              <div>
                                <span style={{fontSize: '12px', color: '#9ca3af'}}>Grade</span>
                                <p className="mb-0" style={{fontSize: '14px', fontWeight: '600', color: gpa >= 90 ? '#22c55e' : gpa >= 75 ? '#f59e0b' : '#ef4444'}}>
                                  {profile.grade || (gpa >= 90 ? 'A' : gpa >= 85 ? 'A-' : gpa >= 80 ? 'B+' : gpa >= 75 ? 'B' : 'C')}
                                </p>
                              </div>
                              <div>
                                <span style={{fontSize: '12px', color: '#9ca3af'}}>Attendance</span>
                                <p className="mb-0" style={{fontSize: '14px', fontWeight: '600', color: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#3b82f6' : '#ef4444'}}>
                                  {attendance}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="badge" style={{
                          backgroundColor: gpa >= 85 ? '#dcfce7' : gpa >= 75 ? '#fef3c7' : '#fee2e2',
                          color: gpa >= 85 ? '#166534' : gpa >= 75 ? '#92400e' : '#991b1b',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {profile.grade || (gpa >= 90 ? 'A' : gpa >= 85 ? 'A-' : gpa >= 80 ? 'B+' : gpa >= 75 ? 'B' : 'C')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <p>No course enrollment data available</p>
                      </div>
                    )}
                  </>
                )}

                {/* Attendance Tracking Tab */}
                {activeTab === 'attendance' && (
                  <div>
                    <div className="row g-3">
                      {profile.course_name ? (
                        <div className="col-md-12">
                          <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h6 style={{fontSize: '15px', fontWeight: '600', color: '#1f2937'}}>
                                    📚 {profile.course_name}
                                  </h6>
                                  <p className="mb-0 text-muted" style={{fontSize: '13px'}}>
                                    {profile.course_code || 'Course Code'} - {profile.section_name || 'Section'}
                                  </p>
                                </div>
                                <span className="badge" style={{
                                  backgroundColor: attendance >= 90 ? '#dcfce7' : attendance >= 75 ? '#fef3c7' : '#fee2e2',
                                  color: attendance >= 90 ? '#166534' : attendance >= 75 ? '#92400e' : '#991b1b',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}>{attendance}%</span>
                              </div>
                              <div className="mb-2">
                                <div className="d-flex justify-content-between mb-1">
                                  <span style={{fontSize: '13px', color: '#6b7280'}}>Present</span>
                                  <span style={{fontSize: '13px', fontWeight: '600', color: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444'}}>
                                    {profile.present || 0} / {profile.total_classes || 0}
                                  </span>
                                </div>
                                <div style={{
                                  height: '6px',
                                  backgroundColor: '#f3f4f6',
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${attendance}%`,
                                    height: '100%',
                                    backgroundColor: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444',
                                    borderRadius: '3px'
                                  }}></div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="d-flex justify-content-between" style={{fontSize: '12px', color: '#9ca3af'}}>
                                  <span>Absent: {profile.absent || 0}</span>
                                  <span>Late: {profile.late || 0}</span>
                                  <span>Total Classes: {profile.total_classes || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-12 text-center py-5 text-muted">
                          <p>No attendance data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Academic Progress Tab */}
                {activeTab === 'progress' && (
                  <div>
                    <div className="row g-4">
                      {/* Left Column - Current Performance */}
                      <div className="col-md-6">
                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                          <div className="card-body">
                            <h6 className="mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>� Current Performance</h6>
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{fontSize: '13px', color: '#6b7280'}}>Current Grade</span>
                                <span style={{fontSize: '24px', fontWeight: '600', color: gpa >= 90 ? '#22c55e' : gpa >= 85 ? '#86efac' : gpa >= 80 ? '#f59e0b' : gpa >= 75 ? '#fbbf24' : '#ef4444'}}>
                                  {gpa.toFixed(1)}%
                                </span>
                              </div>
                              <div style={{height: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'hidden'}}>
                                <div style={{
                                  width: `${gpa}%`, 
                                  height: '100%', 
                                  backgroundColor: gpa >= 90 ? '#22c55e' : gpa >= 85 ? '#86efac' : gpa >= 80 ? '#f59e0b' : gpa >= 75 ? '#fbbf24' : '#ef4444',
                                  borderRadius: '6px'
                                }}></div>
                              </div>
                            </div>
                            <div className="mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{fontSize: '13px', color: '#6b7280'}}>Attendance Rate</span>
                                <span style={{fontSize: '24px', fontWeight: '600', color: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444'}}>
                                  {attendance}%
                                </span>
                              </div>
                              <div style={{height: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'hidden'}}>
                                <div style={{
                                  width: `${attendance}%`,
                                  height: '100%',
                                  backgroundColor: attendance >= 90 ? '#22c55e' : attendance >= 75 ? '#f59e0b' : '#ef4444',
                                  borderRadius: '6px'
                                }}></div>
                              </div>
                            </div>
                            <div className="mt-4 p-3" style={{backgroundColor: '#f9fafb', borderRadius: '8px'}}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{fontSize: '13px', color: '#6b7280'}}>Letter Grade</span>
                                <span className="badge" style={{
                                  backgroundColor: gpa >= 90 ? '#dcfce7' : gpa >= 85 ? '#dcfce7' : gpa >= 80 ? '#fef3c7' : gpa >= 75 ? '#fef3c7' : '#fee2e2',
                                  color: gpa >= 90 ? '#166534' : gpa >= 85 ? '#166534' : gpa >= 80 ? '#92400e' : gpa >= 75 ? '#92400e' : '#991b1b',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}>
                                  {profile.grade || (gpa >= 90 ? 'A' : gpa >= 85 ? 'A-' : gpa >= 80 ? 'B+' : gpa >= 75 ? 'B' : 'C')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Status & Alerts */}
                      <div className="col-md-6">
                        <div className="card mb-3" style={{border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                          <div className="card-body">
                            <h6 className="mb-4" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>� Academic Status</h6>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{fontSize: '13px', color: '#6b7280'}}>Enrollment Status</span>
                                <span className="badge" style={{
                                  backgroundColor: profile.active ? '#dcfce7' : '#fee2e2',
                                  color: profile.active ? '#166534' : '#991b1b',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {profile.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{fontSize: '13px', color: '#6b7280'}}>Risk Status</span>
                                <span className="badge" style={{
                                  backgroundColor: profile.at_risk ? '#fee2e2' : '#dcfce7',
                                  color: profile.at_risk ? '#991b1b' : '#166534',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {profile.at_risk ? 'At Risk' : 'Good Standing'}
                                </span>
                              </div>
                            </div>
                            {profile.at_risk && (
                              <div className="mt-3 p-3" style={{backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px'}}>
                                <p className="mb-1" style={{fontSize: '13px', fontWeight: '600', color: '#991b1b'}}>⚠️ Academic Alert</p>
                                <p className="mb-0" style={{fontSize: '12px', color: '#dc2626'}}>
                                  {gpa < 75 && attendance < 75 ? 'Low grade and attendance. Immediate intervention needed.' :
                                   gpa < 75 ? 'Grade below passing threshold. Academic support recommended.' :
                                   attendance < 75 ? 'Attendance below required percentage. Counseling advised.' :
                                   'Performance monitoring required.'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="card" style={{border: '1px solid #e5e7eb', borderRadius: '8px'}}>
                          <div className="card-body">
                            <h6 className="mb-3" style={{fontSize: '16px', fontWeight: '600', color: '#1f2937'}}>🏆 Academic Standing</h6>
                            <div className="d-flex align-items-center gap-3">
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: gpa >= 90 ? '#dcfce7' : gpa >= 80 ? '#fef3c7' : '#fee2e2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                              }}>
                                {gpa >= 90 ? '⭐' : gpa >= 80 ? '📚' : '📖'}
                              </div>
                              <div>
                                <p className="mb-1" style={{fontSize: '14px', fontWeight: '600', color: '#1f2937'}}>
                                  {gpa >= 90 ? "Dean's List" : gpa >= 80 ? 'Good Standing' : 'Needs Improvement'}
                                </p>
                                <p className="mb-0" style={{fontSize: '12px', color: '#6b7280'}}>
                                  {gpa >= 90 ? 'Excellent Academic Performance' : gpa >= 80 ? 'Meeting Academic Standards' : 'Below Expected Performance'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
