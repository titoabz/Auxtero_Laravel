import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileBadge from './ProfileBadge';

export default function HeaderBar({ showHome = false, showBack = false, hideAuth = false, hideBell = false }) {
  const navigate = useNavigate();
  const hasToken = !!(typeof window !== 'undefined' && localStorage.getItem('portal_token'));
  const [menuOpen, setMenuOpen] = useState(false);

  // Add keyframe animation for sidebar
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('faculty_name');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/home', icon: '📊' },
    { label: 'Chat', path: '/chat', icon: '💬' },
    { label: 'Students', path: '/students', icon: '👥' },
    { label: 'Courses', path: '/courses', icon: '📚' },
    { label: 'Calendar', path: '/calendar', icon: '📅' },
    { label: 'Archive', path: '/archive', icon: '📦' }
  ];

  return (
    <div className="w-100" style={{background:'#dfeafb', borderBottom:'1px solid #c7d4f4'}}>
      <div className="container d-flex justify-content-between align-items-center py-2" style={{maxWidth:'100%'}}>
        <div className="d-flex align-items-center gap-2">
          {/* Hamburger Menu */}
          {hasToken && (
            <div style={{position:'relative'}}>
              <button 
                type="button"
                onClick={() => setMenuOpen(!menuOpen)} 
                className="btn btn-sm btn-light d-flex flex-column align-items-center justify-content-center"
                style={{width:36,height:36,padding:4,border:'none',background:'#c7d4f4'}}
                title="Menu"
              >
                <div style={{width:18,height:2,background:'#333',marginBottom:3}}></div>
                <div style={{width:18,height:2,background:'#333',marginBottom:3}}></div>
                <div style={{width:18,height:2,background:'#333'}}></div>
              </button>
              
              {/* Sidebar Menu */}
              {menuOpen && (
                <>
                  {/* Backdrop Overlay */}
                  <div 
                    style={{
                      position:'fixed',
                      top:0,
                      left:0,
                      right:0,
                      bottom:0,
                      background:'rgba(0,0,0,0.5)',
                      zIndex:999,
                      transition:'opacity 0.3s'
                    }}
                    onClick={() => setMenuOpen(false)}
                  />
                  
                  {/* Sidebar */}
                  <div 
                    style={{
                      position:'fixed',
                      top:0,
                      left:0,
                      bottom:0,
                      width:250,
                      background:'#e8e8e8',
                      boxShadow:'2px 0 8px rgba(0,0,0,0.15)',
                      zIndex:1000,
                      display:'flex',
                      flexDirection:'column',
                      animation:'slideIn 0.3s ease-out'
                    }}
                  >
                    {/* User Info Header */}
                    <div style={{
                      padding:'24px 20px',
                      background:'#d4d4d4',
                      display:'flex',
                      alignItems:'center',
                      gap:12,
                      borderBottom:'1px solid #c0c0c0'
                    }}>
                      <ProfileBadge compact />
                    </div>
                    
                    {/* Menu Items */}
                    <div style={{flex:1,padding:'16px 0',overflowY:'auto'}}>
                      {menuItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            navigate(item.path);
                            setMenuOpen(false);
                          }}
                          style={{
                            width:'100%',
                            padding:'14px 20px',
                            border:'none',
                            background:'transparent',
                            textAlign:'left',
                            cursor:'pointer',
                            display:'flex',
                            alignItems:'center',
                            gap:16,
                            transition:'background 0.2s',
                            color:'#333',
                            fontSize:15,
                            fontWeight:400
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#d4d4d4'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{fontSize:20,width:24,textAlign:'center'}}>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                      
                      {/* Logout Button */}
                      <div style={{borderTop:'1px solid #c0c0c0',marginTop:16,paddingTop:16}}>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          style={{
                            width:'100%',
                            padding:'14px 20px',
                            border:'none',
                            background:'transparent',
                            textAlign:'left',
                            cursor:'pointer',
                            display:'flex',
                            alignItems:'center',
                            gap:16,
                            transition:'background 0.2s',
                            color:'#dc3545',
                            fontSize:15,
                            fontWeight:500
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#ffe0e0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{fontSize:20,width:24,textAlign:'center'}}>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Logo and Title */}
          <div className="d-flex align-items-center" onClick={() => navigate('/home')} style={{cursor:'pointer'}} role="button" title="Go to Home">
            <div style={{width:40,height:40,borderRadius:20,overflow:'hidden',background:'#c7d4f4'}} className="me-2">
              <img src="/img/logo.png" alt="logo" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{e.currentTarget.style.display='none'}}/>
            </div>
            <div>
              <div className="fw-bold">Faculty Portal</div>
              <div className="text-muted" style={{fontSize:12}}>Information Technology</div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          {showHome && <Link to="/home" className="btn btn-sm btn-outline-primary">Home</Link>}
          {showBack && <button type="button" className="btn btn-sm btn-light" onClick={()=>navigate(-1)} title="Back">←</button>}
          {!hideAuth && (
            hasToken ? (
              <>
                <ProfileBadge />
                <button 
                  className="btn btn-sm btn-danger d-flex align-items-center gap-2" 
                  onClick={handleLogout} 
                  title="Logout"
                  style={{fontWeight:500}}
                >
                  <span style={{fontSize:16}}>🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-outline-primary">Log In</Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
