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
  styles: [
    {
      featureType: "poi",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ],
};

export default function Map({ locations, onLocationSelect }) {
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location);
  const [markers, setMarkers] = useState([]);
  const center = selectedLocation
    ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
    : { lat: 3.139003, lng: 101.686855 };;
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvvqrAP6nZLVQfvn4HiHYja_vhL41hEEA", // Exposing it for dev
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    dispatch(setLocation(marker.location));
    onLocationSelect(marker.location);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
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
      zoom={12}
      center={center}
      options={options}
      onClick={() => handleInfoWindowClose()}
    >
      {markers.map((marker) => (
        <>
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => handleMarkerClick(marker)}
          />
          {selectedMarker && selectedMarker.id === marker.id && (
            <InfoWindow
              position={marker.position}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="text-black w-[200px] h-auto">
                <h3>{marker.location.name}</h3>
                <div>
                  <h4>Categories:</h4>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from(new Set(marker.location.categories)).map(
                      (category) => (
                        <p
                          key={category}
                          className="py-1 px-2 rounded-full text-xs font-thin bg-gray-500 text-white"
                        >
                          {category}
                        </p>
                      )
                    )}
                  </div>
                </div>
                {/* Additional information to display */}
              </div>
            </InfoWindow>
          )}
        </>
      ))}
    </GoogleMap>
  );
}
