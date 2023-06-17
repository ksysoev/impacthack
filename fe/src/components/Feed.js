import Image from "next/image";
import close from "../../public/icons/close.png";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export default function Feed({ onClose }) {
  const selectedLocation = useSelector((state) => state.vroom.location);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const maxHeight = window.innerHeight * 0.8; // Set a maximum height for the container
      const dynamicHeight = Math.min(containerHeight, maxHeight);
      containerRef.current.style.height = `${dynamicHeight}px`;
    }
  }, [selectedLocation.posts]);

  const handleClose = (event) => {
    event.stopPropagation();
    onClose();
  };

  const handleImageClick = () => {
    console.log("Image clicked");
  };

  return (
    <>
      {selectedLocation.posts.length > 0 && (
        <div
          className="absolute top-0 right-0 w-96 p-2 overflow-hidden z-20"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            ref={containerRef}
            className="bg-white text-black rounded-lg p-5 shadow-lg h-auto overflow-auto"
          >
            <button
              className="absolute top-0 right-0 mr-6 mt-6"
              onClick={handleClose}
            >
              <Image width={16} height={16} src={close} />
            </button>
            <h2 className="text-xl text-black font-bold">Announcements</h2>
            <div className="">
              {selectedLocation.posts.map((post, index) => (
                <div
                  key={index}
                  className="relative"
                  onClick={handleImageClick}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-20 rounded-lg" />
                  <p className="w-full mt-4 first:mt-0 p-2">{post}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
