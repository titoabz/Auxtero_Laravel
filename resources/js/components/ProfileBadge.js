import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Small clickable profile badge: initials in a circle + full name
export default function ProfileBadge({ className = '', compact = false }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      const headers = token ? { 'X-Portal-Auth': token } : {};
      const res = await axios.get('/api/faculty/me', { headers });
      const full = [res.data.first_name, res.data.last_name].filter(Boolean).join(' ').trim();
      if (full) setName(full);
      if (res.data.profile_picture) setProfilePic(res.data.profile_picture);
      else setProfilePic('');
    } catch (_) {
      // ignore; keep local name
    }
  };

  useEffect(() => {
    // Try localStorage first for speed
    const local = localStorage.getItem('faculty_name');
    if (local) setName(local);

    // Fetch server profile for full name and picture
    fetchProfile();

    // Listen for profile picture updates
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('profilePictureUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
    };
  }, []);

  const initials = (name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 3)
    .join('')
    .toUpperCase();

  const goProfile = () => navigate('/faculty/profile');

  const size = compact ? 28 : 36;

  return (
    <button type="button" onClick={goProfile} className={`btn btn-link p-0 text-decoration-none ${className}`} title="My Profile">
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size/2,
            background: '#9fb0e8',
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            overflow: 'hidden'
          }}
        >
          {profilePic ? (
            <img src={profilePic} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          ) : (
            initials
          )}
        </div>
        {!compact && (
          <span className="text-dark" style={{whiteSpace: 'nowrap'}}>{name || 'Faculty'}</span>
        )}
      </div>
    </button>
  );
}
