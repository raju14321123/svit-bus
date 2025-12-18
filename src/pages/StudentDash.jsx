import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

const busIcon3D = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', 
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [45, 45],       
  iconAnchor: [22, 45],     
  popupAnchor: [0, -40],    
});

function MapFocus({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat && target.lng) {
      map.setView([target.lat, target.lng], 16);
    }
  }, [target, map]);
  return null;
}

const StudentDash = () => {
  const [buses, setBuses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: bData } = await supabase.from('buses').select('*');
      const { data: aData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      setBuses(bData || []);
      setAnnouncements(aData || []);
    };
    fetchData();

    const channel = supabase.channel('bus-updates').on('postgres_changes', { 
      event: 'UPDATE', schema: 'public', table: 'buses' 
    }, (payload) => {
      setBuses((prev) => prev.map(b => b.bus_number === payload.new.bus_number ? payload.new : b));
    }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="dash-root" style={{ 
      padding: '20px', 
      fontFamily: 'Segoe UI, sans-serif', 
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', 
      minHeight: '100vh',
      color: 'white',
      overflow: 'hidden'
    }}>
      
      <style>
        {`
          @keyframes neonPulse {
            0%, 100% { border-color: #22d3ee; box-shadow: 0 0 10px #22d3ee; }
            50% { border-color: #818cf8; box-shadow: 0 0 25px #818cf8; }
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          /* LIQUID RIPPLE EFFECT FOR BUTTONS */
          @keyframes rippleEffect {
            0% { width: 0; height: 0; opacity: 0.5; }
            100% { width: 500px; height: 500px; opacity: 0; }
          }

          .neon-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid #22d3ee;
            border-radius: 20px;
            animation: neonPulse 4s infinite ease-in-out;
          }

          .move-btn-yellow {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
            border: 2px solid #fef08a;
            color: #000;
            padding: 14px;
            border-radius: 12px;
            cursor: pointer;
            width: 100%;
            text-align: left;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-bottom: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);
          }

          /* CLICK RIPPLE ELEMENT */
          .move-btn-yellow::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 100%;
            transform: translate(-50%, -50%);
          }

          .move-btn-yellow:active::after {
            animation: rippleEffect 0.6s ease-out;
          }

          .move-btn-yellow:hover {
            transform: translateX(12px) scale(1.02);
            background: #fff;
            box-shadow: 0 0 30px #facc15, -10px 0 20px #eab308;
          }

          .move-btn-yellow.selected {
             background: #ffffff;
             border-color: #fff;
             box-shadow: 0 0 40px #facc15;
             transform: translateX(15px);
          }

          .notice-item {
            animation: slideUp 0.5s ease-out forwards;
          }

          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #facc15; border-radius: 10px; }
        `}
      </style>

      <header className="neon-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', letterSpacing: '4px', textShadow: '0 0 10px #22d3ee' }}>SVIT DASH</h1>
          <small style={{ color: '#818cf8', letterSpacing: '2px' }}>CONNECTED TO SVIT-FLEET-CORE</small>
        </div>
        <button 
          onClick={() => { sessionStorage.clear(); navigate('/'); }}
          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}
          onMouseOver={(e) => e.target.style.background = '#ef4444' + '22'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          LOGOUT
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: '20px', height: '78vh' }}>
        
        <div className="neon-card" style={{ padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ color: '#facc15', textShadow: '0 0 10px rgba(250, 204, 21, 0.5)', marginBottom: '20px', letterSpacing: '2px' }}>SELECT BUS</h3>
          {buses.map((bus) => (
            <button 
              key={bus.id} 
              className={`move-btn-yellow ${selectedBus?.id === bus.id ? 'selected' : ''}`}
              onClick={() => setSelectedBus(bus)}
            >
              <strong>BUS {bus.bus_number}</strong>
              <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '4px' }}>
                {bus.is_active ? "● SIGNAL STRENGTH: HIGH" : "○ CONNECTION LOST"}
              </div>
            </button>
          ))}
        </div>

        <div className="neon-card" style={{ overflow: 'hidden', padding: '5px' }}>
          <MapContainer center={[15.8281, 78.0373]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '15px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {buses.map(bus => (
              bus.lat !== 0 && (
                <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon3D}>
                  <Popup><strong>SVIT BUS {bus.bus_number}</strong></Popup>
                </Marker>
              )
            ))}
            {selectedBus && <MapFocus target={selectedBus} />}
          </MapContainer>
        </div>

        <div className="neon-card" style={{ padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ color: '#facc15', textShadow: '0 0 5px #facc15', marginBottom: '20px' }}>SVIT LIVE FEED</h3>
          {announcements.map((ann, index) => (
            <div 
              key={ann.id} 
              className="notice-item" 
              style={{ 
                animationDelay: `${index * 0.1}s`,
                marginBottom: '15px', 
                padding: '15px', 
                background: 'rgba(250, 204, 21, 0.05)', 
                borderRadius: '12px', 
                borderLeft: '4px solid #facc15' 
              }}
            >
              <strong style={{ color: '#facc15' }}>{ann.title}</strong>
              <p style={{ fontSize: '13px', margin: '5px 0', opacity: 0.8 }}>{ann.content}</p>
              <small style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(ann.created_at).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentDash;