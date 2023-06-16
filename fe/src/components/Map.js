import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

export default function Map({ locations, selectedLocation, onLocationSelect }) {
  const [size, setSize] = useState(null);
  const center = selectedLocation
    ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
    : { lat: 5.2257767, lng: 100.4426336 }; // Default center is Malaysia

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (isLoaded) {
      setSize(new window.google.maps.Size(25, 25));
    }
  }, [isLoaded]);

  if (!isLoaded) return "Loading Maps";

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={13} center={center}>
      {locations.map(location => (
        <Marker
          key={location.id}
          position={{ lat: location.latitude, lng: location.longitude }}
          onClick={() => onLocationSelect(location)}
          icon={{
            url: selectedLocation?.id === location.id ? '/icons/selected-pin.png' : '/icons/pin.png',
            scaledSize: size,
          }}
        />
      ))}
    </GoogleMap>
  );
}
