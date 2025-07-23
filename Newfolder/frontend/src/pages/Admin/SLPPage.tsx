import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const slps = [
  {
    name: 'Qressy',
    location: 'Hyderabad, India',
    priceRange: 'Contact for pricing',
    reviews: 22,
    rating: 4.9,
    contact: '+91 9876543210',
    experience: '5',
    categories: ['Product setup', 'Store migration', 'Theme customization'],
    services: 'Product and collection setup, Store settings configuration, Store build or redesign, Store migration, Theme customization + 17 more',
    badge: 'Premium',
  },
  {
    name: 'FRNDZLANS E-COMMERCE SOLUTIONS',
    location: 'Hyderabad, India',
    priceRange: 'Starting from $600',
    reviews: 155,
    rating: 4.9,
    contact: '+91 9123456780',
    experience: '8',
    categories: ['Analytics', 'Banner ads', 'Content marketing'],
    services: 'Analytics and tracking, Banner ads, Business strategy guidance, Content marketing, Custom apps and integrations + 20 more',
    badge: 'Verified',
  },
  {
    name: 'Tech Innovators',
    location: 'Bangalore, India',
    priceRange: 'Starting from $400',
    reviews: 87,
    rating: 4.8,
    contact: '+91 9988776655',
    experience: '6',
    categories: ['App development', 'UI/UX', 'Cloud services'],
    services: 'Mobile app development, UI/UX design, Cloud migration, API integration + 10 more',
    badge: 'Recommended',
  },
  {
    name: 'MarketGurus',
    location: 'Mumbai, India',
    priceRange: 'Contact for pricing',
    reviews: 45,
    rating: 4.7,
    contact: '+91 8877665544',
    experience: '4',
    categories: ['SEO', 'Content', 'Branding'],
    services: 'SEO optimization, Content creation, Brand strategy, Social media marketing + 8 more',
    badge: 'Top Rated',
  },
  {
    name: 'WebCrafters',
    location: 'Delhi, India',
    priceRange: 'Starting from $350',
    reviews: 63,
    rating: 4.6,
    contact: '+91 7766554433',
    experience: '3',
    categories: ['Web design', 'E-commerce', 'Support'],
    services: 'Website design, E-commerce setup, Ongoing support, Hosting + 5 more',
    badge: 'Budget',
  },
];

const LOCATIONS = [
  'Hyderabad, India',
  'Bangalore, India',
  'Mumbai, India',
  'Delhi, India',
];

const SERVICE_GROUPS = [
  {
    group: 'Store setup and management',
    services: [
      'Product setup', 'Store migration', 'Theme customization', 'Store build or redesign', 'Store settings configuration', 'POS setup and migration', 'Headless commerce', 'Website audit and optimization strategy', 'Ongoing website management', 'Checkout upgrade',
    ],
  },
  {
    group: 'Development and troubleshooting',
    services: [
      'Troubleshooting', 'Custom domain setup', 'Custom apps and integrations', 'Systems integration',
    ],
  },
  {
    group: 'Marketing and sales',
    services: [
      'Search engine advertising', 'SEO', 'Sales channel setup', 'Conversion rate optimization', 'Social media marketing', 'Email marketing', 'Content marketing', 'Analytics', 'Analytics and tracking',
    ],
  },
  {
    group: 'Expert guidance',
    services: [
      'Business strategy guidance', 'Product sourcing guidance', 'Site performance and speed', 'Sales tax guidance', 'Wholesale/B2B', 'International expansion', 'Product development',
    ],
  },
  {
    group: 'Visual content and branding',
    services: [
      'Banner ads', 'Product photography', '3D modelling', 'Logo and visual branding', 'Video and illustrations',
    ],
  },
  {
    group: 'Content writing',
    services: [
      'Product descriptions', 'Website and marketing content',
    ],
  },
];

const SERVICES = SERVICE_GROUPS.flatMap(g => g.services);

const PAGE_SIZE = 6;

const aiPlaceholders = [
  "I want a Hyderabad guy with 4.9 plus rating",
  "Show SLPs with 5+ years experience in Mumbai",
  "Find partners for store migration in Delhi with rating above 4.5",
  "Show me SLPs for theme customization",
  "Find experts in Bangalore for SEO"
];

function AnimatedAIInput({ value, onChange, onSubmit }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % aiPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <form onSubmit={onSubmit} className="w-full relative max-w-xl mx-auto bg-white h-12 rounded-full overflow-hidden shadow border border-gray-300 flex items-center px-4 mb-6">
      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z" />
      </svg>
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-gray-700 text-sm sm:text-base"
        placeholder={aiPlaceholders[currentPlaceholder]}
        value={value}
        onChange={onChange}
      />
      <button
        type="submit"
        className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}

const FilterSidebar = ({
  locationOpen, setLocationOpen, serviceOpen, setServiceOpen,
  selectedLocations, setSelectedLocations, selectedServices, setSelectedServices,
  selectedExperience, setSelectedExperience, minPrice, setMinPrice, maxPrice, setMaxPrice, selectedRating, setSelectedRating,
  clearAllFilters,
  aiQuery, setAiQuery, handleAISubmit
}: any) => {
  const locationRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setServiceOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setLocationOpen, setServiceOpen]);

  const toggleLocation = () => setLocationOpen((open: boolean) => !open);
  const toggleService = () => setServiceOpen((open: boolean) => !open);

  const handleLocationChange = (loc: string) => {
    setSelectedLocations((prev: string[]) =>
      prev.includes(loc) ? prev.filter((l: string) => l !== loc) : [...prev, loc]
    );
  };
  const handleServiceChange = (svc: string) => {
    setSelectedServices((prev: string[]) =>
      prev.includes(svc) ? prev.filter((s: string) => s !== svc) : [...prev, svc]
    );
  };

  // Filter locations by search
  const filteredLocations = LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );
  // Filter services by search
  const filteredServiceGroups = SERVICE_GROUPS.map(group => ({
    ...group,
    services: group.services.filter(svc => svc.toLowerCase().includes(serviceSearch.toLowerCase())),
  })).filter(group => group.services.length > 0);

  return (
    <aside className="w-full md:w-72 bg-white rounded-2xl shadow p-6 mb-8 md:mb-0 h-fit">
      {/* AI Search Bar */}
      <AnimatedAIInput value={aiQuery} onChange={e => setAiQuery(e.target.value)} onSubmit={handleAISubmit} />
      <p className="text-xs text-gray-500 mb-4 text-center">Tip: You can use natural language, e.g. "Show SLPs in Hyderabad with 4.9+ rating"</p>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Filters</h2>
        <button className="text-sm text-gray-500 hover:text-black underline" onClick={clearAllFilters}>Clear All</button>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Price range (USD)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="w-1/2 border rounded px-2 py-1" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input type="number" placeholder="Max" className="w-1/2 border rounded px-2 py-1" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Experience (years)</label>
        <select className="w-full border rounded px-2 py-1" value={selectedExperience} onChange={e => setSelectedExperience(e.target.value)}>
          <option value="">Select experience</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
          <option value="8">8+ years</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Rating</label>
        <select className="w-full border rounded px-2 py-1" value={selectedRating} onChange={e => setSelectedRating(e.target.value)}>
          <option value="">Select rating</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
          <option value="4.8">4.8+</option>
          <option value="5">5.0</option>
        </select>
      </div>
      {/* Location Multi-select Dropdown with search and clear */}
      <div className="mb-4" ref={locationRef}>
        <label className="block font-semibold mb-1">Location</label>
        <div className="relative">
          <button
            type="button"
            className="w-full border rounded px-2 py-1 text-left flex justify-between items-center bg-white"
            onClick={toggleLocation}
          >
            <span>
              {selectedLocations.length > 0
                ? selectedLocations.join(', ')
                : 'Select location'}
            </span>
            <span className="ml-2">▼</span>
          </button>
          {locationOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow p-2 max-h-64 overflow-y-auto">
              <div className="mb-2 flex items-center border-b pb-2">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z" /></svg>
                <input
                  type="text"
                  placeholder="Search for locations"
                  className="w-full border-none outline-none bg-transparent text-gray-700"
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                />
              </div>
              {filteredLocations.length === 0 && (
                <div className="text-gray-400 text-sm px-2 py-1">No locations found</div>
              )}
              {filteredLocations.map((loc) => (
                <label key={loc} className="flex items-center gap-2 py-1 cursor-pointer px-2">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(loc)}
                    onChange={() => handleLocationChange(loc)}
                    className="accent-indigo-600"
                  />
                  <span>{loc}</span>
                </label>
              ))}
              <button
                className="mt-2 text-gray-500 hover:text-black text-sm px-2 py-1"
                onClick={() => setSelectedLocations([])}
                type="button"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Services Multi-select Dropdown with search and clear, grouped */}
      <div className="mb-2" ref={serviceRef}>
        <label className="block font-semibold mb-1">Services</label>
        <div className="relative">
          <button
            type="button"
            className="w-full border rounded px-2 py-1 text-left flex justify-between items-center bg-white"
            onClick={toggleService}
          >
            <span>
              {selectedServices.length > 0
                ? selectedServices.join(', ')
                : 'Select service'}
            </span>
            <span className="ml-2">▼</span>
          </button>
          {serviceOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow p-2 max-h-64 overflow-y-auto">
              <div className="mb-2 flex items-center border-b pb-2">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z" /></svg>
                <input
                  type="text"
                  placeholder="Search for services"
                  className="w-full border-none outline-none bg-transparent text-gray-700"
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                />
              </div>
              {filteredServiceGroups.length === 0 && (
                <div className="text-gray-400 text-sm px-2 py-1">No services found</div>
              )}
              {filteredServiceGroups.map(group => (
                <div key={group.group} className="mb-2">
                  <div className="text-xs font-semibold text-gray-500 mb-1 pl-2">{group.group}</div>
                  {group.services.map((svc: string) => (
                    <label key={svc} className="flex items-center gap-2 py-1 cursor-pointer px-2">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(svc)}
                        onChange={() => handleServiceChange(svc)}
                        className="accent-indigo-600"
                      />
                      <span>{svc}</span>
                    </label>
                  ))}
                </div>
              ))}
              <button
                className="mt-2 text-gray-500 hover:text-black text-sm px-2 py-1"
                onClick={() => setSelectedServices([])}
                type="button"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const SLPPage: React.FC = () => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [aiQuery, setAiQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedServices([]);
    setSelectedExperience('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating('');
    setCurrentPage(1);
  };

  const handleAISubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(aiQuery);
    setAiQuery('');
    setCurrentPage(1);
  };

  // Filtering logic
  const filteredSlps = slps.filter((slp) => {
    // Location filter
    if (selectedLocations.length > 0 && !selectedLocations.includes(slp.location)) {
      return false;
    }
    // Services filter
    if (selectedServices.length > 0 && !selectedServices.some(service => slp.services.includes(service))) {
      return false;
    }
    // Experience filter
    if (selectedExperience) {
      const expNum = parseInt(slp.experience);
      if (isNaN(expNum) || expNum < parseInt(selectedExperience)) {
        return false;
      }
    }
    // Price range filter (assumes priceRange is like 'Starting from $600' or 'Contact for pricing')
    if (minPrice || maxPrice) {
      const priceMatch = slp.priceRange.match(/\$([0-9]+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
      } else if (minPrice || maxPrice) {
        // If price is not available and user set a range, skip this card
        return false;
      }
    }
    // Rating filter
    if (selectedRating) {
      if (slp.rating < parseFloat(selectedRating)) {
        return false;
      }
    }
    return true;
  });

  const total = filteredSlps.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentSlps = filteredSlps.slice(startIndex, endIndex);

  // Fuzzy search options
  const fuseOptions = {
    keys: ['name', 'location', 'categories', 'services'],
    threshold: 0.3,
  };
  let fuzzyResults = filteredSlps;
  const ratingMatch = searchQuery.match(/([0-9]+(?:\.[0-9]+)?)/);
  const hasText = /[a-zA-Z]/.test(searchQuery);

  if (searchQuery.trim()) {
    if (hasText) {
      // Fuzzy search first, then numeric filter
      const fuse = new Fuse(filteredSlps, {
        keys: ['name', 'location', 'categories', 'services'],
        threshold: 0.3,
      });
      fuzzyResults = fuse.search(searchQuery).map(result => result.item);
    }
    // Numeric filtering for rating
    if (ratingMatch) {
      const minRating = parseFloat(ratingMatch[1]);
      fuzzyResults = fuzzyResults.filter(slp => parseFloat(String(slp.rating)) >= minRating);
    }
    // Numeric filtering for experience
    const expMatch = searchQuery.match(/(\d+)\+?\s*(years|yr|experience)?/i);
    if (expMatch) {
      const minExp = parseInt(expMatch[1]);
      fuzzyResults = fuzzyResults.filter(slp => parseInt(String(slp.experience)) >= minExp);
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // Implement sorting logic here if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* Mobile Filter Button */}
        <div className="md:hidden flex items-center mb-4">
          <button
            className="flex items-center gap-2 border rounded px-4 py-2 text-gray-700 bg-white shadow"
            onClick={() => setShowMobileFilter(true)}
          >
            {/* Filter icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M6.75 12h10.5m-7.5 5.25h4.5" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
        {/* Filter Sidebar (desktop) */}
        <div className="hidden md:block md:w-72">
          <FilterSidebar
            locationOpen={locationOpen}
            setLocationOpen={setLocationOpen}
            serviceOpen={serviceOpen}
            setServiceOpen={setServiceOpen}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            clearAllFilters={clearAllFilters}
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
            handleAISubmit={handleAISubmit}
          />
        </div>
        {/* Mobile Filter Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-11/12 max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowMobileFilter(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <FilterSidebar
                locationOpen={locationOpen}
                setLocationOpen={setLocationOpen}
                serviceOpen={serviceOpen}
                setServiceOpen={setServiceOpen}
                selectedLocations={selectedLocations}
                setSelectedLocations={setSelectedLocations}
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
                selectedExperience={selectedExperience}
                setSelectedExperience={setSelectedExperience}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                clearAllFilters={clearAllFilters}
                aiQuery={aiQuery}
                setAiQuery={setAiQuery}
                handleAISubmit={handleAISubmit}
              />
            </div>
          </div>
        )}
        {/* SLP Cards */}
        <div className="flex-1">
          {/* Top bar: showing count and sort by */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="text-lg text-gray-700 font-medium">
              Showing 1 - {total} of {total} partners
            </div>
            <div className="relative inline-block">
              <label htmlFor="sortBy" className="sr-only">Sort by</label>
              <select
                id="sortBy"
                className="appearance-none border border-gray-300 rounded px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="default">Default</option>
                <option value="rating">Rating</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
            </div>
          </div>
          <div className="space-y-8">
            {fuzzyResults.slice(startIndex, endIndex).map((slp, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl border border-black/10 p-6 flex flex-col sm:flex-row gap-4 items-start group overflow-hidden"
              >
                {/* Black overlay on hover */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                <img
                  src={defaultAvatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow relative z-10"
                />
                <div className="flex-1 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xl font-bold">{slp.name}</span>
                    <span className="text-gray-500 text-sm">| {slp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold">{slp.rating}</span>
                    <span className="text-gray-500">({slp.reviews})</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Contact:</span> {slp.contact}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold">Price range for services</span> {slp.priceRange}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold">Experience:</span> {slp.experience}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold">Categories:</span> {slp.categories.join(', ')}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold">Services</span> {slp.services}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex items-center -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-2 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SLPPage; 