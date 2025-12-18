import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminDash = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Registration States
  const [busNumber, setBusNumber] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [driverId, setDriverId] = useState('');
  const [driverPass, setDriverPass] = useState('');
  const [assignedBus, setAssignedBus] = useState('');

  // Password Management Tool
  const [searchId, setSearchId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userType, setUserType] = useState('student');

  // Announcement States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
      runAutoCleanup();
    }
  }, [isAdmin]);

  const runAutoCleanup = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('announcements').delete().lt('created_at', twentyFourHoursAgo);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const { data } = await supabase.from('admin_user').select('password').eq('username', 'admin').single();
    if (data && data.password === adminPasswordInput) {
      setTimeout(() => { setIsAdmin(true); setIsLoggingIn(false); }, 1500);
    } else {
      alert("Invalid Admin Password!");
      setIsLoggingIn(false);
    }
  };

  const generatePass = (type) => {
    const pass = Math.floor(1000 + Math.random() * 9000).toString();
    if (type === 'student') setStudentPass(pass);
    else setDriverPass(pass);
  };

  const addBus = async () => {
    await supabase.from('buses').insert([{ bus_number: busNumber }]);
    alert("Bus Added!"); setBusNumber('');
  };

  const addStudent = async (e) => {
    e.preventDefault();
    await supabase.from('student_users').insert([{ student_id: studentPin, password: studentPass }]);
    alert("Student Registered!"); setStudentPin(''); setStudentPass('');
  };

  const addDriver = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('driver_users').insert([
      { driver_id: driverId, password: driverPass, assigned_bus: assignedBus }
    ]);
    if (!error) {
      alert("Driver Registered!"); setDriverId(''); setDriverPass(''); setAssignedBus('');
    } else { alert("Error: " + error.message); }
  };

  const postAnnouncement = async () => {
    await supabase.from('announcements').insert([{ title, content }]);
    alert("Notice Published!"); setTitle(''); setContent(''); fetchAnnouncements();
  };

  const deleteManual = async (id) => {
    if (window.confirm("Delete this notice?")) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (!error) fetchAnnouncements();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const table = userType === 'student' ? 'student_users' : 'driver_users';
    const idCol = userType === 'student' ? 'student_id' : 'driver_id';
    await supabase.from(table).update({ password: newPassword }).eq(idCol, searchId);
    alert("Password Updated!"); setSearchId(''); setNewPassword('');
  };

  if (!isAdmin) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'radial-gradient(circle at center, #2a0808 0%, #020617 100%)',
        fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden'
      }}>
        <style>{`
          @keyframes flyIn { from { transform: scale(0.5); opacity: 0; filter: blur(10px); } to { transform: scale(1); opacity: 1; filter: blur(0); } }
          .admin-card { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 50px; border-radius: 28px; text-align: center; width: 360px; 
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            animation: flyIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          }
          .droplet-btn-red { position: relative; overflow: hidden; background: transparent; border: 2px solid #ef4444; color: #ef4444; padding: 18px; border-radius: 12px; font-weight: 900; cursor: pointer; width: 100%; margin-top: 10px; }
          @keyframes busEnter { from { transform: translateX(-150%); } to { transform: translateX(0%); } }
          .bus-anim { animation: busEnter 0.5s forwards; font-size: 2rem; display: block; }
          .neon-input-red { width: 100%; padding: 15px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); color: white; border-radius: 10px; text-align: center; outline: none; }
        `}</style>
        <div className="admin-card">
          <h1 style={{ color: '#fff', letterSpacing: '8px', textShadow: '0 0 15px #ef4444' }}>SVIT</h1>
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '30px' }}>ADMIN CENTRAL</p>
          <form onSubmit={handleAdminLogin}>
            <input type="password" placeholder="SECURE ADMIN KEY" className="neon-input-red" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} required />
            <button type="submit" className="droplet-btn-red">{isLoggingIn ? <span className="bus-anim">🚌</span> : "AUTHORIZE"}</button>
          </form>
          <p onClick={() => navigate('/admin-reset')} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginTop: '20px', fontSize: '12px', textDecoration: 'underline' }}>Forgot Admin Password?</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '30px', 
      background: 'radial-gradient(circle at center, #062006 0%, #020617 100%)', 
      minHeight: '100vh', color: 'white', fontFamily: 'Segoe UI, sans-serif' 
    }}>
       <style>{`
          @keyframes cinematicIn { 0% { transform: scale(0.9); opacity: 0; filter: blur(10px); } 100% { transform: scale(1); opacity: 1; filter: blur(0); } }
          .panel-entrance { animation: cinematicIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          /* WATER GLASS EFFECT (iOS 18 STYLE) */
          .water-glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(25px) saturate(200%);
            -webkit-backdrop-filter: blur(25px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            padding: 25px;
            box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.05), 0 15px 35px rgba(0, 0, 0, 0.4);
            margin-bottom: 20px;
            transition: 0.3s;
          }
          
          .water-glass:hover {
            border-color: rgba(57, 255, 20, 0.5);
            background: rgba(255, 255, 255, 0.05);
          }

          .neon-text-green { text-shadow: 0 0 10px #39FF14; color: #39FF14; }
          .action-btn-green { background: rgba(57, 255, 20, 0.1); border: 1px solid #39FF14; color: #39FF14; padding: 10px 15px; border-radius: 12px; cursor: pointer; transition: 0.3s; margin-top: 10px; font-weight: bold; }
          .action-btn-green:hover { background: #39FF14; color: #020617; box-shadow: 0 0 20px #39FF14; }
          .neon-input-dash { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; width: 100%; margin-bottom: 12px; outline: none; }
          .neon-input-dash:focus { border-color: #39FF14; }
       `}</style>

       <header className="panel-entrance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="neon-text-green" style={{ letterSpacing: '5px' }}>SVIT COMMAND CENTER</h1>
          <button onClick={() => setIsAdmin(false)} className="action-btn-green" style={{borderColor: '#ef4444', color: '#ef4444'}}>TERMINATE</button>
       </header>

       <div className="panel-entrance" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
          
          <div>
            <div className="water-glass">
               <h3 className="neon-text-green">Management Suite</h3>
               <input placeholder="Bus Number" value={busNumber} onChange={e => setBusNumber(e.target.value)} className="neon-input-dash" />
               <button onClick={addBus} className="action-btn-green">Add Bus</button>
               <hr style={{ opacity: 0.1, margin: '20px 0' }} />
               
               <h4>Enrolment</h4>
               <input placeholder="Student PIN" value={studentPin} onChange={e => setStudentPin(e.target.value)} className="neon-input-dash" />
               <input placeholder="Password" value={studentPass} onChange={e => setStudentPass(e.target.value)} className="neon-input-dash" />
               <button onClick={() => generatePass('student')} style={{ background: '#3498db', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Generate</button>
               <button onClick={addStudent} className="action-btn-green" style={{ marginLeft: '10px' }}>Enroll Student</button>
               
               <hr style={{ opacity: 0.1, margin: '20px 0' }} />
               
               <h4>Driver Gateway</h4>
               <input placeholder="Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} className="neon-input-dash" />
               <input placeholder="Password" value={driverPass} onChange={e => setDriverPass(e.target.value)} className="neon-input-dash" />
               <button onClick={() => generatePass('driver')} style={{ background: '#3498db', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>Generate</button>
               <input placeholder="Assigned Bus" value={assignedBus} onChange={e => setAssignedBus(e.target.value)} className="neon-input-dash" style={{ marginTop: '12px' }} />
               <button onClick={addDriver} className="action-btn-green">Set Driver</button>
            </div>

            <div className="water-glass">
               <h3 style={{ color: '#f39c12' }}>Emergency Reset</h3>
               <select value={userType} onChange={e => setUserType(e.target.value)} style={{ padding: '10px', background: '#111', color: 'white', width: '100%', borderRadius: '8px', marginBottom: '12px' }}>
                  <option value="student">Student Account</option>
                  <option value="driver">Driver Account</option>
               </select>
               <input placeholder="Target ID" value={searchId} onChange={e => setSearchId(e.target.value)} className="neon-input-dash" />
               <input placeholder="New Credentials" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="neon-input-dash" />
               <button onClick={handleResetPassword} className="action-btn-green" style={{ borderColor: '#f39c12', color: '#f39c12' }}>Apply Patch</button>
            </div>
          </div>

          <div>
            <div className="water-glass">
               <h3 style={{ color: '#facc15' }}>Intelligence Hub</h3>
               <input placeholder="Notice Title" value={title} onChange={e => setTitle(e.target.value)} className="neon-input-dash" />
               <textarea placeholder="Broadcast details..." value={content} onChange={e => setContent(e.target.value)} className="neon-input-dash" style={{ height: '100px' }} />
               <button onClick={postAnnouncement} className="action-btn-green" style={{ borderColor: '#facc15', color: '#facc15', width: '100%' }}>RELEASE INTEL</button>
               
               <div style={{ marginTop: '30px' }}>
                  <h4 className="neon-text-green">Active Broadcasts</h4>
                  {announcements.map(ann => (
                    <div key={ann.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <strong style={{ color: '#facc15' }}>{ann.title}</strong>
                        <p style={{ fontSize: '12px', opacity: 0.8, margin: '5px 0' }}>{ann.content}</p>
                      </div>
                      <button onClick={() => deleteManual(ann.id)} className="action-btn-green" style={{ fontSize: '10px', marginTop: '0', borderColor: '#ef4444', color: '#ef4444' }}>WIPE</button>
                    </div>
                  ))}
               </div>
            </div>
          </div>

       </div>
    </div>
  );
};

export default AdminDash;