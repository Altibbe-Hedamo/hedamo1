import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import hedamoLogo from '/hedamo-logo.webp';
import CategoryMasonry from './CategoryMasonry';

// Example icons as SVG strings (could be replaced with imports or components)
const categoryIcons: Record<string, React.ReactNode> = {
  Agriculture: (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 11V7a4 4 0 00-8 0v4M12 17v.01" /></svg>
  ),
  'Meat & Poultry': (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>
  ),
  Dairy: (
    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
  ),
  Seafood: (
    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" /></svg>
  ),
  'Processed Foods': (
    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
  ),
  Textiles: (
    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /></svg>
  ),
  Cosmetics: (
    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
  ),
  Collectives: (
    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
  ),
  'Pet Food': (
    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
  ),
};

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

const ProductPage: React.FC = () => {
  const [columns, setColumns] = React.useState(getColumnCount());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
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

  // Custom heights for Meat & Poultry, Processed Foods, Collectives
  const getCardHeight = (catName: string, idx: number) => {
    if (catName === 'Meat & Poultry') return 320;
    if (catName === 'Processed Foods') return 80; // even shorter
    if (catName === 'Collectives') return 260; // slightly shorter
    return idx % 2 === 0 ? 220 : 320;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: 'Inter, Manrope, Noto Sans, sans-serif' }}>
      {/* Hedamo Navbar */}
      <header className="bg-white shadow-sm p-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center">
          <Link to="/" className="hover:text-green-600 transition-colors flex items-center">
            <img src={hedamoLogo} alt="Hedamo Logo" className="h-8 w-auto mr-2 ml-4" />
          </Link>
          </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-green-600 transition-colors font-medium">About</Link>
          <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Products</Link>
          <Link to="/contact" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Contact</Link>
          <Link to="/login" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Login</Link>
          <Link to="/signup" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">Sign Up</Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-green-700 font-semibold">Products</span>
        </nav>
        <div className="flex flex-wrap justify-between gap-3 mb-8">
          <p className="text-gray-800 text-3xl font-bold leading-tight min-w-72">Shop by Category</p>
          </div>
        {/* Masonry layout using CSS columns */}
        <CategoryMasonry />
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
