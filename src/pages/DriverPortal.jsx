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

      setTimeout(() => {
        navigate('/driver-panel'); 
      }, 800); 

    } else {
      alert("Invalid Driver Credentials");
      setStatus('idle');
    }
  };

  return (
    <div className="driver-portal-wrapper">
      <style>
        {`
          /* GLOBAL RESET TO PREVENT OVERFLOW AND RIGHT-SHIFT */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          .driver-portal-wrapper {
            height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #062006 0%, #020617 100%);
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
            padding: 20px; /* Safety padding for mobile edges */
          }

          .login-card-base {
            background: rgba(15, 23, 42, 0.85);
            padding: 40px;
            border-radius: 24px;
            border: 2px solid #39FF14;
            text-align: center;
            width: 100%;
            max-width: 360px; /* Professional size on desktop, scales down on mobile */
            box-shadow: 0 0 25px rgba(57, 255, 20, 0.2);
            margin: auto; /* Centers horizontally */
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .green-neon-btn {
            width: 100%; 
            padding: 16px; 
            border-radius: 12px;
            background: transparent; 
            border: 2px solid #39FF14;
            color: #39FF14; 
            font-weight: 900; 
            cursor: pointer;
            text-transform: uppercase; 
            margin-top: 10px;
            transition: 0.3s;
            display: block;
            outline: none;
          }

          .green-neon-btn:hover { background: rgba(57, 255, 20, 0.1); }
          
          .bus-anim { 
            font-size: 2rem; 
            display: block; 
            animation: busSlide 0.5s forwards; 
          }

          @keyframes busSlide { 
            from { transform: translateX(-100%); opacity: 0; } 
            to { transform: translateX(0); opacity: 1; } 
          }
          
          .neon-input {
            width: 100%; 
            padding: 15px; 
            margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(57, 255, 20, 0.3);
            color: white; 
            border-radius: 10px; 
            text-align: center; 
            outline: none;
            display: block;
            transition: 0.3s;
          }
          
          .neon-input:focus {
            border-color: #39FF14;
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
          }

          /* MOBILE RESPONSIVE ADAPTATION */
          @media (max-width: 480px) {
            .login-card-base {
              padding: 40px 20px;
              width: 95%; /* Prevents touching the screen edges */
            }
            h1 { font-size: 2.2rem !important; }
            .neon-input, .green-neon-btn {
              padding: 14px !important;
              font-size: 0.85rem !important;
            }
          }
        `}
      </style>

      <div className="login-card-base">
        <h1 style={{ color: '#fff', letterSpacing: '8px', textShadow: '0 0 15px #39FF14', margin: '0' }}>SVIT</h1>
        <p style={{ color: '#39FF14', fontSize: '0.8rem', marginBottom: '30px', letterSpacing: '2px' }}>DRIVER PORTAL</p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="DRIVER ID" 
            className="neon-input" 
            value={driverId} 
            onChange={e => setDriverId(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="neon-input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />

          <button type="submit" className="green-neon-btn">
            {status === 'idle' ? "LOGIN" : <span className="bus-anim">🚌</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverPortal;