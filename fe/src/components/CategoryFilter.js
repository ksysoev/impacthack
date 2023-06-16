export default function CategoryFilter({ categories, selectedCategory, onCategorySelect }) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            className={`p-2 rounded ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    );
  }
  