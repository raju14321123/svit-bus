import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LandingPage = () => {
  const navigate = useNavigate();
  const [latestNotice, setLatestNotice] = useState("WELCOME TO SVIT - CHECK HERE FOR LIVE BUS UPDATES!");

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('title, content')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setLatestNotice(`📢 ${data.title}: ${data.content}`);
    };
    fetchLatest();
  }, []);

  return (
    <div className="landing-root">
      
      <style>
        {`
          /* GLOBAL RESET TO PREVENT RIGHT-SIDE OVERFLOW */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          .landing-root {
            height: 100vh; 
            width: 100vw;
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            background: radial-gradient(circle at center, #1e1b4b 0%, #020617 100%);
            color: white;
            font-family: 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            overflow: hidden;
            position: relative;
            padding: 20px; /* Safety padding for mobile */
          }

          @keyframes marquee {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-100%, 0); }
          }

          @keyframes boxGlow {
            0%, 100% { border-color: #22d3ee; box-shadow: 0 0 15px #22d3ee; }
            50% { border-color: #818cf8; box-shadow: 0 0 30px #818cf8; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .neon-box {
            animation: boxGlow 4s infinite ease-in-out;
            width: 100%;
            max-width: 360px; /* Limits size on desktop, scales on mobile */
            margin: 0 auto;
          }

          .neon-text {
            text-shadow: 0 0 10px #fff, 0 0 20px #22d3ee, 0 0 40px #22d3ee;
            animation: float 5s infinite ease-in-out;
          }

          .neon-btn {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: block;
            width: 100%;
          }

          .neon-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 0 40px currentColor !important;
            letter-spacing: 2px;
          }

          .neon-btn:active {
            transform: scale(0.95);
          }

          /* MOBILE RATIO ADJUSTMENTS */
          @media (max-width: 600px) {
            .neon-text {
              font-size: 3.5rem !important;
              letter-spacing: 5px !important;
            }
            h2 {
              font-size: 0.9rem !important;
              letter-spacing: 2px !important;
              margin-bottom: 20px;
            }
            .neon-box {
              width: 95% !important; 
              padding: 35px 20px !important;
            }
            footer {
              font-size: 0.7rem !important;
              bottom: 15px !important;
            }
            .marquee-container {
              padding: 8px 0 !important;
            }
          }
        `}
      </style>

      {/* 1. NEON MARQUEE */}
      <div className="marquee-container" style={{
        position: 'absolute',
        top: '0',
        width: '100%',
        background: 'rgba(2, 6, 23, 0.8)', 
        padding: '12px 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        borderBottom: '2px solid #22d3ee',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)', 
        zIndex: 10
      }}>
        <div style={{
          display: 'inline-block',
          paddingLeft: '100%',
          animation: 'marquee 22s linear infinite',
          fontSize: '1rem',
          color: '#22d3ee',
          textShadow: '0 0 8px #22d3ee',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          {latestNotice}
        </div>
      </div>

      {/* 2. LOGO */}
      <div style={{ marginBottom: '30px', width: '100%' }}>
        <h1 className="neon-text" style={{ fontSize: '5.5rem', margin: '0', letterSpacing: '10px', fontWeight: '900' }}>
          SVIT
        </h1>
        <h2 style={{ fontSize: '1.2rem', color: '#818cf8', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>
          Bus Tracking System
        </h2>
      </div>

      {/* 3. LOGIN PORTAL */}
      <div className="neon-box" style={{ 
        background: 'rgba(15, 23, 42, 0.6)', 
        padding: '50px', 
        borderRadius: '24px', 
        backdropFilter: 'blur(12px)',
        border: '2px solid #22d3ee',
        position: 'relative'
      }}>
        <h3 style={{ marginBottom: '35px', color: '#fff', fontSize: '1.4rem', letterSpacing: '2px', fontWeight: '300' }}>SELECT PORTAL</h3>
        
        <button 
          onClick={() => navigate('/student')} 
          className="neon-btn"
          style={neonButtonStyle("#22d3ee")}
        >
          STUDENT LOGIN
        </button>

        <button 
          onClick={() => navigate('/driver')} 
          className="neon-btn"
          style={neonButtonStyle("#818cf8")}
        >
          DRIVER LOGIN
        </button>

        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => navigate('/admin')} 
            className="neon-btn"
            style={{ 
              background: 'none', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: 'rgba(255,255,255,0.6)', 
              padding: '8px 25px', 
              borderRadius: '30px', 
              cursor: 'pointer', 
              fontSize: '0.75rem',
              marginTop: '10px',
              width: 'auto',
              display: 'inline-block'
            }}
          >
            ADMINISTRATOR
          </button>
        </div>
      </div>

      <footer style={{ position: 'absolute', bottom: '25px', fontSize: '0.8rem', color: 'rgba(129, 140, 248, 0.5)', letterSpacing: '1px', width: '100%' }}>
        SVIT INSTITUTE © 2025 | SECURE TRANSPORT
      </footer>
    </div>
  );
};

// BUTTON STYLES
const neonButtonStyle = (glowColor) => ({
  width: '100%',
  padding: '16px',
  margin: '12px 0',
  backgroundColor: 'rgba(0,0,0,0.3)',
  color: 'white',
  border: `2px solid ${glowColor}`,
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: `0 0 10px ${glowColor}`,
  textShadow: `0 0 5px #fff`,
  textTransform: 'uppercase'
});

export default LandingPage;