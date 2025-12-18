import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverDash = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [busNumber, setBusNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('driverId');
    if (!user) navigate('/driver');
  }, [navigate]);

  return (
    <div style={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: '#020617', color: 'white', fontFamily: 'Segoe UI, sans-serif' 
    }}>
      <style>
        {`
          /* MOBILE RESPONSIVE FIX */
          @media (max-width: 500px) {
            .driver-card-container {
              width: 90% !important; /* Fits the card to phone width */
              padding: 30px 20px !important; /* Adjusts internal spacing */
            }
            h1 {
              font-size: 1.5rem !important; /* Reduces title size for small screens */
            }
            input, button {
              padding: 12px !important; /* Makes inputs easier to tap */
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      <div className="driver-card-container" style={{
        padding: '50px', borderRadius: '30px', border: '2px solid #39FF14',
        background: 'rgba(15, 23, 42, 0.8)', textAlign: 'center', width: '400px',
        boxShadow: '0 0 20px rgba(57, 255, 20, 0.1)'
      }}>
        <h1 style={{ color: '#39FF14', textShadow: '0 0 10px #39FF14', marginBottom: '20px' }}>DRIVER CONSOLE</h1>
        <p style={{ opacity: 0.6, marginBottom: '20px' }}>Logged in as: {sessionStorage.getItem('driverId')}</p>
        
        {!isSharing ? (
          <div>
            <input 
              type="text" placeholder="ENTER BUS NUMBER" 
              value={busNumber} onChange={(e) => setBusNumber(e.target.value)}
              style={{ padding: '15px', width: '100%', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #39FF14', color: 'white', textAlign: 'center', marginBottom: '20px', outline: 'none' }}
            />
            <button 
              onClick={() => { if(busNumber) setIsSharing(true); else alert("Enter Bus No"); }}
              style={{ width: '100%', padding: '15px', background: '#39FF14', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              START SHARING
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📡</div>
            <h2 style={{ color: '#39FF14' }}>SHARING ACTIVE</h2>
            <p>Bus {busNumber} is now live on SVIT Map.</p>
            <button 
              onClick={() => setIsSharing(false)}
              style={{ marginTop: '20px', padding: '10px 25px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              STOP SHARING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDash;