export default function CategoryFilter({ categories, selectedCategory, onCategorySelect }) {
  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      onCategorySelect("");
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <button
          key={category}
          className={`py-1 px-2 rounded-lg text-sm font-thin outline outline-1 ${
            selectedCategory === category ? "bg-gray-500 text-white" : "bg-white"
          }`}
          onClick={() => handleCategorySelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
