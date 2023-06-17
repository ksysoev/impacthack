import { useState } from "react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import { useDispatch, useSelector } from "react-redux";
import { clearLocation, setLocation } from "../store/reducers/locationSlice";

export default function Sidebar({ locations, onLocationSelect }) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location);

  const categories = [
    ...new Set(locations.flatMap((location) => location.categories)),
  ];

  const handleLocationSelect = (location) => {
    if (selectedLocation?.id === location.id) {
      dispatch(clearLocation());
      onLocationSelect(null);
    } else {
      dispatch(setLocation(location));
      onLocationSelect(location);
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      (!selectedCategory || location.categories.includes(selectedCategory))
  );

  return (
    <div className="absolute top-0 left-0 h-screen w-96 bg-white text-black p-4 overflow-auto shadow-lg z-20">
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
          onClick={() => handleLocationSelect(location)}
        >
          <h2 className="text-xl text-black font-bold">{location.name}</h2>
          <p className="mt-2 text-black">{location.description}</p>
        </div>
      ))}
    </div>
  );
}
