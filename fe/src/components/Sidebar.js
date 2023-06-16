export default function Sidebar({ locations, selectedLocation, onLocationSelect }) {
  return (
    <div className="absolute top-0 left-0 h-screen w-80 bg-white p-5 text-black overflow-auto shadow-lg">
      {locations.map(location => (
        <div
          key={location.id}
          className={`p-4 ${selectedLocation?.id === location.id ? 'bg-blue-100' : ''}`}
          onClick={() => onLocationSelect(location)}
        >
          <h2 className="text-xl font-bold">{location.name}</h2>
          <p className="mt-2">{location.description}</p>
        </div>
      ))}
    </div>
  );
}
