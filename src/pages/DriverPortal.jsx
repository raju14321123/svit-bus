import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DriverPortal = () => {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { data } = await supabase
      .from('driver_users')
      .select('*')
      .eq('driver_id', driverId)
      .eq('password', password)
      .single();

    if (data) {
      setStatus('loading'); 

      const newSessionId = Math.random().toString(36).substring(7);
      await supabase.from('driver_users').update({ session_id: newSessionId }).eq('driver_id', driverId);
      
      sessionStorage.setItem('isDriver', 'true');
      sessionStorage.setItem('driverId', driverId);
      sessionStorage.setItem('mySessionId', newSessionId);

      // Short delay to show the bus icon, then instant switch
      setTimeout(() => {
        navigate('/driver-panel'); 
      }, 800); 

    } else {
      alert("Invalid Driver Credentials");
      setStatus('idle');
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #062006 0%, #020617 100%)',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <style>
        {`
          .login-card-base {
            background: rgba(15, 23, 42, 0.85);
            padding: 50px;
            border-radius: 24px;
            border: 2px solid #39FF14;
            textAlign: center;
            width: 360px;
            box-shadow: 0 0 25px rgba(57, 255, 20, 0.2);
          }
          .green-neon-btn {
            width: 100%; padding: 18px; border-radius: 12px;
            background: transparent; border: 2px solid #39FF14;
            color: #39FF14; font-weight: 900; cursor: pointer;
            text-transform: uppercase; margin-top: 10px;
            transition: 0.3s;
          }
          .green-neon-btn:hover { background: rgba(57, 255, 20, 0.1); }
          .bus-anim { font-size: 2rem; display: block; animation: busSlide 0.5s forwards; }
          @keyframes busSlide { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          
          .neon-input {
            width: 100%; padding: 15px; margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(57, 255, 20, 0.3);
            color: white; border-radius: 10px; text-align: center; outline: none;
          }
        `}
      </style>

      <div className="login-card-base">
        <h1 style={{ color: '#fff', letterSpacing: '8px', textShadow: '0 0 15px #39FF14', margin: '0' }}>SVIT</h1>
        <p style={{ color: '#39FF14', fontSize: '0.8rem', marginBottom: '30px', letterSpacing: '2px' }}>DRIVER PORTAL</p>

        <form onSubmit={handleLogin}>
          <input type="text" placeholder="DRIVER ID" className="neon-input" value={driverId} onChange={e => setDriverId(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="neon-input" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="green-neon-btn">
            {status === 'idle' ? "LOGIN" : <span className="bus-anim">🚌</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverPortal;