import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    name: 'Agriculture',
    image:
      'https://i.pinimg.com/1200x/9a/43/f5/9a43f5309d7614968fe6d71eed159520.jpg', // Wheat field
    description: 'Fresh produce and grains from local farms.',
  },
  {
    name: 'Meat & Poultry',
    image:
      'https://i.pinimg.com/1200x/38/32/e1/3832e166dfcfb30285b238bb6c70f314.jpg', // Raw meat
    description: 'Quality meats and poultry products.',
  },
  {
    name: 'Dairy',
    image:
      'https://i.pinimg.com/1200x/5b/3a/a9/5b3aa90dae83e5f7ca7d28ac757ef670.jpg', // Milk/cheese
    description: 'Milk, cheese, and other dairy essentials.',
  },
  {
    name: 'Seafood',
    image:
      'https://i.pinimg.com/1200x/55/f7/45/55f7450fff3f2eb1cd3f1470c175e3d3.jpg', // Fish
    description: 'Fresh and frozen seafood varieties.',
  },
  {
    name: 'Processed Foods',
    image:
      'https://i.pinimg.com/736x/7f/20/07/7f20079e5956da8a3299ebd20fb8e016.jpg', // Packaged food
    description: 'Convenient and ready-to-eat foods.',
  },
  {
    name: 'Textiles',
    image:
      'https://i.pinimg.com/1200x/4e/fa/f9/4efaf9972a120c416092913a9865e1a4.jpg', // Fabric
    description: 'Fabrics and textile products.',
  },
  {
    name: 'Cosmetics',
    image:
      'https://i.pinimg.com/736x/5f/15/de/5f15dedfe2733c320590e180341c8989.jpg', // Makeup
    description: 'Beauty and personal care items.',
  },
  {
    name: 'Collectives',
    image:
      'https://i.pinimg.com/1200x/12/19/69/12196926a53d97e72656dc43fa5a5512.jpg', // Group/community
    description: 'Community-driven and cooperative products.',
  },
  {
    name: 'Pet Food',
    image:
      'https://i.pinimg.com/736x/b1/07/2c/b1072cabc0dbdfbe76415f5cbc72d4a0.jpg', // Bowl of pet food with dog
    description: 'Nutritious food for your pets.',
  },
];

const getColumnCount = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) return 1; // mobile
    if (window.innerWidth < 1024) return 2; // tablet
    return 3; // desktop
  }
  return 3;
};

const ProductSkeleton = () => (
  <div className="mb-4 break-inside-avoid shadow-xl rounded-2xl overflow-hidden bg-gray-200 animate-pulse min-h-[180px] h-[220px] border border-gray-100"></div>
);

const getCardHeight = (catName: string, idx: number, width: number) => {
  if (width < 640) return 220;
  if (catName === 'Meat & Poultry') return 320;
  if (catName === 'Processed Foods') return 80;
  if (catName === 'Collectives') return 260;
  return idx % 2 === 0 ? 220 : 320;
};

const CategoryMasonry: React.FC = () => {
  const [columns, setColumns] = React.useState(getColumnCount());
  const [loading, setLoading] = React.useState(true);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Split categories into columns for masonry effect
  const masonryColumns = Array.from({ length: columns }, () => [] as typeof categories);
  categories.forEach((cat, idx) => {
    masonryColumns[idx % columns].push(cat);
  });

  return (
    <div
      className="gap-4 p-4"
      style={{
        columnCount: columns,
        columnGap: '1.5rem',
        transition: 'column-count 0.3s',
      }}
    >
      {loading
        ? Array.from({ length: 6 * columns }).map((_, i) => <ProductSkeleton key={i} />)
        : masonryColumns.map((col, colIdx) =>
            col.map((cat, idx) => (
              <div
                key={cat.name}
                tabIndex={0}
                aria-label={cat.name}
                className="mb-4 break-inside-avoid shadow-xl rounded-2xl overflow-hidden bg-white hover:scale-[1.04] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                style={{ minHeight: 180, height: getCardHeight(cat.name, idx, windowWidth) }}
                onClick={() => navigate(`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div
                  className="relative w-full h-full aspect-[4/3]"
                  style={{ minHeight: 180, height: '100%' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center"
                    style={{ minHeight: 180, height: '100%' }}
                    loading="lazy"
                  />
                  {/* Overlay: hidden by default, fades in on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <div className="absolute bottom-0 left-0 p-4 z-20 w-full flex flex-col items-start">
                    <span className="text-white text-lg font-bold leading-tight drop-shadow-lg">
                      {cat.name}
                    </span>
                    <p
                      className="text-gray-200 text-xs mb-2 drop-shadow-lg line-clamp-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      style={{ pointerEvents: 'none' }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
    </div>
  );
};

export default CategoryMasonry; 