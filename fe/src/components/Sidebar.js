import { useState } from "react";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import { useDispatch, useSelector } from "react-redux";
import {
  clearLocation,
  setLocation,
  setZoomMarker,
} from "../store/reducers/locationSlice";
import checkmark from "../../src/assets/checkmark.svg";
import Image from "next/image";

export default function Sidebar({ locations, onLocationSelect }) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.vroom.location);
  const zoomMarker = useSelector((state) => state.vroom.zoomMarker);

  const categories = [
    ...new Set(locations.flatMap((location) => location.categories)),
  ];

  const handleLocationSelect = (location) => {
    if (selectedLocation?.id === location.id) {
      dispatch(clearLocation());
      dispatch(setZoomMarker(13));
      onLocationSelect(null);
    } else {
      dispatch(setZoomMarker(16));
      dispatch(setLocation(location));
      onLocationSelect(location);
    }
  };

  const searchWords = searchValue.toLowerCase().split(" ");

  const filteredLocations = locations.filter((location) => {
    const locationString = [
      location.name,
      location.description,
      ...location.brands,
      ...location.categories,
    ]
      .join(" ")
      .toLowerCase();

    return (
      searchWords.every((word) => locationString.includes(word)) &&
      (!selectedCategory || location.categories.includes(selectedCategory))
    );
  });

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
          <h2 className="text-xl text-black font-bold flex">
            {location.name}
            {location.reliability > 3 ? (
              <Image src={checkmark} height={25} width={25} />
            ) : (
              ""
            )}
          </h2>
          <p className="mt-2 text-black">
            {location.description}
            {console.log(location)}
          </p>
        </div>
      ))}
    </div>
  );
}
