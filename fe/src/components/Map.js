import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};



const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export default function Map({ locations, selectedLocation, onLocationSelect }) {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const center = selectedLocation
? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
: { lat: 5.2257767, lng: 100.4426336 }; // Default center is Malaysia


  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBvvqrAP6nZLVQfvn4HiHYja_vhL41hEEA',
  });

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  useEffect(() => {
    if (isLoaded) {
      // Perform any additional setup or operations related to map initialization
      setMarkers(locations.map((location) => ({
        id: location.id,
        position: { lat: location.latitude, lng: location.longitude },
      })));
    }
  }, [isLoaded, locations]);

  if (!isLoaded) return 'Loading Maps';

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={8}
      center={center}
      options={options}
      onClick={() => setSelectedMarker(null)}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          onClick={() => handleMarkerClick(marker)}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={handleInfoWindowClose}
        >
          <div>
            <h2>{selectedMarker.name}</h2>
            <p>{selectedMarker.description}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
