import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DriverReset = () => {
  const [driverId, setDriverId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  // Part 1: Verify if the ID exists
  const handleVerifyId = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('driver_users')
      .select('driver_id')
      .eq('driver_id', driverId)
      .single();

    if (data) {
      setIsVerified(true);
      alert("ID Verified! Now enter your new password.");
    } else {
      alert("Driver ID not found. Please contact Admin.");
    }
  };

  // Part 2: Update the password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('driver_users')
      .update({ password: newPass })
      .eq('driver_id', driverId);

    if (!error) {
      alert("Password updated successfully!");
      navigate('/driver'); // Go back to login
    } else {
      alert("Error updating password.");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2c3e50' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '320px' }}>
        <h2>Reset Password</h2>
        
        {!isVerified ? (
          <form onSubmit={handleVerifyId}>
            <p>Enter your Driver ID to verify</p>
            <input 
              type="text" 
              placeholder="Driver ID" 
              value={driverId} 
              onChange={(e) => setDriverId(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              required
            />
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}>
              Verify ID
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <p>ID: <strong>{driverId}</strong></p>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPass} 
              onChange={(e) => setNewPass(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              required
            />
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}>
              Update Password
            </button>
          </form>
        )}
        <button onClick={() => navigate('/driver')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default DriverReset;