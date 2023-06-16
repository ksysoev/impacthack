import { useState } from 'react';
import SearchBar from './SearchBar';

export default function Sidebar({ locations, selectedLocation, onLocationSelect }) {
  const [searchValue, setSearchValue] = useState('');

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="absolute top-0 right-0 h-screen w-80 bg-white text-black p-5 overflow-auto shadow-lg">
      <SearchBar value={searchValue} onChange={e => setSearchValue(e.target.value)} />
      {filteredLocations.map(location => (
        <div
          key={location.id}
          className={`p-4 ${selectedLocation?.id === location.id ? 'bg-blue-100' : ''}`}
          onClick={() => onLocationSelect(location)}
        >
          <h2 className="text-xl text-black font-bold">{location.name}</h2>
          <p className="mt-2 text-black">{location.description}</p>
        </div>
      ))}
    </div>
  );
}
