import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const StudentLogin = () => {
  const [pin, setPin] = useState('');
  const [pass, setPass] = useState('');
  const [status, setStatus] = useState('idle'); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { data } = await supabase
      .from('student_users')
      .select('*')
      .eq('student_id', pin)
      .eq('password', pass)
      .single();

    if (data) {
      setStatus('loading'); 
      
      const newId = Math.random().toString(36).substring(7);
      await supabase.from('student_users').update({ session_id: newId }).eq('student_id', pin);
      sessionStorage.setItem('studentPin', pin);
      sessionStorage.setItem('mySessionId', newId);

      setTimeout(() => setStatus('transporting'), 1000);
      setTimeout(() => navigate('/student-map'), 1800);
    } else {
      alert("Invalid SVIT Credentials");
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)',
      fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden', position: 'relative' 
    }}>
      
      <style>
        {`
          /* HARDWARE ACCELERATION FIX */
          .login-card-base, .bus-anim, .droplet-btn {
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: transform, opacity, filter;
            transform: translateZ(0); /* Forces GPU rendering */
          }

          @keyframes flyIn {
            0% { transform: scale(0.2) translateZ(0); filter: blur(15px); opacity: 0; }
            100% { transform: scale(1) translateZ(0); filter: blur(0); opacity: 1; }
          }

          @keyframes flyAway {
            0% { transform: scale(1) translateZ(0); filter: blur(0); }
            100% { transform: scale(5) translateZ(1000px); filter: blur(30px); opacity: 0; }
          }

          .login-card-base {
            background: rgba(15, 23, 42, 0.7);
            padding: 50px;
            border-radius: 24px;
            border: 2px solid #22d3ee;
            text-align: center;
            width: 360px;
            backdrop-filter: blur(12px);
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
            animation: flyIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .transport-active {
            animation: flyAway 0.8s cubic-bezier(0.7, 0, 0.84, 0) forwards !important;
          }

          .droplet-btn {
            position: relative;
            overflow: hidden;
            background: transparent;
            border: 2px solid #22d3ee;
            color: white;
            padding: 18px;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 10px #22d3ee;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 2px;
            width: 100%;
            margin-top: 10px;
          }

          .droplet-btn:active::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            width: 5px; height: 5px;
            background: rgba(34, 211, 238, 0.5);
            border-radius: 100%;
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
          }

          @keyframes ripple {
            0% { width: 0; height: 0; opacity: 1; }
            100% { width: 400px; height: 400px; opacity: 0; }
          }

          @keyframes busEnter {
            0% { transform: translateX(-150%) scale(0.5); opacity: 0; }
            100% { transform: translateX(0%) scale(1.2); opacity: 1; }
          }
          .bus-anim { animation: busEnter 0.5s forwards; font-size: 2rem; display: block; }

          .neon-input {
            width: 100%; padding: 15px; margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(34, 211, 238, 0.3);
            color: white; border-radius: 10px;
            text-align: center; outline: none; transition: 0.3s;
          }
          .neon-input:focus { border-color: #22d3ee; box-shadow: 0 0 15px #22d3ee; }

          /* MOBILE RESPONSIVE FIX */
          @media (max-width: 480px) {
            .login-card-base {
              width: 90% !important; /* Adjusts width to phone screen */
              padding: 40px 20px !important; /* Reduces padding for smaller screens */
            }
            h1 { font-size: 2.5rem !important; }
            .neon-input, .droplet-btn {
              padding: 12px !important;
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      <div className={`login-card-base ${status === 'transporting' ? 'transport-active' : ''}`}>
        <h1 style={{ color: '#fff', letterSpacing: '8px', textShadow: '0 0 15px #22d3ee', margin: '0' }}>SVIT</h1>
        <p style={{ color: '#818cf8', fontSize: '0.8rem', marginBottom: '30px', letterSpacing: '2px' }}>STUDENT PORTAL</p>

        <form onSubmit={handleLogin}>
          <input 
            type="text" placeholder="PIN NUMBER" 
            className="neon-input"
            value={pin} onChange={e => setPin(e.target.value)} required
          />
          <input 
            type="password" placeholder="PASSWORD" 
            className="neon-input"
            value={pass} onChange={e => setPass(e.target.value)} required
          />

          <button type="submit" className="droplet-btn">
            {status === 'idle' && "LOGIN TO TRACKER"}
            {(status === 'loading' || status === 'transporting') && <span className="bus-anim">🚌</span>}
          </button>
        </form>

        <p onClick={() => navigate('/')} style={{ color: 'rgba(255,255,255,0.3)', marginTop: '25px', cursor: 'pointer', fontSize: '0.8rem' }}>
          ← BACK TO SVIT HOME
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;