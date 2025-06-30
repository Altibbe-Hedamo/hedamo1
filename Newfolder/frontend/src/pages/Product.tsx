import React, { useEffect, useState, useContext } from 'react';
import api from '../config/axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiPackage, FiHeart } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  name: string;
  image_url?: string;
  company_name: string;
  category_name?: string;
  price?: number;
  description?: string;
}

const foodImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=60'
];

const cosmeticsImages = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1512496015851-a90137ba0a43?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=60'
];

const clothingImages = [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1581655353564-df123a9082df?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=60'
];

const defaultImage = 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=800&q=60';

function getDeterministicImage(category: string | undefined, id: number) {
  if (!category) return defaultImage;
  const cat = category.toLowerCase();
  if (cat.includes('food')) {
    return foodImages[id % foodImages.length];
  }
  if (cat.includes('clothing')) {
    return clothingImages[id % clothingImages.length];
  }
  if (cat.includes('cosmetics')) {
    return cosmeticsImages[id % cosmeticsImages.length];
  }
  return defaultImage;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productPromise = api.get<{ success: boolean; products: Product[] }>('/api/products/public');
        const wishlistPromise = isAuthenticated ? api.get<{ success: boolean; wishlist: number[] }>('/api/wishlist') : Promise.resolve(null);
        
        const [productResponse, wishlistResponse] = await Promise.all([productPromise, wishlistPromise]);

        if (productResponse.data.success) {
          setProducts(productResponse.data.products);
          setFilteredProducts(productResponse.data.products);
        } else {
          throw new Error('Failed to fetch products');
        }

        if (wishlistResponse?.data.success) {
          setWishlist(new Set(wishlistResponse.data.wishlist));
        }

      } catch (err: any) {
        setError(err.response?.data?.error || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [isAuthenticated]);

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); // Prevent navigating when clicking the heart
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to manage your wishlist.");
      return;
    }

    const isWishlisted = wishlist.has(productId);
    const originalWishlist = new Set(wishlist);

    // Optimistic UI update
    const updatedWishlist = new Set(originalWishlist);
    if (isWishlisted) {
      updatedWishlist.delete(productId);
    } else {
      updatedWishlist.add(productId);
    }
    setWishlist(updatedWishlist);

    try {
      if (isWishlisted) {
        await api.post('/api/wishlist/remove', { productId });
        toast.success("Removed from wishlist!");
      } else {
        await api.post('/api/wishlist/add', { productId });
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      // Revert UI on error
      setWishlist(originalWishlist);
      toast.error("Failed to update wishlist. Please try again.");
    }
  };

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(lowercasedQuery);
      const companyMatch = product.company_name.toLowerCase().includes(lowercasedQuery);
      const categoryMatch = product.category_name?.toLowerCase().includes(lowercasedQuery) || false;
      return nameMatch || companyMatch || categoryMatch;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-md shadow-sm animate-pulse border border-gray-100">
          <div className="h-40 bg-gray-100 rounded-t-md"></div>
          <div className="p-3">
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* Modern Search Bar at the Top */}
        <div className="w-full max-w-lg mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, companies, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base placeholder-gray-400 transition-all duration-200 outline-none"
              style={{ boxShadow: '0 2px 12px 0 rgba(60,72,88,0.06)' }}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <FiPackage className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-base font-medium text-gray-700">No Products Found</h3>
            <p className="mt-2 text-gray-400 text-sm">
              {searchQuery
                ? 'No products match your search.'
                : 'Products will appear here once they are added.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.has(product.id);
              return (
                <Link to={`/products/${product.id}`} key={product.id} className="group block">
                  <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 overflow-hidden h-full flex flex-col border border-gray-100">
                    <div className="relative h-40">
                      <img
                        src={product.image_url || getDeterministicImage(product.category_name, product.id)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          if (e.currentTarget.src !== defaultImage) {
                            e.currentTarget.src = defaultImage;
                          }
                        }}
                      />
                      {isAuthenticated && (
                         <button
                           onClick={(e) => handleToggleWishlist(e, product.id)}
                           className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                            isWishlisted
                              ? 'bg-red-500 text-white'
                              : 'bg-white/70 text-gray-700 backdrop-blur-sm hover:bg-white'
                           }`}
                           aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                         >
                           <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                         </button>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <div>
                        {product.category_name && (
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-1">
                            {product.category_name}
                          </p>
                        )}
                        <h2 className="text-base font-semibold text-gray-800 h-10 line-clamp-2" title={product.name}>
                          {product.name}
                        </h2>
                      </div>
                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 mt-2">
                          By <span className="font-medium text-gray-700">{product.company_name}</span>
                        </p>
                        <div className="text-lg font-bold text-gray-900 mt-2">
                          {product.price ? (
                            <span>${parseFloat(String(product.price)).toFixed(2)}</span>
                          ) : (
                            <span className="text-xs font-medium text-gray-400">Price not available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;