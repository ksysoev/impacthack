import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLocation, clearLocation } from "@/store/reducers/locationSlice";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};


const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export default function Map({ locations, onLocationSelect }) {
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location);
  const [markers, setMarkers] = useState([]);
  const center = selectedLocation
  ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
  : { lat: 5.2257767, lng: 100.4426336 }; // Default center is Malaysia


  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvvqrAP6nZLVQfvn4HiHYja_vhL41hEEA", // Exposing it for dev
  });

  const handleMarkerClick = (marker) => {
    dispatch(setLocation(marker.location));
    onLocationSelect(marker.location);

  };

  const handleInfoWindowClose = () => {
    dispatch(clearLocation());
    onLocationSelect(null);
  };

  

  useEffect(() => {
    if (isLoaded) {
      // Perform any additional setup or operations related to map initialization
      setMarkers(
        locations.map((location) => ({
          id: location.id,
          position: { lat: location.latitude, lng: location.longitude },
          location: location, // Store the location data in the marker
        }))
      );
    }
  }, [isLoaded, locations]);

  if (!isLoaded) return "Loading Maps";

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
    </GoogleMap>
  );
}
