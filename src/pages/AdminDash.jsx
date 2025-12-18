import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminDash = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Admin Recovery States
  const [showRecovery, setShowRecovery] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const MASTER_SECURITY_CODE = "SVIT2025"; 

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
  const [searchTerm, setSearchTerm] = useState(''); 

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

  const handleAdminReset = async (e) => {
    e.preventDefault();
    if (securityCode === MASTER_SECURITY_CODE) {
      const { error } = await supabase.from('admin_user').update({ password: newAdminPass }).eq('username', 'admin');
      if (!error) {
        alert("Admin Access Key Reset Successful!");
        setShowRecovery(false); setSecurityCode(''); setNewAdminPass('');
      } else { alert("Error: " + error.message); }
    } else { alert("INVALID SECURITY CODE."); }
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
    if (window.confirm(`Permanently WIPE ID: ${id}?`)) {
      const { error } = await supabase.from(table).delete().eq(idCol, id);
      if (!error) { alert("Deleted."); fetchUsers(); }
    }
  };

  const postAnnouncement = async () => {
    await supabase.from('announcements').insert([{ title, content }]);
    alert("Notice Published!"); setTitle(''); setContent(''); fetchAnnouncements();
  };

  const deleteManual = async (id) => {
    if (window.confirm("Delete notice?")) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (!error) fetchAnnouncements();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const table = userType === 'student' ? 'student_users' : 'driver_users';
    const idCol = userType === 'student' ? 'student_id' : 'driver_id';
    const { error } = await supabase.from(table).update({ password: newPassword }).eq(idCol, searchId);
    if(!error) { alert("Password Updated!"); setSearchId(''); setNewPassword(''); }
  };

  if (!isAdmin) {
    return (
      <div className="login-wrapper">
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .login-wrapper {
            height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; 
            background: radial-gradient(circle at center, #020617 0%, #000 100%);
            font-family: 'Segoe UI', sans-serif; overflow: hidden; padding: 20px;
          }
          .admin-card { 
            background: rgba(10, 10, 20, 0.6); backdrop-filter: blur(20px); border: 2px solid #00f2ff;
            padding: 40px; border-radius: 30px; text-align: center; width: 100%; max-width: 380px; 
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.2); margin: 0 auto; 
          }
          .droplet-btn-red { 
            background: transparent; border: 2px solid #00f2ff; color: #00f2ff; padding: 15px; border-radius: 12px;
            font-weight: bold; cursor: pointer; width: 100%; text-transform: uppercase; margin-top: 10px;
          }
          .neon-input-red { 
            width: 100%; padding: 15px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.05); 
            border: 1px solid rgba(0, 242, 255, 0.3); color: white; border-radius: 12px; text-align: center; display: block; outline: none;
          }
        `}</style>
        <div className="admin-card">
          <h1 style={{ color: '#fff', fontSize: '3rem', margin: 0, textShadow: '0 0 20px #00f2ff' }}>SVIT</h1>
          {!showRecovery ? (
            <div style={{ marginTop: '20px' }}>
              <form onSubmit={handleAdminLogin}>
                <input type="password" placeholder="ADMIN ACCESS KEY" className="neon-input-red" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} required />
                <button type="submit" className="droplet-btn-red">AUTHORIZE</button>
              </form>
              <p onClick={() => setShowRecovery(true)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '15px', cursor: 'pointer' }}>Forgot Admin Key?</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <form onSubmit={handleAdminReset}>
                <input type="password" placeholder="SECURITY CODE" className="neon-input-red" value={securityCode} onChange={(e) => setSecurityCode(e.target.value)} required />
                <input type="password" placeholder="NEW KEY" className="neon-input-red" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} required />
                <button type="submit" className="droplet-btn-red" style={{ borderColor: '#ef4444', color: '#ef4444' }}>RESET</button>
              </form>
              <p onClick={() => setShowRecovery(false)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '15px', cursor: 'pointer' }}>Back</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-root">
       <style>{`
          * { box-sizing: border-box; }
          .admin-dashboard-root { padding: 20px; background: #020617; minHeight: 100vh; color: white; width: 100vw; overflow-x: hidden; font-family: 'Segoe UI', sans-serif; }
          .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1200px; margin: 0 auto; }
          @media (max-width: 850px) { .admin-grid { grid-template-columns: 1fr; } }
          .water-glass { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(57, 255, 20, 0.2); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .neon-text-green { color: #39FF14; font-size: 1.5rem; margin-bottom: 20px; }
          .neon-text-yellow { color: #facc15; font-size: 1.5rem; margin-bottom: 20px; }
          .action-btn-green { background: transparent; border: 1px solid #39FF14; color: #39FF14; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 5px; }
          .neon-input-dash { padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px; width: 100%; margin-bottom: 15px; outline: none; }
          .gen-pill { background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px dashed #3498db; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
          hr { border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 25px 0; }
       `}</style>

       <header style={{ marginBottom: '30px' }}><button onClick={() => setIsAdmin(false)} style={{ background: 'none', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px' }}>TERMINATE</button></header>

       <div className="admin-grid">
          <div className="left-panel">
            <div className="water-glass">
               <h3 className="neon-text-green">Management Suite</h3>
               <input placeholder="Bus Number" value={busNumber} onChange={e => setBusNumber(e.target.value)} className="neon-input-dash" />
               <button onClick={addBus} className="action-btn-green">Add Bus</button>
               <hr />
               <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Student Enrolment</h4>
               <input placeholder="Student ID" value={studentPin} onChange={e => setStudentPin(e.target.value)} className="neon-input-dash" />
               <div style={{ display: 'flex', gap: '10px' }}>
                  <input placeholder="Pass" value={studentPass} readOnly className="neon-input-dash" />
                  <span className="gen-pill" onClick={() => generatePass('student')}>Gen</span>
               </div>
               <button onClick={addStudent} className="action-btn-green">Enroll Student</button>
               <hr />
               {/* RESTORED DRIVER GATEWAY SECTION */}
               <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Driver Gateway</h4>
               <input placeholder="Driver ID" value={driverId} onChange={e => setDriverId(e.target.value)} className="neon-input-dash" />
               <div style={{ display: 'flex', gap: '10px' }}>
                  <input placeholder="Pass" value={driverPass} readOnly className="neon-input-dash" />
                  <span className="gen-pill" onClick={() => generatePass('driver')}>Gen</span>
               </div>
               <input placeholder="Assigned Bus" value={assignedBus} onChange={e => setAssignedBus(e.target.value)} className="neon-input-dash" style={{ marginTop: '15px' }} />
               <button onClick={addDriver} className="action-btn-green">Set Driver</button>
               <hr />
               <button onClick={() => setShowList(!showList)} className="action-btn-green" style={{ color: '#00f2ff', borderColor: '#00f2ff' }}>{showList ? "HIDE LIST" : "SHOW REGISTERED LIST"}</button>
            </div>

            {showList && (
              <div className="water-glass" style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                 <input placeholder="Search ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="neon-input-dash" />
                 {filteredStudents.map(s => (
                   <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
                     <span>ID: {s.student_id}</span>
                     <button onClick={() => deleteUser(s.student_id, 'student_users', 'student_id')} style={{ color: '#ef4444', background: 'none', border: 'none' }}>DELETE</button>
                   </div>
                 ))}
                 {filteredDrivers.map(d => (
                   <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
                     <span>DR: {d.driver_id} (Bus {d.assigned_bus})</span>
                     <button onClick={() => deleteUser(d.driver_id, 'driver_users', 'driver_id')} style={{ color: '#ef4444', background: 'none', border: 'none' }}>DELETE</button>
                   </div>
                 ))}
              </div>
            )}
          </div>

          <div className="right-panel">
            <div className="water-glass">
               <h3 className="neon-text-yellow">Intelligence Hub</h3>
               <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="neon-input-dash" />
               <textarea placeholder="Broadcast..." value={content} onChange={e => setContent(e.target.value)} className="neon-input-dash" style={{ height: '100px' }} />
               <button onClick={postAnnouncement} className="action-btn-yellow">RELEASE INTEL</button>
               <div style={{ marginTop: '20px' }}>
                  {announcements.map(ann => (
                    <div key={ann.id} style={{ padding: '10px', background: '#111', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ann.title}</span>
                      <button onClick={() => deleteManual(ann.id)} style={{ color: '#ef4444', border: 'none', background: 'none' }}>WIPE</button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="water-glass" style={{ marginTop: '20px' }}>
               <h3 style={{ color: '#f39c12' }}>Emergency User Reset</h3>
               <select value={userType} onChange={e => setUserType(e.target.value)} className="neon-input-dash">
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
               </select>
               <input placeholder="Target ID" value={searchId} onChange={e => setSearchId(e.target.value)} className="neon-input-dash" />
               <input placeholder="New Pass" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="neon-input-dash" />
               <button onClick={handleResetPassword} className="action-btn-green" style={{ borderColor: '#f39c12', color: '#f39c12' }}>APPLY PATCH</button>
            </div>
          </div>
       </div>
    </div>
  );
};

export default AdminDash;