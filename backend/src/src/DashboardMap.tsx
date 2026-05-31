import { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import "./StaffForm.css";

const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "650px"
};

const center = {
  lat: 25.2048,
  lng: 55.2708
};

export default function DashboardMap() {
  const [staff, setStaff] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_KEY
  });

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    const response = await fetch(`${API_URL}/api/staff`);
    const data = await response.json();

    setStaff(data);
    geocodeStaff(data);
  }

  async function geocodeStaff(data: any[]) {
    const results: any[] = [];

    for (const person of data) {
      if (!person.country && !person.town) continue;

      const location = `${person.town || ""}, ${person.country || ""}`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=${GOOGLE_KEY}`
      );

      const geo = await response.json();

      if (geo.results && geo.results.length > 0) {
        const pos = geo.results[0].geometry.location;

        results.push({
          ...person,
          lat: pos.lat,
          lng: pos.lng,
          location
        });
      }
    }

    setMarkers(results);
  }

  if (!isLoaded) {
    return <div className="container">Loading map...</div>;
  }

  return (
    <div className="container">
      <h1>Resource Location Dashboard</h1>
      <p className="subtitle">
        Staff distribution based on Town and Country
      </p>

      <div className="card">
        <h2>Summary</h2>
        <p>Total Staff: {staff.length}</p>
        <p>Mapped Staff: {markers.length}</p>
      </div>

      <div className="card">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          center={center}
        >
          {markers.map((person) => (
            <Marker
              key={person.id}
              position={{
                lat: person.lat,
                lng: person.lng
              }}
              onClick={() => setSelected(person)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{
                lat: selected.lat,
                lng: selected.lng
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                <strong>
                  {selected.called_name} {selected.surname}
                </strong>
                <br />
                {selected.main_discipline}
                <br />
                {selected.grade}
                <br />
                {selected.location}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
