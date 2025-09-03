import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const getShapeByMagnitude = (mag) => {
  if (mag >= 6) {
    return "▲"; // Triangle for big quakes
  } else if (mag >= 5) {
    return "◆"; // Diamond
  } else if (mag >= 4) {
    return "⬣"; // Hexagon
  } else if (mag >= 3) {
    return "⬤"; // Circle
  } else {
    return "✦"; // Star for small
  }
};

const getIconByMagnitude = (mag) => {
  let color = "#00ffff";
  let size = 20;
  if (mag >= 6) { color = "#ff4d4d"; size = 40; }
  else if (mag >= 5) { color = "#ff9933"; size = 35; }
  else if (mag >= 4) { color = "#ffff66"; size = 30; }
  else if (mag >= 3) { color = "#66ff66"; size = 25; }

  return L.divIcon({
    html: `<span class="quake-symbol" style="color:${color}; font-size:${size}px;">${getShapeByMagnitude(mag)}</span>`,
    className: "custom-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")
      .then((res) => res.json())
      .then((data) => {
        setEarthquakes(data.features);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch earthquake data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading Earthquake Data...</div>;
  if (error) return <div className="error">{error}</div>;

  const bounds = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div className="app-container">
      <div className="map-box">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          minZoom={2}
          maxZoom={8}
          scrollWheelZoom={true}
          className="leaflet-map"
          maxBounds={bounds}
          maxBoundsViscosity={0.9}
          worldCopyJump={false}
          noWrap={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            noWrap={true}
          />

          {earthquakes.map((eq) => {
            const [lon, lat] = eq.geometry.coordinates;
            const mag = eq.properties.mag || 0;

            return (
              <Marker
                key={eq.id}
                position={[lat, lon]}
                icon={getIconByMagnitude(mag)}
              >
                <Popup className="popup">
                  <div>
                    <strong>Place:</strong> {eq.properties.place}<br />
                    <strong>Magnitude:</strong> {mag}<br />
                    <strong>Time:</strong> {new Date(eq.properties.time).toLocaleString()}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="legend-bottom">
        <h3>Earthquake Symbols</h3>
        <div><span className="red-circle">▲</span> Magnitude 6+</div>
        <div><span className="orange-circle">◆</span> Magnitude 5–5.9</div>
        <div><span className="yellow-circle">⬣</span> Magnitude 4–4.9</div>
        <div><span className="green-circle">⬤</span> Magnitude 3–3.9</div>
        <div><span className="cyan-circle">✦</span> Magnitude 0–2.9</div>
      </div>
    </div>
  );
}

export default App;
