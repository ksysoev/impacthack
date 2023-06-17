import LocationCard from "@/components/LocationCard";
import { useState, useEffect } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Head from "next/head";
import Script from "next/script";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://ocrtynfrqk.execute-api.ap-southeast-1.amazonaws.com/dev");
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
        const formattedLocations = data.map((shop) => ({
          id: shop.shopName,
          name: shop.shopName,
          description: shop.address,
          latitude: parseFloat(shop.latitude),
          longitude: parseFloat(shop.longitude),
          categories: Object.values(shop.products).map((category) =>
            categoryMapping[category] || category
          ),
        }));

        setLocations(formattedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchData();
  }, []);
  
  // const locations = [
  //   // Replace with your actual data
  //   {
  //     id: 1,
  //     name: "High Beam Accessories",
  //     description: "We sell parts you need to keep flashing cars on the right lane.",
  //     latitude: 5.2257767,
  //     longitude: 100.4426336,
  //     categories: ["Accessories", "Parts"],
  //   },
  //   {
  //     id: 2,
  //     name: "Gasket Blown Workshop",
  //     description: "Engine problem? No problem, we'll fix it for an affordable price.",
  //     latitude: 5.2257767,
  //     longitude: 100.4466336,
  //     categories: ["Service", "Repair"],
  //   },
  //   {
  //     id: 3,
  //     name: "Towed Tuning",
  //     description: "We tune your car to the max performance it can perform. We provide Dyno and Remap services",
  //     latitude: 5.2257767,
  //     longitude: 100.4486336,
  //     categories: ["Tuning", "Performance"],
  //   },
  // ];

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
              <LocationCard
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
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
