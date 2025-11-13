import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import HeaderBar from './HeaderBar';

export default function StudentForm() {
  const { id } = useParams(); // optional id for edit
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', middle_name: '', student_id: '', email: '', gpa: '', attendance: '', at_risk: false, active: true, profile_picture: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      (async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('portal_token');
          const headers = token ? { 'X-Portal-Auth': token } : {};
          const res = await axios.get(`/api/profiles/${id}`, { headers });
          setForm({
            first_name: res.data.first_name || res.data.fname || '',
            last_name: res.data.last_name || res.data.lname || '',
            middle_name: res.data.middle_name || '',
            student_id: res.data.student_id || '',
            email: res.data.email || '',
            gpa: res.data.gpa ?? '',
            attendance: res.data.attendance ?? '',
            at_risk: !!res.data.at_risk,
            active: res.data.active === null ? true : !!res.data.active,
            profile_picture: res.data.profile_picture || ''
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load student');
        } finally { setLoading(false); }
      })();
    }
  }, [id]);

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
          type: 'student'
        }, { headers });
        
        if (res.data.success) {
          setForm(prev => ({ ...prev, profile_picture: res.data.path }));
          setSuccess('Image uploaded successfully!');
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
    if (!confirm('Are you sure you want to delete this profile picture?')) return;
    
    setForm(prev => ({ ...prev, profile_picture: '' }));
    setSuccess('Profile picture will be deleted when you save');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};

      // prepare payload and coerce numeric values; send null for empty
      const payload = { ...form };
      payload.gpa = (payload.gpa === '' || payload.gpa === null || payload.gpa === undefined) ? null : parseFloat(payload.gpa);
      payload.attendance = (payload.attendance === '' || payload.attendance === null || payload.attendance === undefined) ? null : parseInt(payload.attendance, 10);
      payload.at_risk = !!payload.at_risk;
      payload.active = !!payload.active;

      if (id && id !== 'new') {
        const res = await axios.put(`/api/profiles/${id}`, payload, { headers });
        navigate(`/profile/${res.data.id}`);
      } else {
        const res = await axios.post('/api/profiles', payload, { headers });
        navigate(`/profile/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container p-0" style={{maxWidth: '100%'}}>
      <HeaderBar showHome showBack />

      <div className="container p-4">
      <div className="card p-3">
        <h4 className="mb-3">{id && id !== 'new' ? 'Edit Student' : 'Add Student'}</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="mb-3 text-center">
          <div style={{width:100,height:100,borderRadius:50,overflow:'hidden',margin:'0 auto',background:'#e0e7ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {form.profile_picture ? (
              <img src={form.profile_picture} alt="Student" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              <span style={{fontSize:40,color:'#6366f1'}}>{form.first_name ? form.first_name.charAt(0).toUpperCase() : '?'}</span>
            )}
          </div>
          <div className="mt-2">
            <label className="btn btn-sm btn-outline-primary me-2" style={{cursor:'pointer'}}>
              {uploadingImage ? 'Uploading...' : 'Add Photo'}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{display:'none'}} disabled={uploadingImage} />
            </label>
            {form.profile_picture && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDeleteImage} disabled={uploadingImage}>
                Delete Photo
              </button>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-2">
              <input className="form-control" placeholder="First name" value={form.first_name} onChange={e => handleChange('first_name', e.target.value)} required />
            </div>
            <div className="col-md-4 mb-2">
              <input className="form-control" placeholder="Last name" value={form.last_name} onChange={e => handleChange('last_name', e.target.value)} />
            </div>
            <div className="col-md-4 mb-2">
              <input className="form-control" placeholder="Middle name" value={form.middle_name} onChange={e => handleChange('middle_name', e.target.value)} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-2">
              <input className="form-control" placeholder="Student ID" value={form.student_id} onChange={e => handleChange('student_id', e.target.value)} />
            </div>
            <div className="col-md-4 mb-2">
              <input className="form-control" placeholder="Email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="col-md-2 mb-2">
              <input className="form-control" type="number" step="0.01" min="0" max="4" placeholder="GPA" value={form.gpa} onChange={e => handleChange('gpa', e.target.value)} />
            </div>
            <div className="col-md-2 mb-2">
              <input className="form-control" type="number" step="1" min="0" max="100" placeholder="Attendance %" value={form.attendance} onChange={e => handleChange('attendance', e.target.value)} />
            </div>
          </div>

          <div className="form-check form-switch mb-3">
            <input className="form-check-input" type="checkbox" checked={form.at_risk} onChange={e => handleChange('at_risk', e.target.checked)} id="atRisk" />
            <label className="form-check-label" htmlFor="atRisk">At Risk</label>
          </div>

          <div className="form-check form-switch mb-3">
            <input className="form-check-input" type="checkbox" checked={form.active} onChange={e => handleChange('active', e.target.checked)} id="active" />
            <label className="form-check-label" htmlFor="active">Active</label>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
