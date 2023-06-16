import Image from "next/image";
import close from '../../public/icons/close.png'

export default function LocationCard({ location, onClose }) {
  return (
    <div className="absolute top-0 right-80 h-screen w-80 p-2 overflow-auto shadow-lg mr-1">
      <div className="bg-white text-black h-full rounded-lg p-5">
        <button className="absolute top-0 right-0 mr-6 mt-6" onClick={onClose}>
          <Image width={16} height={16} src={close}/>
        </button>
        <h2 className="text-xl text-black font-bold">{location.name}</h2>
        <p className="mt-2 text-black">{location.description}</p>
        <p className="mt-2 text-black">{location.categories.join(", ")}</p>
      </div>
    </div>
  );
}
