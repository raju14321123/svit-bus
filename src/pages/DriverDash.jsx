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

  // --- SCREEN WAKE LOCK LOGIC ---
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    if (isSharing) {
      requestWakeLock();
    } else {
      if (wakeLock) wakeLock.release().then(() => { wakeLock = null; });
    }

    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [isSharing]);

  // --- LIVE GPS TRACKING LOGIC ---
  useEffect(() => {
    let watchId;

    const sendToDatabase = async (lat, lng) => {
  if (lat === 0 || lng === 0) {
    console.warn("Phone is sending 0,0 - Waiting for better GPS signal...");
    return;
  }

  const { data, error } = await supabase
    .from('buses')
    .update({ lat, lng, is_active: true, last_updated: new Date().toISOString() })
    .eq('bus_number', busNumber)
    .select();

  if (error) alert("Database Error: " + error.message);
  if (data && data.length === 0) alert("Bus Number not found in SQL table!");
};

    if (isSharing && busNumber) {
      if (watchId) navigator.geolocation.clearWatch(watchId);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          sendToDatabase(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          if (err.code === 3) {
            console.warn("GPS Timeout: Signal is weak, still trying...");
          } else {
            alert("GPS Error: " + err.message);
            setIsSharing(false);
          }
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0,           
          timeout: 10000            
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
            <p style={{ fontSize: '0.7rem', color: '#39FF14', marginTop: '10px' }}>Keep this tab open for live tracking</p>
            <button onClick={() => setIsSharing(false)} style={{ padding: '10px 25px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' }}>STOP SHARING</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDash;