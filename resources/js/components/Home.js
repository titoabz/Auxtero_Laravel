import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('portal_token');
        const headers = token ? { 'X-Portal-Auth': token } : {};
        const res = await axios.get('/api/students/all', { headers });

        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setProfiles(data);
      } catch (err) {
        console.error('Failed to load profiles', err);
        setError(err.response?.data?.message || 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, []);

  // Stats calculation
  const total = profiles.length;
  const activeCount = profiles.filter(p => p.active || p.status === 'active').length;
  // At-risk: GPA < 2.0 or attendance < 75
  const atRiskCount = profiles.filter(p => {
    const gpa = parseFloat(p.gpa);
    const att = parseFloat(p.attendance);
    return (!Number.isNaN(gpa) && gpa < 2.0) || (!Number.isNaN(att) && att < 60) || p.at_risk;
  }).length;
  const gpaValues = profiles.map(p => parseFloat(p.gpa)).filter(n => !Number.isNaN(n));
  const avgGpa = gpaValues.length ? (gpaValues.reduce((a,b) => a + b, 0) / gpaValues.length) : null;

  const stats = [
    { title: 'Total of Students', value: total, subtitle: 'Currently Enrolled' },
    { title: 'Active Students', value: activeCount, subtitle: 'On Track' },
    { title: 'At Risk', value: atRiskCount, subtitle: 'Need Attention' },
    { title: 'Average GPA', value: avgGpa ? avgGpa.toFixed(2) : '-', subtitle: 'Class Average' }
  ];

  // Recent activity: read from localStorage where we store viewed students
  const viewedRaw = localStorage.getItem('viewed_students');
  let viewed = [];
  try { viewed = viewedRaw ? JSON.parse(viewedRaw) : []; } catch(e) { viewed = []; }

  // ===== Calendar & Events state =====
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [addForm, setAddForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'event',
    description: ''
  });

  function fmtDateISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getMonthMatrix(date) {
    // returns array of weeks, each week is 7 Date objects (may include prev/next month days)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startWeekDay = firstDay.getDay(); // 0 Sun ... 6 Sat
    const totalDays = daysInMonth(date);
    const prevMonthLastDate = new Date(date.getFullYear(), date.getMonth(), 0);
    const prevMonthDays = prevMonthLastDate.getDate();

    const matrix = [];
    let dayCounter = 1;
    let nextMonthDay = 1;

    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        let cellDate;
        if (w === 0 && d < startWeekDay) {
          // days from previous month
          cellDate = new Date(date.getFullYear(), date.getMonth() - 1, prevMonthDays - startWeekDay + d + 1);
        } else if (dayCounter > totalDays) {
          // days from next month
          cellDate = new Date(date.getFullYear(), date.getMonth() + 1, nextMonthDay++);
        } else {
          cellDate = new Date(date.getFullYear(), date.getMonth(), dayCounter++);
        }
        week.push(cellDate);
      }
      matrix.push(week);
      if (dayCounter > totalDays && nextMonthDay > 7) break; // stop after filling potential last short week
    }
    return matrix;
  }

  function saveEvents(next) { setEvents(next); }

  function openAddEvent(date) {
    const initialDate = date ? new Date(date) : new Date();
    setAddForm({ title: '', date: fmtDateISO(initialDate), time: '', type: 'event', description: '' });
    setShowAddModal(true);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!addForm.title || !addForm.date) return;
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      const res = await axios.post('/api/events', {
        title: addForm.title,
        date: addForm.date,
        time: addForm.time || '',
        type: addForm.type || 'event',
        description: addForm.description || ''
      }, { headers });
      const created = res.data;
      const next = [...events, created].sort((a,b) => new Date(`${a.date} ${a.time||'00:00'}`) - new Date(`${b.date} ${b.time||'00:00'}`));
      saveEvents(next);
      setShowAddModal(false);
      setSelectedDate(new Date(created.date));
      setShowDayModal(true);
    } catch (err) {
      alert('Failed to add event');
      console.error(err);
    }
  }

  function eventsOn(date) {
    const key = typeof date === 'string' ? date : fmtDateISO(date);
    return events.filter(ev => ev.date === key);
  }

  function openDayEvents(date) {
    setSelectedDate(new Date(date));
    setShowDayModal(true);
  }

  async function removeEvent(id) {
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.delete(`/api/events/${id}`, { headers });
      const next = events.filter(e => e.id !== id);
      saveEvents(next);
    } catch (err) {
      alert('Failed to remove event');
      console.error(err);
    }
  }

  // Fetch events on mount
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('portal_token');
        const headers = token ? { 'X-Portal-Auth': token } : {};
        const res = await axios.get('/api/events', { headers });
        const list = Array.isArray(res.data) ? res.data : [];
        const sorted = list.sort((a,b) => new Date(`${a.date} ${a.time||'00:00'}`) - new Date(`${b.date} ${b.time||'00:00'}`));
        setEvents(sorted);
      } catch (err) {
        console.warn('Failed to load events', err);
      }
    })();
  }, []);

  // Map viewed IDs to profiles for display (most recent first)
  const recent = viewed
    .map(v => ({ ...v, profile: profiles.find(p => String(p.id) === String(v.id)) }))
    .filter(v => v.profile)
    .sort((a,b) => new Date(b.viewed_at) - new Date(a.viewed_at));

  // Logout is handled globally by HeaderBar

  async function toggleActive(profileId) {
    // Optimistic update locally
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, active: !p.active } : p));
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.put(`/api/students/${profileId}/status`, { active: profiles.find(p=>p.id===profileId)?.active ? false : true }, { headers });
    } catch (err) {
      console.warn('Failed to persist active toggle', err);
    }
  }

  async function markAtRisk(profileId, value) {
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, at_risk: value } : p));
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      await axios.put(`/api/students/${profileId}/status`, { at_risk: value }, { headers });
    } catch (err) {
      console.warn('Failed to persist at_risk toggle', err);
    }
  }

  function onViewProfile(profile) {
    // record view in localStorage
    const now = new Date().toISOString();
    const next = viewed.filter(v => String(v.id) !== String(profile.id));
    next.unshift({ 
      id: profile.id, 
      name: profile.full_name || profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(), 
      viewed_at: now,
      profile_picture: profile.profile_picture || ''
    });
    localStorage.setItem('viewed_students', JSON.stringify(next.slice(0, 20)));
    navigate(`/profile/${profile.id}`);
  }

  return (
    <div className="home p-0" style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <HeaderBar showHome={false} showBack={false} />
      <div style={{flex:1}}>
      <div className="container p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {(() => {
              const raw = localStorage.getItem('faculty_name') || '';
              const first = raw ? (raw.split(/[.\s@_-]+/)[0] || raw) : '';
              const display = first ? (first.charAt(0).toUpperCase() + first.slice(1)) : 'Faculty';
              return <h1 className="h2">Welcome Back, {display}</h1>;
            })()}
            <p className="text-muted">Here's an overview of your student's progress</p>
          </div>
          <div className="d-flex align-items-center">
            <button 
              className={`btn me-2 ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`btn me-2 ${activeTab === 'students' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
            <button 
              className={`btn me-2 ${activeTab === 'alerts' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alerts
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="dashboard-cards mb-4">
              {stats.map((s, idx) => (
                <div key={idx} className="card p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="card-title">{s.title}</div>
                      <div className="card-text mt-2">{s.value}</div>
                      <div className="text-muted small">{s.subtitle}</div>
                    </div>
                    <div>
                      <div style={{width:28,height:28,borderRadius:14,background:'#eef2ff'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-3">
              <h5 className="mb-3">Recent Student Activity</h5>
              <p className="text-muted small">Latest Update From Your Students</p>

              <div className="mt-3">
                {recent.length === 0 && <div className="text-muted">No recent activity yet — view a student profile to populate this list.</div>}
                {recent.map((v, i) => (
                  <div key={v.id || i} className="card mb-2 p-2" style={{borderRadius:8}}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div style={{width:48,height:48,borderRadius:24,background:'#e6e9ef',marginRight:12,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {(v.profile_picture || v.profile?.profile_picture) ? (
                            <img src={v.profile_picture || v.profile?.profile_picture} alt={v.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          ) : (
                            <span style={{fontSize:20,color:'#6366f1',fontWeight:600}}>{v.name ? v.name.charAt(0).toUpperCase() : '?'}</span>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold">{v.name}</div>
                          <div className="text-muted small">Viewed {new Date(v.viewed_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <button className="btn btn-sm" onClick={() => navigate(`/profile/${v.id}`)}>View Profile</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar & Upcoming Events */}
            <div className="card p-3 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Calendar</h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>&larr; Previous</button>
                  <strong className="me-2">{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</strong>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>Next &rarr;</button>
                </div>
              </div>

              <div className="row">
                {/* Calendar grid */}
                <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                  <div className="table-responsive">
                    <table className="table table-bordered" style={{tableLayout:'fixed'}}>
                      <thead>
                        <tr>
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (<th key={d} className="text-center small">{d}</th>))}
                        </tr>
                      </thead>
                      <tbody>
                        {getMonthMatrix(currentMonth).map((week, wi) => (
                          <tr key={wi}>
                            {week.map((d, di) => {
                              const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
                              const todaysEvents = eventsOn(d);
                              const isToday = fmtDateISO(d) === fmtDateISO(new Date());
                              return (
                                <td key={di} onClick={() => openDayEvents(d)} style={{cursor:'pointer', background: isCurrentMonth ? (isToday ? '#eef7ff' : 'white') : '#fafafa', verticalAlign:'top', height:100}}>
                                  <div className="d-flex justify-content-between align-items-start">
                                    <span className="small" style={{opacity: isCurrentMonth ? 1 : 0.5}}>{d.getDate()}</span>
                                  </div>
                                  {/* show up to 2 events */}
                                  <div className="mt-1">
                                    {todaysEvents.slice(0,2).map(ev => (
                                      <div key={ev.id} className="badge me-1 mb-1" style={{background: ev.type==='exam' ? '#ffdddd' : ev.type==='meeting' ? '#ddf5ff' : '#e9f5e9', color:'#333'}}>
                                        {ev.title}
                                      </div>
                                    ))}
                                    {todaysEvents.length > 2 && (
                                      <div className="small text-muted">+{todaysEvents.length - 2} more</div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Upcoming events sidebar */}
                <div className="col-12 col-lg-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="m-0">Upcoming Events</h6>
                    <button className="btn btn-sm btn-primary" onClick={() => openAddEvent(selectedDate)}>Add Event</button>
                  </div>
                  <div>
                    {(() => {
                      const todayKey = fmtDateISO(new Date());
                      const upcoming = events
                        .filter(e => e.date >= todayKey)
                        .sort((a,b) => new Date(`${a.date} ${a.time||'00:00'}`) - new Date(`${b.date} ${b.time||'00:00'}`))
                        .slice(0, 10);
                      if (upcoming.length === 0) return <div className="text-muted">No upcoming events</div>;
                      return upcoming.map(ev => (
                        <div key={ev.id} className="border rounded p-2 mb-2">
                          <div className="fw-bold">{ev.title}</div>
                          <div className="small text-muted">{new Date(`${ev.date}T${(ev.time||'00:00')}`).toLocaleString()}</div>
                          <span className="badge mt-1" style={{background: ev.type==='exam' ? '#ffcccc' : ev.type==='meeting' ? '#ccecff' : '#dff5d8', color:'#333'}}>{ev.type}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Students</h5>
              </div>
              {loading && <div>Loading students...</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{width:60}}></th>
                        <th>Name</th>
                        <th>GPA</th>
                        <th>Attendance</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{width:36,height:36,borderRadius:18,background:'#e6e9ef',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              {p.profile_picture ? (
                                <img src={p.profile_picture} alt={p.full_name || p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                              ) : (
                                <span style={{fontSize:14,color:'#6366f1',fontWeight:600}}>
                                  {(p.full_name || p.name || p.first_name || '?').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{p.full_name || p.name || `${p.first_name || ''} ${p.last_name || ''}`}</td>
                          <td>{(p.gpa !== null && p.gpa !== undefined && p.gpa !== '') ? Number(p.gpa).toFixed(2) : '-'}</td>
                          <td>{(p.attendance !== null && p.attendance !== undefined && p.attendance !== '') ? `${parseInt(p.attendance, 10)}%` : '-'}</td>
                          <td>
                            {p.at_risk ? <span className="badge bg-warning text-dark">At Risk</span> : p.active ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onViewProfile(p)}>View</button>
                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => toggleActive(p.id)}>{p.active ? 'Deactivate' : 'Activate'}</button>
                            <button className="btn btn-sm btn-outline-warning" onClick={() => markAtRisk(p.id, !p.at_risk)}>{p.at_risk ? 'Clear Risk' : 'Mark At Risk'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="card p-3 student-alerts">
            <h5 className="mb-1">Student Alerts</h5>
            <p className="text-muted small mb-3">Student's Requiring Immediate Attention</p>
            <div className="alert-list">
              {profiles
                .filter(p => {
                  const gpa = p.gpa !== null && p.gpa !== undefined && p.gpa !== '' ? parseFloat(p.gpa) : null;
                  const att = p.attendance !== null && p.attendance !== undefined && p.attendance !== '' ? parseInt(p.attendance, 10) : null;
                  return p.at_risk || (gpa !== null && gpa < 2) || (att !== null && att < 75);
                })
                .map(p => {
                  const name = (p.full_name || p.name || `${p.first_name || p.fname || ''} ${p.last_name || p.lname || ''}`).trim() || '—';
                  const issues = [];
                  const gpa = p.gpa !== null && p.gpa !== undefined && p.gpa !== '' ? parseFloat(p.gpa) : null;
                  const att = p.attendance !== null && p.attendance !== undefined && p.attendance !== '' ? parseInt(p.attendance, 10) : null;
                  if (att !== null && att < 75) issues.push('⚠ Low attendance');
                  if (gpa !== null && gpa < 2) issues.push('⚠ Failing Grade Alert');
                  if (p.at_risk && issues.length === 0) issues.push('⚠ Manual At-Risk Flag');
                  return (
                    <div key={p.id} className="alert-item">
                      <div className="alert-avatar" style={{width:48,height:48,borderRadius:24,background:'#e6e9ef',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {p.profile_picture ? (
                          <img src={p.profile_picture} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        ) : (
                          <span style={{fontSize:20,color:'#6366f1',fontWeight:600}}>
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="alert-info">
                        <div className="alert-name fw-bold mb-1">{name}</div>
                        {issues.map((msg, i) => (
                          <div key={i} className="alert-issue text-danger small">{msg}</div>
                        ))}
                      </div>
                      <div className="ms-auto">
                        <button className="btn btn-sm btn-light" onClick={() => navigate(`/profile/${p.id}`)}>View Profile</button>
                      </div>
                    </div>
                  );
                })}
              {profiles.filter(p => {
                const gpa = p.gpa !== null && p.gpa !== undefined && p.gpa !== '' ? parseFloat(p.gpa) : null;
                const att = p.attendance !== null && p.attendance !== undefined && p.attendance !== '' ? parseInt(p.attendance, 10) : null;
                return p.at_risk || (gpa !== null && gpa < 2) || (att !== null && att < 75);
              }).length === 0 && (
                <div className="text-muted">No current alerts</div>
              )}
            </div>
          </div>
        )}

      </div>
      </div>
      {/* Lightweight modals */}
      {showAddModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.4)', zIndex:1050}}>
          <div className="card" style={{maxWidth:520, margin:'10% auto', padding:16}}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0">Add Event</h5>
              <button className="btn btn-sm btn-light" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-2">
                <label className="form-label">Title</label>
                <input className="form-control" value={addForm.title} onChange={e=>setAddForm(v=>({...v,title:e.target.value}))} required />
              </div>
              <div className="row">
                <div className="col-6 mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={addForm.date} onChange={e=>setAddForm(v=>({...v,date:e.target.value}))} required />
                </div>
                <div className="col-6 mb-2">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" value={addForm.time} onChange={e=>setAddForm(v=>({...v,time:e.target.value}))} />
                </div>
              </div>
              <div className="mb-2">
                <label className="form-label">Type</label>
                <select className="form-select" value={addForm.type} onChange={e=>setAddForm(v=>({...v,type:e.target.value}))}>
                  <option value="event">event</option>
                  <option value="exam">exam</option>
                  <option value="meeting">meeting</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-control" rows={3} value={addForm.description} onChange={e=>setAddForm(v=>({...v,description:e.target.value}))}></textarea>
              </div>
              <div className="text-end">
                <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDayModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.4)', zIndex:1050}} onClick={() => setShowDayModal(false)}>
          <div className="card" style={{maxWidth:560, margin:'10% auto', padding:16}} onClick={e=>e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0">Events on {fmtDateISO(selectedDate)}</h5>
              <button className="btn btn-sm btn-primary" onClick={() => openAddEvent(selectedDate)}>Add</button>
            </div>
            <div>
              {eventsOn(selectedDate).length === 0 && (
                <div className="text-muted">No events for this day</div>
              )}
              {eventsOn(selectedDate).map(ev => (
                <div key={ev.id} className="border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{ev.title}</div>
                      <div className="small text-muted">{new Date(`${ev.date}T${(ev.time||'00:00')}`).toLocaleString()} • {ev.type}</div>
                      {ev.description && <div className="small mt-1">{ev.description}</div>}
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeEvent(ev.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-end">
              <button className="btn btn-light" onClick={() => setShowDayModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
