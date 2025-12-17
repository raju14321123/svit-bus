import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

const busIcon3D = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', 
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [40, 40],       
  iconAnchor: [20, 40],     
  popupAnchor: [0, -35],    
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
    <div className="dash-root">
      <style>
        {`
          /* PREVENT OVERFLOW CUTTING */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          .dash-root {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden; /* Stops content from bleeding off edges */
          }

          /* COMPACT HEADER */
          header {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(34, 211, 238, 0.2);
          }

          /* HORIZONTAL BUBBLE SELECTOR (As per your sketch) */
          .bubble-scroll-container {
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
            padding: 15px 20px; /* Padding prevents button cutting at edges */
            display: flex;
            gap: 15px;
            -webkit-overflow-scrolling: touch;
          }
          .bubble-scroll-container::-webkit-scrollbar { display: none; }

          .bus-bubble {
            display: inline-block;
            padding: 10px 25px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(250, 204, 21, 0.4);
            color: #facc15;
            border-radius: 50px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            flex-shrink: 0;
          }

          .bus-bubble.active {
            background: #facc15;
            color: #000;
            box-shadow: 0 0 20px #facc15;
            border-color: #fff;
            transform: scale(1.05);
          }

          /* MIDDLE MAP SECTION */
          .map-box {
            flex: 1; /* Takes remaining middle space */
            margin: 0 15px;
            border-radius: 25px;
            overflow: hidden;
            border: 1px solid rgba(34, 211, 238, 0.3);
            position: relative;
          }

          /* BOTTOM LIVE FEED */
          .live-feed-panel {
            height: 25vh;
            padding: 20px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.2);
          }

          .feed-item {
            padding: 12px;
            background: rgba(250, 204, 21, 0.05);
            border-left: 4px solid #facc15;
            border-radius: 8px;
            margin-bottom: 10px;
          }

          @media (max-width: 480px) {
            header h1 { font-size: 1.3rem !important; }
            .bus-bubble { padding: 8px 20px; }
          }
        `}
      </style>

      <header>
        <div>
          <h1 style={{ letterSpacing: '3px', textShadow: '0 0 10px #22d3ee' }}>SVIT DASH</h1>
          <small style={{ color: '#818cf8', letterSpacing: '1px' }}>SYSTEM ONLINE</small>
        </div>
        <button 
          onClick={() => { sessionStorage.clear(); navigate('/'); }}
          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}
        >
          LOGOUT
        </button>
      </header>

      {/* HORIZONTAL BUBBLE ROW */}
      <div className="bubble-scroll-container">
        <div 
          className={`bus-bubble ${!selectedBus ? 'active' : ''}`} 
          onClick={() => setSelectedBus(null)}
        >
          📍 ALL BUSES
        </div>
        {buses.map((bus) => (
          <div 
            key={bus.id} 
            className={`bus-bubble ${selectedBus?.bus_number === bus.bus_number ? 'active' : ''}`}
            onClick={() => setSelectedBus(bus)}
          >
            BUS NO: {bus.bus_number}
          </div>
        ))}
      </div>

      {/* MAP CENTERED IN THE MIDDLE */}
      <div className="map-box">
        <MapContainer center={[15.8281, 78.0373]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
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

      {/* LIVE FEED AT THE BOTTOM */}
      <div className="live-feed-panel">
        <h3 style={{ color: '#facc15', fontSize: '14px', marginBottom: '15px', letterSpacing: '2px' }}>SVIT LIVE FEED</h3>
        {announcements.map((ann) => (
          <div key={ann.id} className="feed-item">
            <strong style={{ color: '#facc15', fontSize: '13px' }}>{ann.title}</strong>
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{ann.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDash;