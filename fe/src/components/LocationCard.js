import Image from "next/image";
import close from "../../public/icons/close.png";
import { useDispatch, useSelector } from "react-redux";
import { clearLocation } from "../store/reducers/locationSlice";
import workshop from "../../public/images/workshop.jpg";

export default function LocationCard({ onClose }) {
  const dispatch = useDispatch();
  const selectedLocation = useSelector((state) => state.location);

  const handleClose = () => {
    dispatch(clearLocation());
    onClose();
  };

  const handleImageClick = () => {
    // Logic to handle image click and open the popup
    console.log("Image clicked");
  };

  return (
    <div className="absolute top-0 left-80 h-auto w-80 p-2 overflow-auto z-20">
      <div className="bg-white text-black h-full rounded-lg p-5 shadow-lg">
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
          {selectedLocation.categories.map((category) => (
            <p
              key={category}
              className="py-1 px-2 rounded-lg text-sm font-thin outline outline-1 bg-white"
            >
              {category}
            </p>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg text-black font-bold mb-2">Store Links</h3>
          <a
            href={selectedLocation.storeLink}
            className="text-blue-500 underline"
          >
            Visit Store
          </a>
        </div>
        <div className="mt-4 w-full">
          <Image src={workshop} alt="Store Image" objectFit="cover" />
        </div>
        <div className="mt-4">
          <h3 className="text-lg text-black font-bold mb-2">Highlights</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((image) => (
              <div
                key={image}
                className="relative cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-20 rounded-lg" />

                <Image
                  src={`/images/${image}.jpg`}
                  alt={`Image ${image}`}
                  width={200}
                  height={200}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <button className="flex items-center justify-center bg-blue-600 text-sm text-white px-4 py-2 rounded-lg w-full mb-2">
            <Image
              src="/path-to-facebook-icon"
              alt="Facebook Icon"
              width={20}
              height={20}
            />
            <span className="ml-2">Chat with Messenger</span>
          </button>
          <button className="flex items-center justify-center bg-green-500 text-sm text-white px-4 py-2 rounded-lg w-full">
            <Image
              src="/path-to-whatsapp-icon"
              alt="WhatsApp Icon"
              width={20}
              height={20}
            />
            <span className="ml-2">Chat with WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
