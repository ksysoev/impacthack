import LocationCard from "@/components/LocationCard";
import { useState, useEffect } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Head from "next/head";
import Script from "next/script";
import Feed from "@/components/Feed";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://ocrtynfrqk.execute-api.ap-southeast-1.amazonaws.com/dev"
        );
        const data = await response.json();
        const categoryMapping = {
          "Suspension and Steering Components": "Suspension",
          "Fuel System Components": "Fuel System",
          "Interior and Exterior Components": "Interior/Exterior",
          "Cooling System Components": "Cooling System",
          "Transmission and Drivetrain Components": "Transmission/Drivetrain",
          "Braking System Components": "Braking System",
          "Engine Components": "Engine",
          "Electrical Components": "Electronics",
          "Air Conditioning System Components": "Air Conditioning System",
          "Exhaust System Components": "Exhaust System",
          "Wheels and Tires": "Wheels/Tires",
          "Accessories and Fluids": "Accessories/Fluids",
          "Tools and Equipment": "Tools/Equipment",
        };

        const formattedLocations = data.map((shop) => {
          const photos = shop.photos || [];
          const logo = shop.logo || "";
          const categories = Object.values(shop.products).map(
            (category) => categoryMapping[category] || category
          );
          const posts = shop.posts || []; // Add this line to handle the posts data
          return {
            id: shop.shopName,
            name: shop.shopName,
            description: shop.address,
            latitude: parseFloat(shop.latitude),
            longitude: parseFloat(shop.longitude),
            working_hours: shop.working_hours,
            categories,
            photos,
            logo,
            posts, // Include the posts data in the formatted location object
          };
        });

        setLocations(formattedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="relative h-screen">
        <div className="flex">
          <div className="w-80">
            <Sidebar
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
          <div className="flex-grow">
            {selectedLocation ? (
              <>
                <LocationCard
                  location={selectedLocation}
                  onClose={() => setSelectedLocation(null)}
                />
                <Feed
                location={selectedLocation["posts"]}
                onClose={() => setSelectedLocation(null)}
                />
              </>
            ) : (
              <></>
            )}
            <div className="w-full h-screen">
              <Map
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
