import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const slps = [
  {
    name: 'Qressy',
    location: 'Hyderabad, India',
    pincode: '500001',
    priceRange: 'Contact for pricing',
    reviews: 22,
    rating: 4.9,
    contact: '+91 9876543210',
    experience: '5',
    certifications: ['USDA Organic', 'India Organic', 'FSSAI'],
    services: 'Product and collection setup, Store settings configuration, Store build or redesign, Store migration, Theme customization + 17 more',
    badge: 'Premium',
  },
  {
    name: 'FRNDZLANS E-COMMERCE SOLUTIONS',
    location: 'Hyderabad, India',
    pincode: '500003',
    priceRange: 'Starting from $600',
    reviews: 155,
    rating: 4.9,
    contact: '+91 9123456780',
    experience: '8',
    certifications: ['India Organic', 'ISO 22000', 'FSSAI'],
    services: 'Analytics and tracking, Banner ads, Business strategy guidance, Content marketing, Custom apps and integrations + 20 more',
    badge: 'Verified',
  },
  {
    name: 'Tech Innovators',
    location: 'Bangalore, India',
    pincode: '560001',
    priceRange: 'Starting from $400',
    reviews: 87,
    rating: 4.8,
    contact: '+91 9988776655',
    experience: '6',
    certifications: ['USDA Organic', 'HACCP', 'ISO 22000'],
    services: 'Mobile app development, UI/UX design, Cloud migration, API integration + 10 more',
    badge: 'Recommended',
  },
  {
    name: 'MarketGurus',
    location: 'Mumbai, India',
    pincode: '400001',
    priceRange: 'Contact for pricing',
    reviews: 45,
    rating: 4.7,
    contact: '+91 8877665544',
    experience: '4',
    certifications: ['FSSAI', 'India Organic'],
    services: 'SEO optimization, Content creation, Brand strategy, Social media marketing + 8 more',
    badge: 'Top Rated',
  },
  {
    name: 'WebCrafters',
    location: 'Delhi, India',
    pincode: '110001',
    priceRange: 'Starting from $350',
    reviews: 63,
    rating: 4.6,
    contact: '+91 7766554433',
    experience: '3',
    certifications: ['USDA Organic', 'HACCP'],
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
  return (
    <form onSubmit={onSubmit} className="w-full relative max-w-full mx-auto h-12 flex items-center px-4 mb-0 bg-[#232e41] border border-gray-700">
      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z" />
      </svg>
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm sm:text-base"
        placeholder="search using Fuzzy words for faster filters"
        value={value}
        onChange={onChange}
      />
      <button
        type="submit"
        className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#1e293b] hover:bg-[#334155] transition"
      >
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
  const [locationSearch, setLocationSearch] = useState('');
  const filteredLocations = LOCATIONS.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()));
  const handleLocationChange = (loc: string) => {
    setSelectedLocations((prev: string[]) =>
      prev.includes(loc) ? prev.filter((l: string) => l !== loc) : [...prev, loc]
    );
  };

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
      if (isNaN(expNum) || expNum !== parseInt(selectedExperience)) {
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
      if (slp.rating !== parseFloat(selectedRating)) {
        return false;
      }
    }
    return true;
  });

  // Fuzzy search options
  const fuseOptions = {
    keys: ['name', 'location', 'categories', 'services'],
    threshold: 0.3,
  };
  let fuzzyResults = filteredSlps;
  const EPSILON = 0.0001;
  const ratingMatch = searchQuery.match(/([0-9]+(?:\.[0-9]+)?)/);
  const hasText = /[a-zA-Z]/.test(searchQuery);

  // Experience-specific pattern
  const expPhraseMatch = searchQuery.match(/experience\s*(greater than|>|>=)?\s*([0-9]+(?:\.[0-9]+)?)/i)
    || searchQuery.match(/([0-9]+(?:\.[0-9]+)?)\s*(years|yr|experience)/i);
  // Rating-specific pattern
  const ratingPhraseMatch = searchQuery.match(/rating\s*(greater than|>|>=)?\s*([0-9]+(?:\.[0-9]+)?)/i)
    || searchQuery.match(/([0-9]+(?:\.[0-9]+)?)\s*(star|rating)/i);

  if (searchQuery.trim()) {
    // 1. Service extraction from query
    const matchedServices = SERVICES.filter(service =>
      searchQuery.toLowerCase().includes(service.toLowerCase())
    );
    let serviceResults: typeof slps = [];
    if (matchedServices.length > 0) {
      serviceResults = slps.filter(slp =>
        matchedServices.some(service =>
          slp.services.toLowerCase().includes(service.toLowerCase())
        )
      );
    }

    // 2. Fuzzy search for name/location (always run for text)
    let fuseResults: typeof slps = [];
    if (/[a-zA-Z]/.test(searchQuery)) {
      const fuse = new Fuse(slps, {
        keys: ['name', 'location'],
        threshold: 0.3,
      });
      fuseResults = fuse.search(searchQuery).map(result => result.item);
    }

    // 3. If the query is a number, match rating or experience directly
    let numberResults: typeof slps = [];
    if (!isNaN(Number(searchQuery.trim()))) {
      const num = parseFloat(searchQuery.trim());
      numberResults = slps.filter(
        slp =>
          parseFloat(String(slp.rating)) === num ||
          parseFloat(String(slp.experience)) === num
      );
    }

    // Combine: service > number > fuse > all
    let results: typeof slps = [];
    if (matchedServices.length > 0) {
      results = serviceResults;
    } else if (numberResults.length > 0) {
      results = numberResults;
    } else if (fuseResults.length > 0) {
      results = fuseResults;
    } else {
      results = slps;
    }

    // Experience/rating phrase extraction (>= for more natural queries)
    if (expPhraseMatch) {
      const minExp = parseFloat(expPhraseMatch[2] || expPhraseMatch[1]);
      results = results.filter(slp => parseFloat(String(slp.experience)) >= minExp);
    }
    if (ratingPhraseMatch) {
      const minRating = parseFloat(ratingPhraseMatch[2] || ratingPhraseMatch[1]);
      results = results.filter(slp => parseFloat(String(slp.rating)) >= minRating);
    }

    fuzzyResults = results;
  }

  // Use AI search results if searchQuery is present, otherwise use sidebar filters
  const resultsArray = searchQuery.trim() ? fuzzyResults : filteredSlps;
  const total = resultsArray.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentSlps = resultsArray.slice(startIndex, endIndex);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // Implement sorting logic here if needed
  };

  return (
    <div className="min-h-screen bg-[#0a1436]">
      {/* Top dark background area with heading and search */}
      <div className="bg-[#101a36] px-6 pt-8 pb-4 mb-6 w-full min-h-[180px]">
        <h1 className="text-3xl font-bold text-white mb-6">Partners</h1>
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          <div className="flex-1">
            {/* AI Search Bar */}
            <AnimatedAIInput value={aiQuery} onChange={e => setAiQuery(e.target.value)} onSubmit={handleAISubmit} />
          </div>
        </div>
        {/* Divider line between AI search and filters */}
        <div className="w-full border-t border-[#22305a] my-4" />
      </div>
      {/* Sticky Filters Bar */}
      <div className="sticky top-0 z-30 bg-[#101a36] px-6 py-2">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
          <div className="flex-1 md:max-w-2xl">
            {/* Filters Sidebar (inline for desktop, modal for mobile) */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              {/* Price range */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs text-blue-200 mb-1">Price range (USD)</label>
                <div className="flex space-x-2">
                  <input type="number" placeholder="Min" className="w-20 rounded-lg px-2 py-1 bg-[#172347] text-blue-100 border border-[#22305a]" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <input type="number" placeholder="Max" className="w-20 rounded-lg px-2 py-1 bg-[#172347] text-blue-100 border border-[#22305a]" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>
              {/* Location */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs text-blue-200 mb-1">Location</label>
                <select
                  className="rounded-lg px-2 py-1 bg-[#172347] text-blue-100 border border-[#22305a]"
                  value={selectedLocations[0] || ''}
                  onChange={e => setSelectedLocations(e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              {/* Experience */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs text-blue-200 mb-1">Experience (years)</label>
                <select className="rounded-lg px-2 py-1 bg-[#172347] text-blue-100 border border-[#22305a]" value={selectedExperience} onChange={e => setSelectedExperience(e.target.value)}>
                  <option value="">Select experience</option>
                  <option value="1">1+ years</option>
                  <option value="3">3+ years</option>
                  <option value="5">5+ years</option>
                  <option value="8">8+ years</option>
                </select>
              </div>
              {/* Rating */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs text-blue-200 mb-1">Rating</label>
                <select className="rounded-lg px-2 py-1 bg-[#172347] text-blue-100 border border-[#22305a]" value={selectedRating} onChange={e => setSelectedRating(e.target.value)}>
                  <option value="">Select rating</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.8">4.8+</option>
                  <option value="5">5.0</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Filter tags, Clear All, etc. can go here if needed */}
      {/* Results summary and sort bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 mb-6">
        <div className="text-base text-blue-200 font-medium">
          Showing <span className="font-bold text-teal-400">{total === 0 ? 0 : startIndex + 1}</span> - <span className="font-bold text-teal-400">{Math.min(endIndex, total)}</span> of <span className="font-bold text-teal-400">{total}</span> partners
        </div>
        <div className="relative inline-block mt-2 md:mt-0">
          <label htmlFor="sortBy" className="sr-only">Sort by</label>
          <select
            id="sortBy"
            className="appearance-none border border-[#22305a] rounded px-4 py-2 pr-8 text-blue-100 bg-[#172347] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="default">Default</option>
            <option value="rating">Rating</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-400">▼</span>
        </div>
      </div>
      {/* SLP Cards Grid */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-[#f5f7fa] rounded-2xl py-8">
        {currentSlps.map((slp, idx) => (
          <div
            key={idx}
            className="bg-[#172347] rounded-2xl shadow p-6 flex flex-col h-full border border-[#22305a] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center mb-2">
              <img src={defaultAvatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#22305a] mr-3" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{slp.name}</span>
                  <span className="text-sm text-blue-200">| {slp.location} ({slp.pincode})</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-teal-400 text-base">★</span>
                  <span className="font-semibold text-white">{slp.rating}</span>
                  <span className="text-blue-300 text-xs">({slp.reviews})</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-blue-100">
              <span className="font-semibold text-blue-300">Contact:</span> {slp.contact}
            </div>
            <div className="mt-1 text-sm text-blue-100">
              <span className="font-semibold text-blue-300">Price range for services</span> {slp.priceRange}
            </div>
            <div className="mt-1 text-sm text-blue-100">
              <span className="font-semibold text-blue-300">Experience:</span> <span className="text-teal-400 font-bold">{slp.experience} yrs</span>
            </div>
            <div className="mt-1 text-sm text-blue-100">
              <span className="font-semibold text-blue-300">Certifications:</span> {slp.certifications.join(', ')}
            </div>
            <div className="mt-1 text-sm text-blue-100">
              <span className="font-semibold text-blue-300">Services</span> {slp.services}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls remain unchanged */}
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
  );
};

export default SLPPage; 