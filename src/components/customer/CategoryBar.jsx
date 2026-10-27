import React from 'react';
import { useStore } from '../../context/StoreContext';
import { INITIAL_CATEGORIES } from '../../data/initialData';
import {
  Sparkles,
  Headphones,
  Watch,
  Shirt,
  Home,
  Briefcase,
  Filter,
  ArrowUpDown
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Headphones,
  Watch,
  Shirt,
  Home,
  Briefcase,
};

export default function CategoryBar() {
  const {
    selectedCategory,
    setSelectedCategory,
    products,
    sortBy,
    setSortBy
  } = useStore();

  const getProductCount = (catId) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
          {INITIAL_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            const isSelected = selectedCategory === cat.id;
            const count = getProductCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-gray-500'}`} />
                <span>{cat.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="featured">Featured / Best Deals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

      </div>
    </div>
  );
}
