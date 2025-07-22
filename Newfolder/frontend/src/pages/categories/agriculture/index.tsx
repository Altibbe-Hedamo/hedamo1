import React from 'react';
import { useNavigate } from 'react-router-dom';

const products = [
  {
    name: 'Honey',
    image: 'https://i.pinimg.com/1200x/67/74/eb/6774eb0765eca1871f8b8cfc0ed3b273.jpg',
    description: 'Pure, natural honey from local farms.'
  },
  {
    name: 'Turmeric',
    image: 'https://i.pinimg.com/1200x/62/65/94/626594316582fa50d318629c6eff26cd.jpg',
    description: 'Organic turmeric roots and powder.'
  },
  {
    name: 'Ginger',
    image: 'https://i.pinimg.com/736x/e5/01/65/e5016590f234af60811ece4e2a792f67.jpg',
    description: 'Fresh ginger, perfect for cooking and tea.'
  },
  {
    name: 'Wheat',
    image: 'https://i.pinimg.com/736x/c1/98/7a/c1987a9480a97f853732130179fb9300.jpg',
    description: 'High-quality wheat grains.'
  },
  {
    name: 'Mirchi',
    image: 'https://i.pinimg.com/736x/a9/b3/db/a9b3dba88a82b878cb7fbc1f6b039691.jpg',
    description: 'Spicy red and green chillies.'
  },
  {
    name: 'Avocado',
    image: 'https://i.pinimg.com/1200x/ac/d2/a6/acd2a69e1a74671db1555c62203a91b7.jpg',
    description: 'Fresh, creamy avocados.'
  },
  {
    name: 'Tomatoes',
    image: 'https://i.pinimg.com/736x/bb/b1/17/bbb1178529527d43307156a74718eb33.jpg',
    description: 'Juicy, ripe tomatoes.'
  },
  {
    name: 'Lettuce',
    image: 'https://i.pinimg.com/1200x/cb/15/1e/cb151e3a740218471bd46e5128f7de4a.jpg',
    description: 'Crisp, green lettuce leaves.'
  },
  {
    name: 'Ragi',
    image: 'https://i.pinimg.com/736x/41/3d/58/413d58bab60485dd1a0416e42d55073a.jpg',
    description: 'Nutritious ragi grains.'
  },
];

const AgricultureCategory: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-4 text-center">Agriculture Products</h1>
      <div className="max-w-5xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 relative cursor-pointer"
            onClick={product.name === 'Honey' ? () => navigate('/agriculture/honey-varieties') : undefined}
          >
            {/* Heart icon button */}
            <button
              className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-red-100 group"
              aria-label="Add to favorites"
              onClick={e => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.75a5.25 5.25 0 0 1 4.09 8.6l-7.09 7.85a.75.75 0 0 1-1.1 0l-7.09-7.85A5.25 5.25 0 1 1 12 7.25a5.25 5.25 0 0 1 4.5-3.5z"
                />
              </svg>
            </button>
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-green-800 mb-1">{product.name}</h2>
              <p className="text-gray-600 text-sm flex-1">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgricultureCategory; 