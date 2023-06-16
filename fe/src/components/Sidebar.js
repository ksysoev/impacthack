import { useState } from "react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import LocationCard from "./LocationCard";
import Chevron from "../../public/icons/chevron.png";
import LeftChevron from "../../public/icons/left-chevron.png";
import Image from "next/image";

export default function Sidebar({
  locations,
  selectedLocation,
  onLocationSelect,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    ...new Set(locations.flatMap((location) => location.categories)),
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      (!selectedCategory || location.categories.includes(selectedCategory))
  );

  return (
    <div className="absolute top-0 left-0 h-screen w-80 bg-white text-black p-4 overflow-auto shadow-lg z-20">
      <SearchBar
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      {filteredLocations.map((location) => (
        <div
          key={location.id}
          className={`p-4 pl-0 ${
            selectedLocation?.id === location.id ? "bg-blue-100" : ""
          }`}
          onClick={() => onLocationSelect(location)}
        >
          <h2 className="text-xl text-black font-bold">{location.name}</h2>
          <p className="mt-2 text-black">{location.description}</p>
        </div>
      ))}
      {/* <button
        className="px-2 py-1 bg-blue-500 text-white rounded-lg absolute bottom- right-0 mb-4 mr-4"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <Image width={16} height={16} src={LeftChevron} />
        ) : (
          <Image width={16} height={16} src={Chevron} />
        )}
      </button> */}
    </div>
  );
}
