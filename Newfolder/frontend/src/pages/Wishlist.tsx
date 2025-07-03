import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { FiX, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  image_url?: string;
  company_name: string;
  category_name?: string;
  price?: number;
}

const defaultImage = 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=800&q=60';

const Wishlist: React.FC = () => {
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchWishlistProducts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; products: Product[] }>('/api/wishlist/products');
      if (response.data.success) {
        setWishlistedProducts(response.data.products);
      } else {
        throw new Error('Failed to fetch wishlist products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId: number) => {
    const originalProducts = [...wishlistedProducts];
    // Optimistic removal
    setWishlistedProducts(wishlistedProducts.filter(p => p.id !== productId));
    
    try {
      await api.post('/api/wishlist/remove', { productId });
      toast.success("Product removed from wishlist.");
    } catch (error) {
      setWishlistedProducts(originalProducts);
      toast.error("Failed to remove product. Please try again.");
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-800">Please Log In</h3>
        <p className="text-gray-500 mt-2">You need to be logged in to view your wishlist.</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-16">Loading your wishlist...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-600">{error}</div>;
  }

  return (
    <div>
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Your Wishlist is Empty</h3>
          <p className="mt-2 text-gray-500">
            Browse products and click the heart icon to save them here.
          </p>
          <Link to="/user-profile/products" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Find Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200/80 group relative">
              <Link to={`/products/${product.id}`} className="block">
                <img 
                  src={product.image_url || defaultImage} 
                  alt={product.name} 
                  className="w-full h-40 object-cover rounded-t-lg"
                  onError={e => { e.currentTarget.src = defaultImage; }}
                />
                <div className="p-4">
                  <h4 className="text-base font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.company_name}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {product.price ? `$${Number(product.price).toFixed(2)}` : ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 text-gray-600 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500"
                aria-label="Remove from wishlist"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 