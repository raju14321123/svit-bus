import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminReset = () => {
  const [masterKey, setMasterKey] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const SECRET_MASTER_KEY = "7744"; 

  const handleVerifyMasterKey = (e) => {
    e.preventDefault();
    if (masterKey === SECRET_MASTER_KEY) {
      setIsVerified(true);
      alert("Master Key Verified!");
    } else {
      alert("Invalid Master Key!");
    }
  };

  const handleUpdateAdminPass = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('admin_user')
      .update({ password: newAdminPass })
      .eq('username', 'admin');

    if (!error) {
      alert("Admin Password updated in Database!");
      navigate('/admin');
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#34495e' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '350px' }}>
        <h2>Admin Password Reset</h2>
        {!isVerified ? (
          <form onSubmit={handleVerifyMasterKey}>
            <p>Enter Master Key</p>
            <input type="password" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#e67e22', color: 'white', border: 'none' }}>Verify</button>
          </form>
        ) : (
          <form onSubmit={handleUpdateAdminPass}>
            <input type="password" placeholder="New Admin Password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} required />
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none' }}>Update Database</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminReset;