import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../../../components/Footer';
import hedamoLogo from '/hedamo-logo.webp';
import InfiniteMovingCardsDemo from '../../../components/ui/infinite-moving-cards-demo';

const honeyVarieties = [
  {
    slug: 'raw-unfiltered-honey',
    name: 'Raw Unfiltered Honey',
    description: 'Pure, unprocessed honey from forest bees.',
    originRegion: 'Nilgiris',
    isOrganic: true,
    farmingMethod: 'Forest Bee Honey',
    image: 'https://i.pinimg.com/1200x/5e/d7/6f/5ed76f528589fcad67a1eef5b69111c7.jpg',
  },
  {
    slug: 'jamun-honey',
    name: 'Jamun Honey',
    description: 'Harvested from Jamun flower nectar.',
    originRegion: 'Western Ghats',
    isOrganic: true,
    farmingMethod: 'Organic Bee Farmed',
    image: 'https://i.pinimg.com/736x/9a/a9/74/9aa9748a496662935befdf290cb88d98.jpg',
  },
  {
    slug: 'wild-harvested-honey',
    name: 'Wild Harvested Honey',
    description: 'Collected from wild hives in the forest.',
    originRegion: 'Assam',
    isOrganic: true,
    farmingMethod: 'Wild Harvested',
    image: 'https://i.pinimg.com/1200x/28/8e/85/288e8577a1ca136775ad743e14ccd487.jpg',
  },
];

const HoneyVarietyDetail: React.FC = () => {
  const { slug } = useParams();
  const variety = honeyVarieties.find(v => v.slug === slug);

  if (!variety) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Honey Variety Not Found</h1>
        <Link to="/honey-varieties" className="text-green-700 underline">Back to Honey Varieties</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
      <div className="flex flex-col items-center py-10 px-4 flex-1">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Link className="text-gray-500 text-base font-medium" to="/honey-varieties">Honey Varieties</Link>
          <span className="text-gray-400 text-base font-medium">/</span>
          <span className="text-green-700 text-base font-medium">{variety.name}</span>
        </div>
        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8 mb-8 w-full max-w-3xl">
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={variety.image}
                alt={variety.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center w-full md:w-1/2">
            <h1 className="text-2xl font-bold text-green-800 mb-2">{variety.name}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">{variety.farmingMethod}</span>
              {variety.isOrganic && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">Organic</span>}
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">{variety.originRegion}</span>
            </div>
            <p className="text-gray-600 mb-2">{variety.description}</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2 w-max transition-all">Add to Cart</button>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="w-full max-w-3xl mb-8">
          <InfiniteMovingCardsDemo slug={slug || ''} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HoneyVarietyDetail; 