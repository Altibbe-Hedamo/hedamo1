import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import hedamoLogo from '/hedamo-logo.webp';

const Product1: React.FC = () => {
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Link className="text-gray-500 text-base font-medium" to="/products">Shop</Link>
          <span className="text-gray-400 text-base font-medium">/</span>
          <span className="text-green-700 text-base font-medium">Meals</span>
        </div>
        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBib_gF5gWf_yFZOHMra8AxdgJ6vrv1JuiB6GHueLadFTtCTJRrCILQzA7k_QeF_r7bbcB1xpa7mJJ4pNS1scJjX4SUSDr93ydvJd0xWEfK2PFBUppl6HY8hns8683Bz7JkG9xKE15-avKcWJxqkf-xZPIi07a0-ZWwqIFrY78BkZVoz64xe3JoQRPdxj4KvFxH3Gvy5NQv-q-wXXCC1zXkyy18ZpAElkBgUks7FZ3Fe_P8-d62FKXhhxcFZif7HmP5nIl7B0U9_w"
                alt="Chicken with Roasted Vegetables"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center w-full md:w-1/2">
            <h1 className="text-2xl font-bold text-green-800 mb-2">Chicken with Roasted Vegetables</h1>
            <p className="text-gray-600 mb-2">Tender chicken breast with a medley of roasted vegetables, seasoned with herbs and spices.</p>
            <p className="text-gray-500 mb-4">1 serving · 400 calories</p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2 w-max transition-all">Add to Cart</button>
          </div>
        </div>
        {/* About Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-700 mb-2">About this meal</h2>
          <p className="text-gray-700 mb-2">
            Our Chicken with Roasted Vegetables is a wholesome and delicious meal, featuring tender chicken breast seasoned with herbs and spices, accompanied by a colorful assortment of roasted vegetables. This dish is a perfect balance of protein and nutrients, making it a satisfying and healthy choice.
          </p>
        </section>
        {/* Ingredients Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-green-700 mb-2">Ingredients</h2>
          <p className="text-gray-700 mb-2">Chicken breast, broccoli, carrots, bell peppers, olive oil, garlic, rosemary, thyme, salt, pepper.</p>
        </section>
        {/* Reviews Section */}
        <section>
          <h2 className="text-xl font-bold text-green-700 mb-4">Customer Reviews</h2>
          <div className="flex flex-wrap gap-8">
            {/* Rating Summary */}
            <div className="flex flex-col gap-2 min-w-[180px]">
              <p className="text-4xl font-black text-green-800 leading-tight">4.5</p>
              <div className="flex gap-0.5 mb-1">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="#059669" viewBox="0 0 256 256">
                    <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                  </svg>
                ))}
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="#d1fae5" viewBox="0 0 256 256">
                  <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
                </svg>
              </div>
              <p className="text-gray-600 text-base">120 reviews</p>
              <div className="grid min-w-[180px] max-w-[300px] grid-cols-[20px_1fr_40px] items-center gap-y-2 mt-2">
                {[
                  { star: 5, percent: 40 },
                  { star: 4, percent: 30 },
                  { star: 3, percent: 15 },
                  { star: 2, percent: 10 },
                  { star: 1, percent: 5 },
                ].map(({ star, percent }) => (
                  <React.Fragment key={star}>
                    <p className="text-gray-700 text-sm">{star}</p>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div className="rounded-full bg-green-400" style={{ width: `${percent}%` }}></div>
                    </div>
                    <p className="text-gray-500 text-sm text-right">{percent}%</p>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Individual Reviews */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Review 1 */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 rounded-full w-10 h-10 bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuABk-H-Ks0V1FQHLqBk7pFI3EKGYIsArALWZqp4OdDZPLYAbYAt2DOb0GIrdaKYBgxESMo1TdAF0o_cmLiieOlyy7uMRlOwOPIQ8yE5BWvbTJXf7s9ZGyWjAU4w-QYCnhnrHN3i2Sr3bvM3DnJb1CQA3vYeCtBHgqxZl3CEFLGo2IPXo0F0e5C_BigXLm1llbIqANenHSIkVLAknodP0c_3WvMkuLV4q1FZLNH-QF-yOkMze_IcknCQvMFWMVWKIwjn6Og2sAWdCg)' }}></div>
                  <div>
                    <p className="text-green-800 font-semibold">Sophia Clark</p>
                    <p className="text-gray-500 text-xs">2 weeks ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="#059669" viewBox="0 0 256 256">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700">This meal is absolutely delicious! The chicken is perfectly cooked and the vegetables are so flavorful. I love that it's both healthy and satisfying.</p>
                <div className="flex gap-6 text-gray-400 mt-2">
                  <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z" />
                    </svg>
                    <span>15</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z" />
                    </svg>
                    <span>2</span>
                  </button>
                </div>
              </div>
              {/* Review 2 */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 rounded-full w-10 h-10 bg-cover bg-center" style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDgcRY1cUfjVS68vztpyuxLe9GOcnDPEgtv0XnUI1idWhD2TnGjKDkYaFthbgXApSo9qXOaWarfJdQT5zzA_7-0zA2WM30cF4hYa1sY-ND97vwmwFXK52VkL9pMdIOUX4R34ADybzpiCNExECvd9JYUqsFPnncgJgBNYdfxq3qzIMDT8tz68B_mMytO5c8X28j17seNpXiPDqQMdvUV8VKi17BBtigCym9WQf2uu9Nqn0H-1dMvoiuiDE7LIphIKdWH9U0rT_HC3Q)' }}></div>
                  <div>
                    <p className="text-green-800 font-semibold">Emily Carter</p>
                    <p className="text-gray-500 text-xs">1 month ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="#059669" viewBox="0 0 256 256">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                    </svg>
                  ))}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="#d1fae5" viewBox="0 0 256 256">
                    <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
                  </svg>
                </div>
                <p className="text-gray-700">I enjoyed this meal, but I found the chicken a bit dry. The vegetables were well-seasoned and cooked to perfection. Overall, a good option for a quick and healthy dinner.</p>
                <div className="flex gap-6 text-gray-400 mt-2">
                  <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z" />
                    </svg>
                    <span>8</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z" />
                    </svg>
                    <span>1</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Product1; 