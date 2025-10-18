'use client';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 transform hover:scale-105
              ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
