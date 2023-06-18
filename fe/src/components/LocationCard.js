import Image from "next/image";
import close from "../../public/icons/close.png";
import { useSelector } from "react-redux";

export default function LocationCard({ onClose }) {
  const selectedLocation = useSelector((state) => state.vroom.location);
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDate = new Date();
  const currentDay = daysOfWeek[currentDate.getUTCDay()];
  const currentHour = currentDate.getUTCHours() + 8; // Add 8 hours to convert to GMT+8

  const handleClose = (event) => {
    event.stopPropagation();
    onClose();
  };

  const handleImageClick = () => {
    console.log("Image clicked");
  };

  const uniqueCategories = [...new Set(selectedLocation.categories)];

  const getCurrentWorkingHours = () => {
    const workingHours = selectedLocation.working_hours[currentDay];

    if (workingHours) {
      if (workingHours !== "Open 24 hours" && workingHours !== "Closed") {
        const [openingHour, closingHour] = workingHours.split("-");
        const openingTime = parseInt(openingHour.split(" ")[0]); // Split by non-breaking space
        const closingTime = parseInt(closingHour.split(" ")[0]); // Split by non-breaking space

        if (currentHour >= openingTime && currentHour < closingTime) {
          return ["Open", workingHours];
        } else {
          return ["Closed", workingHours];
        }
      } else if (workingHours === "Open 24 hours") {
        return "Open 24 Hours";
      } else {
        return "Closed";
      }
    } else {
      return "Closed"; // Default to "Closed" if there are no working hours for the current day
    }
  };
  const currentWorkingHours = getCurrentWorkingHours();

  return (
    <div
      className="absolute top-0 left-96 h-auto w-96 p-2 overflow-hidden z-20"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="bg-white text-black rounded-lg p-5 shadow-lg h-full overflow-auto">
        <button
          className="absolute top-0 right-0 mr-6 mt-6"
          onClick={handleClose}
        >
          <Image width={16} height={16} src={close} />
        </button>
        <h2 className="text-xl text-black font-bold">
          {selectedLocation.name}
        </h2>
        <p className="mt-2 text-black">{selectedLocation.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {uniqueCategories.map((category) => (
            <p
              key={category}
              className="py-1 px-2 rounded-full text-sm font-thin bg-gray-500 text-white"
            >
              {category}
            </p>
          ))}
        </div>
        {}
        {selectedLocation.working_hours && (
          <div className="mt-4">
            <h3 className="text-lg text-black font-bold mb-2">Working Hours</h3>
            <p className="text-black">
              {Array.isArray(currentWorkingHours) ? (
                <>
                  {currentWorkingHours[0] === "Open" ? (
                    <span className="text-green-500">
                      {currentWorkingHours[0]}
                    </span>
                  ) : (
                    <span className="text-red-500">
                      {currentWorkingHours[0]}
                    </span>
                  )}
                  &nbsp;-&nbsp;<span>{currentWorkingHours[1]}</span>
                </>
              ) : (
                <>
                  {currentWorkingHours === "Closed" ? (
                    <span className="text-red-500">{currentWorkingHours}</span>
                  ) : (
                    <span className="text-green-500">
                      {currentWorkingHours}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-lg text-black font-bold mb-2">Store Links</h3>
          <a
            href={selectedLocation.storeLink}
            className="text-blue-500 underline"
          >
            Visit Store
          </a>
        </div>
        {selectedLocation.photos.length > 0 && (
          <div className="mt-4 w-full">
            <img
              className="rounded-lg"
              src={selectedLocation.photos[0]} // Use the first photo from the photos array
              alt="Store Image"
              objectFit="cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
