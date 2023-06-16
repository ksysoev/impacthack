export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="w-full p-2 mb-4 border border-gray-300 rounded"
      type="text"
      placeholder="Search..."
      value={value}
      onChange={onChange}
    />
  );
}
