import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function FacultyProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    middle_name: '', 
    employee_id: '', 
    email: '', 
    username: '', 
    profile_picture: '',
    position: '',
    department: '',
    bio: '',
    office_location: '',
    phone: '',
    office_hours: '',
    years_experience: '',
    at_university_since: '',
    publications: '',
    courses_teaching: '',
    research_areas: '',
    expertise: '',
    achievements: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Education state
  const [educationList, setEducationList] = useState([]);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [educationForm, setEducationForm] = useState({ degree: '', institution: '', year: '', field: '' });
  
  // Research state
  const [researchList, setResearchList] = useState([]);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [researchForm, setResearchForm] = useState({ title: '', type: '', year: '', description: '' });
  
  // Teaching state
  const [teachingList, setTeachingList] = useState([]);
  const [showTeachingModal, setShowTeachingModal] = useState(false);
  const [editingTeaching, setEditingTeaching] = useState(null);
  const [teachingForm, setTeachingForm] = useState({ course: '', code: '', semester: '', year: '', students: '' });
  
  // Service state
  const [serviceList, setServiceList] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ role: '', organization: '', startYear: '', endYear: '', description: '' });

  const goBack = () => {
    // If there is history to go back to, do that; otherwise go to /home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  // Education CRUD
  const openEducationModal = (item = null) => {
    if (item) {
      setEditingEducation(item);
      setEducationForm(item);
    } else {
      setEditingEducation(null);
      setEducationForm({ degree: '', institution: '', year: '', field: '' });
    }
    setShowEducationModal(true);
  };

  const saveEducation = () => {
    if (!educationForm.degree || !educationForm.institution) {
      alert('Degree and Institution are required');
      return;
    }
    if (editingEducation) {
      setEducationList(educationList.map(item => item.id === editingEducation.id ? { ...educationForm, id: item.id } : item));
    } else {
      setEducationList([...educationList, { ...educationForm, id: Date.now() }]);
    }
    setShowEducationModal(false);
  };

  const deleteEducation = (id) => {
    if (confirm('Delete this education entry?')) {
      setEducationList(educationList.filter(item => item.id !== id));
    }
  };

  // Research CRUD
  const openResearchModal = (item = null) => {
    if (item) {
      setEditingResearch(item);
      setResearchForm(item);
    } else {
      setEditingResearch(null);
      setResearchForm({ title: '', type: '', year: '', description: '' });
    }
    setShowResearchModal(true);
  };

  const saveResearch = () => {
    if (!researchForm.title) {
      alert('Title is required');
      return;
    }
    if (editingResearch) {
      setResearchList(researchList.map(item => item.id === editingResearch.id ? { ...researchForm, id: item.id } : item));
    } else {
      setResearchList([...researchList, { ...researchForm, id: Date.now() }]);
    }
    setShowResearchModal(false);
  };

  const deleteResearch = (id) => {
    if (confirm('Delete this research entry?')) {
      setResearchList(researchList.filter(item => item.id !== id));
    }
  };

  // Teaching CRUD
  const openTeachingModal = (item = null) => {
    if (item) {
      setEditingTeaching(item);
      setTeachingForm(item);
    } else {
      setEditingTeaching(null);
      setTeachingForm({ course: '', code: '', semester: '', year: '', students: '' });
    }
    setShowTeachingModal(true);
  };

  const saveTeaching = () => {
    if (!teachingForm.course) {
      alert('Course name is required');
      return;
    }
    if (editingTeaching) {
      setTeachingList(teachingList.map(item => item.id === editingTeaching.id ? { ...teachingForm, id: item.id } : item));
    } else {
      setTeachingList([...teachingList, { ...teachingForm, id: Date.now() }]);
    }
    setShowTeachingModal(false);
  };

  const deleteTeaching = (id) => {
    if (confirm('Delete this teaching entry?')) {
      setTeachingList(teachingList.filter(item => item.id !== id));
    }
  };

  // Service CRUD
  const openServiceModal = (item = null) => {
    if (item) {
      setEditingService(item);
      setServiceForm(item);
    } else {
      setEditingService(null);
      setServiceForm({ role: '', organization: '', startYear: '', endYear: '', description: '' });
    }
    setShowServiceModal(true);
  };

  const saveService = () => {
    if (!serviceForm.role || !serviceForm.organization) {
      alert('Role and Organization are required');
      return;
    }
    if (editingService) {
      setServiceList(serviceList.map(item => item.id === editingService.id ? { ...serviceForm, id: item.id } : item));
    } else {
      setServiceList([...serviceList, { ...serviceForm, id: Date.now() }]);
    }
    setShowServiceModal(false);
  };

  const deleteService = (id) => {
    if (confirm('Delete this service entry?')) {
      setServiceList(serviceList.filter(item => item.id !== id));
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('portal_token');
        const headers = token ? { 'X-Portal-Auth': token } : {};
        const res = await axios.get('/api/faculty/me', { headers });
        console.log('Faculty profile loaded:', res.data);
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          middle_name: res.data.middle_name || '',
          employee_id: res.data.employee_id || '',
          email: res.data.email || '',
          username: res.data.username || '',
          profile_picture: res.data.profile_picture || '',
          position: res.data.position || 'Professor',
          department: res.data.department || 'Computer Science Department',
          bio: res.data.bio || '',
          office_location: res.data.office_location || '',
          phone: res.data.phone || '',
          office_hours: res.data.office_hours || '',
          years_experience: res.data.years_experience || '',
          at_university_since: res.data.at_university_since || '',
          publications: res.data.publications || '',
          courses_teaching: res.data.courses_teaching || '',
          research_areas: res.data.research_areas || '',
          expertise: res.data.expertise || '',
          achievements: res.data.achievements || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally { setLoading(false); }
    })();
  }, []);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const token = localStorage.getItem('portal_token');
        const headers = token ? { 'X-Portal-Auth': token } : {};
        const res = await axios.post('/api/upload-image', {
          image: reader.result,
          type: 'faculty'
        }, { headers });
        
        if (res.data.success) {
          setForm(prev => ({ ...prev, profile_picture: res.data.path }));
          setSuccess('Image uploaded successfully!');
          // Save the new profile picture immediately
          await axios.put('/api/faculty/me', {
            ...form,
            profile_picture: res.data.path
          }, { headers });
          // Trigger profile badge refresh
          window.dispatchEvent(new Event('profilePictureUpdated'));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;
    
    setUploadingImage(true);
    setError('');
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.put('/api/faculty/me', {
        ...form,
        profile_picture: null
      }, { headers });
      setForm(prev => ({ ...prev, profile_picture: '' }));
      setSuccess('Profile picture deleted successfully!');
      // Trigger profile badge refresh
      window.dispatchEvent(new Event('profilePictureUpdated'));
    } catch (err) {
      setError('Failed to delete image');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      console.log('Saving faculty profile with all data:', form);
      const response = await axios.put('/api/faculty/me', {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name,
        employee_id: form.employee_id,
        email: form.email,
        profile_picture: form.profile_picture,
        position: form.position,
        department: form.department,
        bio: form.bio,
        office_location: form.office_location,
        phone: form.phone,
        office_hours: form.office_hours,
        years_experience: form.years_experience,
        at_university_since: form.at_university_since,
        publications: form.publications,
        courses_teaching: form.courses_teaching,
        research_areas: form.research_areas,
        expertise: form.expertise,
        achievements: form.achievements
      }, { headers });
      
      console.log('Save response:', response.data);
      
      // Fetch the updated profile to ensure we have the latest data
      const updatedProfile = await axios.get('/api/faculty/me', { headers });
      console.log('Updated profile from server:', updatedProfile.data);
      
      setForm({
        first_name: updatedProfile.data.first_name || '',
        last_name: updatedProfile.data.last_name || '',
        middle_name: updatedProfile.data.middle_name || '',
        employee_id: updatedProfile.data.employee_id || '',
        email: updatedProfile.data.email || '',
        username: updatedProfile.data.username || '',
        profile_picture: updatedProfile.data.profile_picture || '',
        position: updatedProfile.data.position || 'Professor',
        department: updatedProfile.data.department || 'Computer Science Department',
        bio: updatedProfile.data.bio || '',
        office_location: updatedProfile.data.office_location || '',
        phone: updatedProfile.data.phone || '',
        office_hours: updatedProfile.data.office_hours || '',
        years_experience: updatedProfile.data.years_experience || '',
        at_university_since: updatedProfile.data.at_university_since || '',
        publications: updatedProfile.data.publications || '',
        courses_teaching: updatedProfile.data.courses_teaching || '',
        research_areas: updatedProfile.data.research_areas || '',
        expertise: updatedProfile.data.expertise || '',
        achievements: updatedProfile.data.achievements || ''
      });
      
      setSuccess('✅ Profile updated successfully!');
      if (form.first_name) {
        // keep greeting consistent
        localStorage.setItem('faculty_name', form.first_name);
      }
      
      // Trigger profile badge refresh
      window.dispatchEvent(new Event('profilePictureUpdated'));
      
      // Switch back to overview tab after successful save
      setTimeout(() => {
        setActiveTab('overview');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }, 800);
    } catch (err) {
      console.error('Save error:', err.response || err);
      const message = err.response?.data?.message || 'Save failed';
      setError(message);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const fullName = `${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}`.trim();
  const initials = (form.first_name?.charAt(0) || '') + (form.last_name?.charAt(0) || '');
  
  // Parse arrays from strings
  const researchAreas = form.research_areas ? form.research_areas.split(',').map(s => s.trim()).filter(Boolean) : [];
  const expertiseList = form.expertise ? form.expertise.split(',').map(s => s.trim()).filter(Boolean) : [];
  const achievementsList = form.achievements ? form.achievements.split('\n').filter(Boolean) : [];

  return (
    <div className="container p-0" style={{maxWidth: '100%'}}>
      <HeaderBar showHome showBack />

      <div className="container mt-4">
        {error && <div className="alert alert-danger" style={{marginBottom:20}}>{error}</div>}
        {success && (
          <div className="alert alert-success d-flex align-items-center" style={{marginBottom:20,fontSize:15,fontWeight:500}}>
            <span style={{fontSize:20,marginRight:10}}>✅</span>
            {success}
          </div>
        )}
        
        <div className="row g-3">
          {/* Left Column - Faculty Information */}
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-3" style={{borderBottom:'1px solid #e0e0e0',paddingBottom:16}}>
                  <div>
                    <div style={{width:80,height:80,borderRadius:40,overflow:'hidden',background:'#e0e7ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,color:'#6366f1',fontWeight:600}}>
                      {form.profile_picture ? (
                        <img src={form.profile_picture} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        initials || '?'
                      )}
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <h4 className="mb-1" style={{fontSize:24,fontWeight:600}}>{fullName || 'Faculty Name'}</h4>
                    <div className="text-muted mb-1">{form.position || 'Professor'}</div>
                    <div className="text-muted" style={{fontSize:14}}>{form.department || 'Department'}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <p style={{color:'#555',lineHeight:1.6,fontSize:14}}>
                    {form.bio || 'No biography available.'}
                  </p>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <span style={{fontSize:16}}>📧</span>
                      <div style={{fontSize:14}}>
                        <div style={{fontWeight:500,color:'#888',fontSize:12}}>Email</div>
                        <div>{form.email || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <span style={{fontSize:16}}>📞</span>
                      <div style={{fontSize:14}}>
                        <div style={{fontWeight:500,color:'#888',fontSize:12}}>Phone</div>
                        <div>{form.phone || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <span style={{fontSize:16}}>📍</span>
                      <div style={{fontSize:14}}>
                        <div style={{fontWeight:500,color:'#888',fontSize:12}}>Office Location</div>
                        <div>{form.office_location || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-2">
                      <span style={{fontSize:16}}>🕐</span>
                      <div style={{fontSize:14}}>
                        <div style={{fontWeight:500,color:'#888',fontSize:12}}>Office Hours</div>
                        <div>{form.office_hours || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {form.office_hours && (
                  <div className="alert alert-light" style={{fontSize:13,padding:'8px 12px'}}>
                    <strong>Office Hours:</strong> {form.office_hours}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3" style={{fontSize:16,fontWeight:600}}>📊 Quick Stats</h5>
                
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{color:'#666',fontSize:14}}>Years of Experience</span>
                  <span style={{fontWeight:600,fontSize:18,color:'#4f46e5'}}>{form.years_experience || '-'}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{color:'#666',fontSize:14}}>At University Since</span>
                  <span style={{fontWeight:600,fontSize:18,color:'#4f46e5'}}>{form.at_university_since || '-'}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{color:'#666',fontSize:14}}>Publications</span>
                  <span style={{fontWeight:600,fontSize:18,color:'#4f46e5'}}>{form.publications || '-'}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{color:'#666',fontSize:14}}>Courses Teaching</span>
                  <span style={{fontWeight:600,fontSize:18,color:'#4f46e5'}}>{form.courses_teaching || '-'}</span>
                </div>

                {researchAreas.length > 0 && (
                  <>
                    <h6 style={{fontSize:14,fontWeight:600,marginTop:20,marginBottom:12}}>Research Areas</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {researchAreas.map((area, idx) => (
                        <span key={idx} className="badge" style={{background:'#4f46e5',color:'white',fontSize:12,padding:'6px 12px'}}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="card mt-3">
          <div className="card-header" style={{background:'#f8f9fa',borderBottom:'1px solid #dee2e6'}}>
            <ul className="nav nav-tabs card-header-tabs" style={{border:'none'}}>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                  style={{border:'none',background:'none',color: activeTab === 'overview' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'overview' ? 600 : 400}}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                  onClick={() => setActiveTab('education')}
                  style={{border:'none',background:'none',color: activeTab === 'education' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'education' ? 600 : 400}}
                >
                  Education
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'research' ? 'active' : ''}`}
                  onClick={() => setActiveTab('research')}
                  style={{border:'none',background:'none',color: activeTab === 'research' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'research' ? 600 : 400}}
                >
                  Research
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'teaching' ? 'active' : ''}`}
                  onClick={() => setActiveTab('teaching')}
                  style={{border:'none',background:'none',color: activeTab === 'teaching' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'teaching' ? 600 : 400}}
                >
                  Teaching
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'service' ? 'active' : ''}`}
                  onClick={() => setActiveTab('service')}
                  style={{border:'none',background:'none',color: activeTab === 'service' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'service' ? 600 : 400}}
                >
                  Service
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'edit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('edit')}
                  style={{border:'none',background:'none',color: activeTab === 'edit' ? '#4f46e5' : '#6c757d',fontWeight: activeTab === 'edit' ? 600 : 400}}
                >
                  ✏️ Edit Profile
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            {activeTab === 'overview' && (
              <div className="row">
                <div className="col-md-6">
                  <h6 style={{fontSize:16,fontWeight:600,marginBottom:16}}>🏆 Recent Achievements</h6>
                  {achievementsList.length > 0 ? (
                    <ul style={{listStyle:'none',padding:0}}>
                      {achievementsList.map((achievement, idx) => (
                        <li key={idx} className="mb-2" style={{display:'flex',gap:8}}>
                          <span style={{color:'#fbbf24',fontSize:16}}>⭐</span>
                          <span style={{fontSize:14}}>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No achievements listed yet.</p>
                  )}
                </div>
                
                <div className="col-md-6">
                  <h6 style={{fontSize:16,fontWeight:600,marginBottom:16}}>💼 Expertise</h6>
                  {expertiseList.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {expertiseList.map((skill, idx) => (
                        <span key={idx} className="badge" style={{background:'#f3f4f6',color:'#374151',fontSize:13,padding:'8px 16px',fontWeight:500}}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No expertise areas listed yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="mb-0" style={{fontSize:18,fontWeight:600,color:'#4f46e5'}}>🎓 Education Background</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => openEducationModal()}>
                    ➕ Add Education
                  </button>
                </div>
                {educationList.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-3">No education records yet</p>
                    <button className="btn btn-outline-primary" onClick={() => openEducationModal()}>
                      Add Your First Education Entry
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {educationList.map(item => (
                      <div key={item.id} className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0" style={{fontSize:16,fontWeight:600,color:'#4f46e5'}}>{item.degree}</h6>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openEducationModal(item)}>✏️</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEducation(item.id)}>🗑️</button>
                              </div>
                            </div>
                            <p className="mb-1" style={{fontSize:14,fontWeight:500}}>{item.institution}</p>
                            {item.field && <p className="mb-1 text-muted" style={{fontSize:13}}>Field: {item.field}</p>}
                            {item.year && <p className="mb-0 text-muted" style={{fontSize:13}}>Year: {item.year}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'research' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="mb-0" style={{fontSize:18,fontWeight:600,color:'#4f46e5'}}>🔬 Research & Publications</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => openResearchModal()}>
                    ➕ Add Research
                  </button>
                </div>
                {researchList.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-3">No research records yet</p>
                    <button className="btn btn-outline-primary" onClick={() => openResearchModal()}>
                      Add Your First Research Entry
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {researchList.map(item => (
                      <div key={item.id} className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div style={{flex:1}}>
                                <h6 className="mb-1" style={{fontSize:16,fontWeight:600,color:'#4f46e5'}}>{item.title}</h6>
                                {item.type && <span className="badge bg-info me-2">{item.type}</span>}
                                {item.year && <span className="badge bg-secondary">{item.year}</span>}
                              </div>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openResearchModal(item)}>✏️</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteResearch(item.id)}>🗑️</button>
                              </div>
                            </div>
                            {item.description && <p className="mb-0 mt-2 text-muted" style={{fontSize:14}}>{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'teaching' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="mb-0" style={{fontSize:18,fontWeight:600,color:'#4f46e5'}}>👨‍🏫 Teaching Experience</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => openTeachingModal()}>
                    ➕ Add Course
                  </button>
                </div>
                {teachingList.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-3">No teaching records yet</p>
                    <button className="btn btn-outline-primary" onClick={() => openTeachingModal()}>
                      Add Your First Teaching Entry
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {teachingList.map(item => (
                      <div key={item.id} className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div style={{flex:1}}>
                                <h6 className="mb-1" style={{fontSize:16,fontWeight:600,color:'#4f46e5'}}>{item.course}</h6>
                                {item.code && <p className="mb-1 text-muted" style={{fontSize:13}}>Code: {item.code}</p>}
                              </div>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openTeachingModal(item)}>✏️</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTeaching(item.id)}>🗑️</button>
                              </div>
                            </div>
                            {item.semester && item.year && (
                              <p className="mb-1 text-muted" style={{fontSize:13}}>{item.semester} {item.year}</p>
                            )}
                            {item.students && <p className="mb-0 text-muted" style={{fontSize:13}}>Students: {item.students}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'service' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="mb-0" style={{fontSize:18,fontWeight:600,color:'#4f46e5'}}>🤝 Service & Contributions</h6>
                  <button className="btn btn-sm btn-primary" onClick={() => openServiceModal()}>
                    ➕ Add Service
                  </button>
                </div>
                {serviceList.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-3">No service records yet</p>
                    <button className="btn btn-outline-primary" onClick={() => openServiceModal()}>
                      Add Your First Service Entry
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {serviceList.map(item => (
                      <div key={item.id} className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div style={{flex:1}}>
                                <h6 className="mb-1" style={{fontSize:16,fontWeight:600,color:'#4f46e5'}}>{item.role}</h6>
                                <p className="mb-1" style={{fontSize:14,fontWeight:500}}>{item.organization}</p>
                                {(item.startYear || item.endYear) && (
                                  <p className="mb-1 text-muted" style={{fontSize:13}}>
                                    {item.startYear || '?'} - {item.endYear || 'Present'}
                                  </p>
                                )}
                              </div>
                              <div className="d-flex gap-1">
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openServiceModal(item)}>✏️</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteService(item.id)}>🗑️</button>
                              </div>
                            </div>
                            {item.description && <p className="mb-0 mt-2 text-muted" style={{fontSize:14}}>{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'edit' && (
              <form onSubmit={onSave}>
                {/* Header with Exit Button */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{borderBottom:'2px solid #e0e0e0'}}>
                  <h5 className="mb-0" style={{color:'#4f46e5',fontSize:18,fontWeight:600}}>✏️ Edit Profile</h5>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setActiveTab('overview')}
                    style={{display:'flex',alignItems:'center',gap:6}}
                  >
                    <span>✕</span>
                    <span>Exit</span>
                  </button>
                </div>

                {/* Profile Picture Section */}
                <div className="text-center mb-4" style={{paddingBottom:24,borderBottom:'1px solid #e0e0e0'}}>
                  <div style={{width:120,height:120,borderRadius:60,overflow:'hidden',margin:'0 auto 16px',background:'#e0e7ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {form.profile_picture ? (
                      <img src={form.profile_picture} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    ) : (
                      <span style={{fontSize:48,color:'#6366f1'}}>{initials || '?'}</span>
                    )}
                  </div>
                  <div>
                    <label className="btn btn-sm btn-primary me-2" style={{cursor:'pointer'}}>
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{display:'none'}} disabled={uploadingImage} />
                    </label>
                    {form.profile_picture && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDeleteImage} disabled={uploadingImage}>
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <h6 className="mb-3" style={{color:'#4f46e5',fontSize:15,fontWeight:600}}>Basic Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>First Name <span style={{color:'#dc3545'}}>*</span></label>
                    <input 
                      className="form-control" 
                      value={form.first_name} 
                      onChange={e => handleChange('first_name', e.target.value)} 
                      placeholder="Abby"
                      required 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Middle Name</label>
                    <input 
                      className="form-control" 
                      value={form.middle_name} 
                      onChange={e => handleChange('middle_name', e.target.value)} 
                      placeholder="Brongcano"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Last Name <span style={{color:'#dc3545'}}>*</span></label>
                    <input 
                      className="form-control" 
                      value={form.last_name} 
                      onChange={e => handleChange('last_name', e.target.value)} 
                      placeholder="Auxtero"
                      required 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Position</label>
                    <input 
                      className="form-control" 
                      value={form.position} 
                      onChange={e => handleChange('position', e.target.value)} 
                      placeholder="Professor" 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Department</label>
                    <input 
                      className="form-control" 
                      value={form.department} 
                      onChange={e => handleChange('department', e.target.value)} 
                      placeholder="Computer Science Department" 
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Employee ID</label>
                    <input 
                      className="form-control" 
                      value={form.employee_id} 
                      onChange={e => handleChange('employee_id', e.target.value)} 
                      placeholder="2344211" 
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <h6 className="mb-3" style={{color:'#4f46e5',fontSize:15,fontWeight:600}}>Contact Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={form.email} 
                      onChange={e => handleChange('email', e.target.value)} 
                      placeholder="auxtero@fau.edu.ph" 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Phone</label>
                    <input 
                      className="form-control" 
                      value={form.phone} 
                      onChange={e => handleChange('phone', e.target.value)} 
                      placeholder="+1 (555) 123-4567" 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Office Location</label>
                    <input 
                      className="form-control" 
                      value={form.office_location} 
                      onChange={e => handleChange('office_location', e.target.value)} 
                      placeholder="CS Building, Room 305" 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Office Hours</label>
                    <input 
                      className="form-control" 
                      value={form.office_hours} 
                      onChange={e => handleChange('office_hours', e.target.value)} 
                      placeholder="Mon & Wed 2:00-4:00 PM" 
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <h6 className="mb-3" style={{color:'#4f46e5',fontSize:15,fontWeight:600}}>Professional Information</h6>
                <div className="row g-3 mb-4">
                  <div className="col-md-12">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Biography</label>
                    <textarea 
                      className="form-control" 
                      rows={4} 
                      value={form.bio} 
                      onChange={e => handleChange('bio', e.target.value)} 
                      placeholder="Brief biography about your background and research..."
                      style={{fontSize:13,color:'#666'}}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Years of Experience</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={form.years_experience} 
                      onChange={e => handleChange('years_experience', e.target.value)} 
                      placeholder="14" 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>At University Since</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={form.at_university_since} 
                      onChange={e => handleChange('at_university_since', e.target.value)} 
                      placeholder="2012" 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Publications</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={form.publications} 
                      onChange={e => handleChange('publications', e.target.value)} 
                      placeholder="45" 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Courses Teaching</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={form.courses_teaching} 
                      onChange={e => handleChange('courses_teaching', e.target.value)} 
                      placeholder="4" 
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Research Areas (comma-separated)</label>
                    <input 
                      className="form-control" 
                      value={form.research_areas} 
                      onChange={e => handleChange('research_areas', e.target.value)} 
                      placeholder="Machine Learning, Data Mining, Computer Vision"
                      style={{fontSize:13,color:'#0066cc'}}
                    />
                    <small className="text-muted">Separate multiple areas with commas</small>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Expertise (comma-separated)</label>
                    <input 
                      className="form-control" 
                      value={form.expertise} 
                      onChange={e => handleChange('expertise', e.target.value)} 
                      placeholder="Python, TensorFlow, PyTorch, R, Java, C++"
                      style={{fontSize:13,color:'#666'}}
                    />
                    <small className="text-muted">Separate skills with commas</small>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label" style={{fontSize:14,fontWeight:500}}>Achievements (one per line)</label>
                    <textarea 
                      className="form-control" 
                      rows={5} 
                      value={form.achievements} 
                      onChange={e => handleChange('achievements', e.target.value)} 
                      placeholder="NSF CAREER Award Recipient (2018)&#10;Best Paper Award at ICML 2019&#10;Outstanding Teaching Award (2020)"
                      style={{fontSize:13,color:'#666'}}
                    />
                    <small className="text-muted">Enter each achievement on a new line</small>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 pt-3" style={{borderTop:'1px solid #e0e0e0'}}>
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setActiveTab('overview')}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Education Modal */}
      {showEducationModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowEducationModal(false)}>
          <div className="card" style={{width:500,maxWidth:'90%'}} onClick={e => e.stopPropagation()}>
            <div className="card-body">
              <h5 className="card-title mb-4">{editingEducation ? 'Edit Education' : 'Add Education'}</h5>
              <div className="mb-3">
                <label className="form-label">Degree <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., PhD in Computer Science" value={educationForm.degree} onChange={e => setEducationForm({...educationForm, degree:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Institution <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., University of the Philippines" value={educationForm.institution} onChange={e => setEducationForm({...educationForm, institution:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Field of Study</label>
                <input type="text" className="form-control" placeholder="e.g., Artificial Intelligence" value={educationForm.field} onChange={e => setEducationForm({...educationForm, field:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Year Graduated</label>
                <input type="text" className="form-control" placeholder="e.g., 2015" value={educationForm.year} onChange={e => setEducationForm({...educationForm, year:e.target.value})} />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowEducationModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEducation}>{editingEducation ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Research Modal */}
      {showResearchModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowResearchModal(false)}>
          <div className="card" style={{width:500,maxWidth:'90%'}} onClick={e => e.stopPropagation()}>
            <div className="card-body">
              <h5 className="card-title mb-4">{editingResearch ? 'Edit Research' : 'Add Research'}</h5>
              <div className="mb-3">
                <label className="form-label">Title <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., Deep Learning for Image Recognition" value={researchForm.title} onChange={e => setResearchForm({...researchForm, title:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Type</label>
                <select className="form-select" value={researchForm.type} onChange={e => setResearchForm({...researchForm, type:e.target.value})}>
                  <option value="">Select type...</option>
                  <option value="Journal Paper">Journal Paper</option>
                  <option value="Conference Paper">Conference Paper</option>
                  <option value="Book Chapter">Book Chapter</option>
                  <option value="Research Project">Research Project</option>
                  <option value="Thesis">Thesis</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Year</label>
                <input type="text" className="form-control" placeholder="e.g., 2023" value={researchForm.year} onChange={e => setResearchForm({...researchForm, year:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Brief description of the research" value={researchForm.description} onChange={e => setResearchForm({...researchForm, description:e.target.value})} />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowResearchModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveResearch}>{editingResearch ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teaching Modal */}
      {showTeachingModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowTeachingModal(false)}>
          <div className="card" style={{width:500,maxWidth:'90%'}} onClick={e => e.stopPropagation()}>
            <div className="card-body">
              <h5 className="card-title mb-4">{editingTeaching ? 'Edit Course' : 'Add Course'}</h5>
              <div className="mb-3">
                <label className="form-label">Course Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., Data Structures and Algorithms" value={teachingForm.course} onChange={e => setTeachingForm({...teachingForm, course:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Course Code</label>
                <input type="text" className="form-control" placeholder="e.g., CS201" value={teachingForm.code} onChange={e => setTeachingForm({...teachingForm, code:e.target.value})} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Semester</label>
                  <select className="form-select" value={teachingForm.semester} onChange={e => setTeachingForm({...teachingForm, semester:e.target.value})}>
                    <option value="">Select...</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Year</label>
                  <input type="text" className="form-control" placeholder="e.g., 2024" value={teachingForm.year} onChange={e => setTeachingForm({...teachingForm, year:e.target.value})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Number of Students</label>
                <input type="text" className="form-control" placeholder="e.g., 45" value={teachingForm.students} onChange={e => setTeachingForm({...teachingForm, students:e.target.value})} />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowTeachingModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveTeaching}>{editingTeaching ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowServiceModal(false)}>
          <div className="card" style={{width:500,maxWidth:'90%'}} onClick={e => e.stopPropagation()}>
            <div className="card-body">
              <h5 className="card-title mb-4">{editingService ? 'Edit Service' : 'Add Service'}</h5>
              <div className="mb-3">
                <label className="form-label">Role/Position <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., Committee Chair" value={serviceForm.role} onChange={e => setServiceForm({...serviceForm, role:e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Organization <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., IEEE Computer Society" value={serviceForm.organization} onChange={e => setServiceForm({...serviceForm, organization:e.target.value})} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Year</label>
                  <input type="text" className="form-control" placeholder="e.g., 2020" value={serviceForm.startYear} onChange={e => setServiceForm({...serviceForm, startYear:e.target.value})} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">End Year</label>
                  <input type="text" className="form-control" placeholder="Present or year" value={serviceForm.endYear} onChange={e => setServiceForm({...serviceForm, endYear:e.target.value})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Brief description of responsibilities" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description:e.target.value})} />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveService}>{editingService ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
