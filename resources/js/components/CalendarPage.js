import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './HeaderBar';

export default function CalendarPage() {
  const navigate = useNavigate();
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
      if (dayCounter > totalDays && nextMonthDay > 7) break;
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const today = new Date();
  const todayKey = fmtDateISO(today);
  const matrix = getMonthMatrix(currentMonth);

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  const upcoming = events
    .filter(e => e.date >= todayKey)
    .slice(0, 10);

  return (
    <>
      <HeaderBar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0">Calendar</h4>
                  <div>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={prevMonth}>
                      ← Previous
                    </button>
                    <span className="fw-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                    <button className="btn btn-sm btn-outline-secondary ms-2" onClick={nextMonth}>
                      Next →
                    </button>
                  </div>
                </div>

                <table className="table table-bordered text-center">
                  <thead>
                    <tr>
                      <th>Sun</th>
                      <th>Mon</th>
                      <th>Tue</th>
                      <th>Wed</th>
                      <th>Thu</th>
                      <th>Fri</th>
                      <th>Sat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((week, wi) => (
                      <tr key={wi}>
                        {week.map((cellDate, di) => {
                          const cellKey = fmtDateISO(cellDate);
                          const cellEvents = eventsOn(cellKey);
                          const isToday = cellKey === todayKey;
                          const isCurrentMonth = cellDate.getMonth() === currentMonth.getMonth();

                          return (
                            <td
                              key={di}
                              style={{
                                height: '100px',
                                verticalAlign: 'top',
                                background: isToday ? '#e6f2ff' : 'white',
                                cursor: 'pointer',
                                opacity: isCurrentMonth ? 1 : 0.5
                              }}
                              onClick={() => openDayEvents(cellDate)}
                            >
                              <div style={{ fontWeight: isToday ? 'bold' : 'normal', marginBottom: 5 }}>
                                {cellDate.getDate()}
                              </div>
                              {cellEvents.slice(0, 2).map(ev => (
                                <div
                                  key={ev.id}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 4px',
                                    margin: '2px 0',
                                    borderRadius: 3,
                                    background: ev.type === 'exam' ? '#dc3545' : '#17a2b8',
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {ev.title}
                                </div>
                              ))}
                              {cellEvents.length > 2 && (
                                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: 2 }}>
                                  +{cellEvents.length - 2} more
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0">Upcoming Events</h5>
                  <button className="btn btn-sm btn-primary" onClick={() => openAddEvent()}>Add Event</button>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-muted">No upcoming events</p>
                ) : (
                  <div>
                    {upcoming.map(event => (
                      <div key={event.id} className="border-bottom pb-2 mb-2">
                        <div className="fw-bold">{event.title}</div>
                        <div className="text-muted small">{event.date} {event.time && `at ${event.time}`}</div>
                        <span className={`badge ${event.type === 'exam' ? 'bg-danger' : 'bg-info'} mt-1`}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="card"
              style={{ width: 500, maxWidth: '90%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="card-body">
                <h5 className="card-title">Add Event</h5>
                <form onSubmit={handleAddSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addForm.title}
                      onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={addForm.date}
                      onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time (optional)</label>
                    <input
                      type="time"
                      className="form-control"
                      value={addForm.time}
                      onChange={e => setAddForm({ ...addForm, time: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={addForm.type}
                      onChange={e => setAddForm({ ...addForm, type: e.target.value })}
                    >
                      <option value="event">Event</option>
                      <option value="exam">Exam</option>
                      <option value="meeting">Meeting</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description (optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={addForm.description}
                      onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Day Events Modal */}
        {showDayModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowDayModal(false)}
          >
            <div
              className="card"
              style={{ width: 500, maxWidth: '90%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="card-body">
                <h5 className="card-title">
                  Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h5>
                {eventsOn(selectedDate).length === 0 ? (
                  <p className="text-muted">No events on this day.</p>
                ) : (
                  <div>
                    {eventsOn(selectedDate).map(ev => (
                      <div key={ev.id} className="border p-3 mb-2 rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ flex: 1 }}>
                            <h6 className="mb-1">{ev.title}</h6>
                            <div className="text-muted small mb-1">
                              {ev.time || 'All day'}
                            </div>
                            <span className={`badge ${ev.type === 'exam' ? 'bg-danger' : 'bg-info'}`}>
                              {ev.type}
                            </span>
                            {ev.description && (
                              <p className="mt-2 mb-0 small">{ev.description}</p>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => removeEvent(ev.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setShowDayModal(false);
                      openAddEvent(selectedDate);
                    }}
                  >
                    Add Event for This Day
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowDayModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
