import LocationCard from "@/components/LocationCard";
import { useState } from "react";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import Head from "next/head";
import Script from "next/script";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const locations = [
    // Replace with your actual data
    {
      id: 1,
      name: "Location 1",
      description: "Description 1",
      latitude: 5.2257767,
      longitude: 100.4426336,
      categories: ["Category 1", "Category 2"],
    },
    {
      id: 2,
      name: "Location 2",
      description: "Description 2",
      latitude: 5.2257767,
      longitude: 100.4426336,
      categories: ["Category 2", "Category 3"],
    },
    {
      id: 3,
      name: "Location 3",
      description: "Description 3",
      latitude: 5.2257767,
      longitude: 100.4426336,
      categories: ["Category 1", "Category 3"],
    },
  ];

  return (
    <>
      <Head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`}
          strategy="beforeInteractive"
        />
      </Head>
      <div className="relative h-screen">
        <Sidebar
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
        {selectedLocation ? (
          <LocationCard
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
          />
        ) : (
          <></>
        )}
        <div className="container">
          <Map
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </div>
      </div>
    </>
  );
}
