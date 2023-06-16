import { useState } from 'react';
import Map from '../components/Map';
import Sidebar from '../components/Sidebar';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locations = [
    // Replace with your actual data
    { id: 1, name: 'Location 1', description: 'Description 1', latitude: 5.2257767, longitude: 100.4466656 },
    { id: 2, name: 'Location 2', description: 'Description 2', latitude: 5.2253535, longitude: 100.4677676 },
    { id: 3, name: 'Location 3', description: 'Description 3', latitude: 5.2123137, longitude: 100.8098336 },
  ];

  return (
    <div className="relative h-screen">
      <Map locations={locations} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
      <Sidebar locations={locations} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
    </div>
  );
}
