import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DriverDash = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [busNumber, setBusNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('driverId');
    if (!user) navigate('/driver');
  }, [navigate]);

  useEffect(() => {
    let watchId;

    const sendToDatabase = async (lat, lng) => {
      const { data, error } = await supabase
        .from('buses')
        .update({ 
          lat: lat, 
          lng: lng, 
          is_active: true,
          last_updated: new Date().toISOString() 
        })
        .eq('bus_number', busNumber)
        .select();

      if (error) {
        console.error("SQL Error:", error.message);
      } else if (data.length === 0) {
        console.error("Bus Number not found in database. Check Admin Dash.");
      }
    };

    if (isSharing && busNumber) {
      // MODIFIED: Increased timeout and allowed lower accuracy fallback to prevent "Timeout expired"
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          sendToDatabase(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          // If it's just a timeout, we log it but don't stop the sharing
          if (err.code === 3) {
            console.warn("GPS Timeout: Signal is weak, still trying...");
          } else {
            alert("GPS Error: " + err.message);
            setIsSharing(false);
          }
        },
        { 
          enableHighAccuracy: false, // Set to false to get signal faster indoors
          maximumAge: 0,         // Use location from last 30 seconds
          timeout: 10000             // Wait 15 seconds before timing out
        }
      );
    } else if (!isSharing && busNumber) {
      supabase.from('buses').update({ is_active: false }).eq('bus_number', busNumber);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing, busNumber]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`
          @media (max-width: 500px) {
            .driver-card-container { width: 90% !important; padding: 30px 20px !important; }
            h1 { font-size: 1.5rem !important; }
          }
      `}</style>
      <div className="driver-card-container" style={{ padding: '50px', borderRadius: '30px', border: '2px solid #39FF14', background: 'rgba(15, 23, 42, 0.8)', textAlign: 'center', width: '400px' }}>
        <h1 style={{ color: '#39FF14', textShadow: '0 0 10px #39FF14' }}>DRIVER CONSOLE</h1>
        <p style={{ opacity: 0.6 }}>Driver: {sessionStorage.getItem('driverId')}</p>
        {!isSharing ? (
          <div>
            <input type="text" placeholder="ENTER BUS NUMBER" value={busNumber} onChange={(e) => setBusNumber(e.target.value)}
              style={{ padding: '15px', width: '100%', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #39FF14', color: 'white', textAlign: 'center', marginBottom: '20px' }} />
            <button onClick={() => { if(busNumber) setIsSharing(true); else alert("Enter Bus No"); }}
              style={{ width: '100%', padding: '15px', background: '#39FF14', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              START SHARING
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem' }}>📡</div>
            <h2 style={{ color: '#39FF14' }}>SHARING ACTIVE</h2>
            <p>Bus {busNumber} is Live</p>
            <button onClick={() => setIsSharing(false)} style={{ padding: '10px 25px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}>STOP SHARING</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDash;