import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import SelectedPin from '../../public/icons/selected-pin.png';
import Pin from '../../public/icons/pin.png';

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
    // Change this
    googleMapsApiKey: "AIzaSyBvvqrAP6nZLVQfvn4HiHYja_vhL41hEEA",
  });

  useEffect(() => {
    if (isLoaded) {
      setSize(new window.google.maps.Size(25, 25));
    }
  }, [isLoaded]);

  if (!isLoaded) return "Loading Maps";

  return (
    <GoogleMap className="overflow-hidden" mapContainerStyle={mapContainerStyle} zoom={13} center={center}>
      {locations.map(location => (
        <Marker
        
          key={location.id}
          position={{ lat: location.latitude, lng: location.longitude }}
          onClick={() => onLocationSelect(location)}
          icon={{
            url: selectedLocation?.id === location.id ? `${SelectedPin}` : `${Pin}`,
            scaledSize: size,
          }}
        >
          {console.log({ lat: location.latitude, lng: location.longitude })}
          {selectedLocation?.id === location.id && (
            <InfoWindow position={{ lat: location.latitude, lng: location.longitude }}>
              <div>
                <h2>{location.name}</h2>
                <p>{location.description}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
