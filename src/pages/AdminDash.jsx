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

  // User List and Search States
  const [students, setStudents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showList, setShowList] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
      fetchUsers();
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

  const fetchUsers = async () => {
    const { data: sData } = await supabase.from('student_users').select('*');
    const { data: dData } = await supabase.from('driver_users').select('*');
    setStudents(sData || []);
    setDrivers(dData || []);
  };

  // Logic to filter users based on the search term
  const filteredStudents = students.filter(s => 
    s.student_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredDrivers = drivers.filter(d => 
    d.driver_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.assigned_bus?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    fetchUsers();
  };

  const addDriver = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('driver_users').insert([
      { driver_id: driverId, password: driverPass, assigned_bus: assignedBus }
    ]);
    if (!error) {
      alert("Driver Registered!"); setDriverId(''); setDriverPass(''); setAssignedBus('');
      fetchUsers();
    } else { alert("Error: " + error.message); }
  };

  const deleteUser = async (id, table, idCol) => {
    if (window.confirm(`Permanently WIPE ID: ${id} from database?`)) {
      const { error } = await supabase.from(table).delete().eq(idCol, id);
      if (!error) {
        alert("User deleted successfully.");
        fetchUsers();
      } else { alert("Error: " + error.message); }
    }
  };

  const postAnnouncement = async () => {
    await supabase.from('announcements').insert([{ title, content }]);
    alert("Notice Published!"); setTitle(''); setContent(''); fetchAnnouncements();
  };

  const deleteManual = async (id) => {
    if (window.confirm("Delete this notice?")) {
      const { error } = await supabase.from('announcements').delete().eq(id);
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
      <div className="login-wrapper">
        <style>{`
          .login-wrapper {
            height: 100vh; display: flex; align-items: center; justify-content: center; 
            background: radial-gradient(circle at center, #020617 0%, #000 100%);
            font-family: 'Segoe UI', sans-serif; overflow: hidden;
          }
          @keyframes flyIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .admin-card { 
            background: rgba(10, 10, 20, 0.6); 
            backdrop-filter: blur(20px);
            border: 2px solid #00f2ff;
            padding: 40px; border-radius: 30px; text-align: center; width: 380px; 
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.2);
            animation: flyIn 0.8s ease-out forwards; 
          }
          @media (max-width: 480px) { .admin-card { width: 90%; } }
          .droplet-btn-red { 
            background: transparent; border: 2px solid #00f2ff; color: #00f2ff; 
            padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; 
            transition: 0.3s; text-transform: uppercase; letter-spacing: 2px;
          }
          .droplet-btn-red:hover { background: #00f2ff; color: black; box-shadow: 0 0 20px #00f2ff; }
          .neon-input-red { 
            width: 100%; padding: 15px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.05); 
            border: 1px solid rgba(0, 242, 255, 0.3); color: white; border-radius: 12px; text-align: center; 
          }
        `}</style>
        <div className="admin-card">
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: 0, textShadow: '0 0 20px #00f2ff' }}>SVIT</h1>
          <p style={{ color: '#00f2ff', fontSize: '0.9rem', marginBottom: '30px', letterSpacing: '3px' }}>BUS TRACKING SYSTEM</p>
          <div style={{ border: '1px solid rgba(0,242,255,0.3)', padding: '30px', borderRadius: '20px' }}>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>SELECT PORTAL</p>
            <form onSubmit={handleAdminLogin}>
              <input type="password" placeholder="ADMIN ACCESS KEY" className="neon-input-red" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} required />
              <button type="submit" className="droplet-btn-red">{isLoggingIn ? "SYNCING..." : "AUTHORIZE"}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-root">
       <style>{`
          .admin-dashboard-root {
            padding: 20px; 
            background: #020617; 
            minHeight: 100vh; color: white; font-family: 'Segoe UI', sans-serif;
          }
          .admin-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          @media (max-width: 850px) {
            .admin-grid { grid-template-columns: 1fr; }
            .neon-text-green { font-size: 1.2rem !important; }
          }
          
          .water-glass {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(57, 255, 20, 0.2);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          
          .neon-text-green { color: #39FF14; text-shadow: 0 0 10px rgba(57, 255, 20, 0.5); font-size: 1.5rem; margin-bottom: 20px; }
          .neon-text-yellow { color: #facc15; text-shadow: 0 0 10px rgba(250, 204, 21, 0.5); font-size: 1.5rem; margin-bottom: 20px; }

          .action-btn-green { 
            background: transparent; border: 1px solid #39FF14; color: #39FF14; 
            padding: 12px 20px; border-radius: 10px; cursor: pointer; transition: 0.3s;
            font-weight: bold; width: fit-content; margin-top: 5px;
          }
          .action-btn-green:hover { background: #39FF14; color: black; box-shadow: 0 0 15px #39FF14; }

          .action-btn-yellow { 
            background: transparent; border: 1px solid #facc15; color: #facc15; 
            padding: 12px 20px; border-radius: 10px; cursor: pointer; transition: 0.3s;
            font-weight: bold; width: 100%; margin-top: 15px;
          }
          .action-btn-yellow:hover { background: #facc15; color: black; box-shadow: 0 0 15px #facc15; }

          .neon-input-dash { 
            padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); 
            color: white; border-radius: 10px; width: 100%; margin-bottom: 15px; outline: none;
          }
          .neon-input-dash:focus { border-color: #39FF14; background: rgba(57, 255, 20, 0.05); }

          .gen-pill { 
            background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px dashed #3498db;
            padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; margin-bottom: 5px; display: inline-block;
          }
          hr { border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 25px 0; }
       `}</style>

       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 10px' }}>
          <button onClick={() => setIsAdmin(false)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>TERMINATE</button>
       </header>

       <div className="admin-grid">
          
          <div className="left-panel">
            <div className="water-glass">
               <h3 className="neon-text-green">Management Suite</h3>
               
               <div style={{ marginBottom: '20px' }}>
                 <input placeholder="Bus Number" value={busNumber} onChange={e => setBusNumber(e.target.value)} className="neon-input-dash" />
                 <button onClick={addBus} className="action-btn-green">Add Bus</button>
               </div>

               <hr />
               
               <h4 style={{ marginBottom: '15px', color: '#ccc' }}>Enrolment</h4>
               <input placeholder="Student PIN" value={studentPin} onChange={e => setStudentPin(e.target.value)} className="neon-input-dash" />
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input placeholder="Password" value={studentPass} onChange={e => setStudentPass(e.target.value)} className="neon-input-dash" style={{ marginBottom: 0 }} />
                  <span className="gen-pill" onClick={() => generatePass('student')}>Generate</span>
               </div>
               <button onClick={addStudent} className="action-btn-green" style={{ marginTop: '15px' }}>Enroll Student</button>
               
               <hr />
               
               <h4 style={{ marginBottom: '15px', color: '#ccc' }}>Driver Gateway</h4>
               <input placeholder="Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} className="neon-input-dash" />
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                  <input placeholder="Password" value={driverPass} onChange={e => setDriverPass(e.target.value)} className="neon-input-dash" style={{ marginBottom: 0 }} />
                  <span className="gen-pill" onClick={() => generatePass('driver')}>Generate</span>
               </div>
               <input placeholder="Assigned Bus" value={assignedBus} onChange={e => setAssignedBus(e.target.value)} className="neon-input-dash" />
               <button onClick={addDriver} className="action-btn-green">Set Driver</button>

               <hr />
               <button 
                  onClick={() => setShowList(!showList)} 
                  className="action-btn-green" 
                  style={{ width: '100%', borderColor: '#00f2ff', color: '#00f2ff' }}
               >
                 {showList ? "HIDE REGISTERED LIST" : "SHOW REGISTERED LIST"}
               </button>
            </div>

            {showList && (
              <div className="water-glass" style={{ marginTop: '20px', maxHeight: '500px', overflowY: 'auto', border: '1px solid #00f2ff' }}>
                 {/* SEARCH BAR COMPONENT */}
                 <input 
                   placeholder="🔍 Quick Search ID..." 
                   value={searchTerm} 
                   onChange={(e) => setSearchTerm(e.target.value)} 
                   className="neon-input-dash" 
                   style={{ borderColor: '#00f2ff', marginBottom: '20px' }}
                 />

                 <h4 className="neon-text-green" style={{ fontSize: '1rem', color: '#00f2ff' }}>Filtered Students</h4>
                 {filteredStudents.length === 0 && <p style={{opacity: 0.4, fontSize: '0.8rem'}}>No matching students found.</p>}
                 {filteredStudents.map(s => (
                   <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <span style={{ fontSize: '0.9rem' }}>ID: {s.student_id}</span>
                     <button onClick={() => deleteUser(s.student_id, 'student_users', 'student_id')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>DELETE</button>
                   </div>
                 ))}
                 
                 <h4 className="neon-text-green" style={{ fontSize: '1rem', color: '#00f2ff', marginTop: '20px' }}>Filtered Drivers</h4>
                 {filteredDrivers.length === 0 && <p style={{opacity: 0.4, fontSize: '0.8rem'}}>No matching drivers found.</p>}
                 {filteredDrivers.map(d => (
                   <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <span style={{ fontSize: '0.9rem' }}>ID: {d.driver_id} (Bus: {d.assigned_bus})</span>
                     <button onClick={() => deleteUser(d.driver_id, 'driver_users', 'driver_id')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>DELETE</button>
                   </div>
                 ))}
              </div>
            )}
          </div>

          <div className="right-panel">
            <div className="water-glass">
               <h3 className="neon-text-yellow">Intelligence Hub</h3>
               <input placeholder="Notice Title" value={title} onChange={e => setTitle(e.target.value)} className="neon-input-dash" />
               <textarea placeholder="Broadcast details..." value={content} onChange={e => setContent(e.target.value)} className="neon-input-dash" style={{ height: '120px', resize: 'none' }} />
               <button onClick={postAnnouncement} className="action-btn-yellow">RELEASE INTEL</button>
               
               <div style={{ marginTop: '30px' }}>
                  <h4 style={{ color: '#39FF14', marginBottom: '15px' }}>Active Broadcasts</h4>
                  {announcements.length === 0 && <p style={{ opacity: 0.4, fontSize: '0.8rem' }}>No active notices...</p>}
                  {announcements.map(ann => (
                    <div key={ann.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ color: '#facc15' }}>{ann.title}</strong>
                          <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>{ann.content}</p>
                        </div>
                        <button onClick={() => deleteManual(ann.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>WIPE</button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="water-glass" style={{ marginTop: '20px', border: '1px solid rgba(243, 156, 18, 0.2)' }}>
               <h3 style={{ color: '#f39c12', fontSize: '1.2rem', marginBottom: '15px' }}>Emergency Reset</h3>
               <select value={userType} onChange={e => setUserType(e.target.value)} style={{ padding: '12px', background: '#0f172a', color: 'white', width: '100%', borderRadius: '10px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="student">Student Account</option>
                  <option value="driver">Driver Account</option>
               </select>
               <input placeholder="Target ID" value={searchId} onChange={e => setSearchId(e.target.value)} className="neon-input-dash" />
               <input placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="neon-input-dash" />
               <button onClick={handleResetPassword} className="action-btn-green" style={{ borderColor: '#f39c12', color: '#f39c12' }}>Apply Patch</button>
            </div>
          </div>

       </div>
    </div>
  );
};

export default AdminDash;