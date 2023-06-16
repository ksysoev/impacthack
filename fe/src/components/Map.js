import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 37.7749,
  lng: -122.4194,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export default function Map({ locations, selectedLocation, onLocationSelect }) {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBvvqrAP6nZLVQfvn4HiHYja_vhL41hEEA', // Exposing it for dev
  });

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    onLocationSelect(marker.location); // Pass the selected location to the onLocationSelect callback
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
    onLocationSelect(null); // Clear the selected location by passing null to the onLocationSelect callback
  };

  useEffect(() => {
    if (isLoaded) {
      // Perform any additional setup or operations related to map initialization
      setMarkers(locations.map((location) => ({
        id: location.id,
        position: { lat: location.latitude, lng: location.longitude },
        location: location, // Store the location data in the marker
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
      onClick={() => handleInfoWindowClose()}
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
            <h2>{selectedMarker.location.name}</h2>
            <p>{selectedMarker.location.description}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
