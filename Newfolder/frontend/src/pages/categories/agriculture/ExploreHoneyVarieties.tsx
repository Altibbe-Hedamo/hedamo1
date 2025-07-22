import React from 'react';
import { Link } from 'react-router-dom';

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
    image: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
  },
  {
    slug: 'apiary-honey',
    name: 'Apiary Honey',
    description: 'Farmed in controlled apiaries.',
    originRegion: 'Punjab',
    isOrganic: false,
    farmingMethod: 'Apiary',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
  },
  {
    slug: 'wild-harvested-honey',
    name: 'Wild Harvested Honey',
    description: 'Collected from wild hives in the forest.',
    originRegion: 'Assam',
    isOrganic: true,
    farmingMethod: 'Wild Harvested',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    slug: 'multifloral-honey',
    name: 'Multifloral Honey',
    description: 'Bees feed on multiple flower types.',
    originRegion: 'Himachal Pradesh',
    isOrganic: false,
    farmingMethod: 'Apiary',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
  },
  // ...add more varieties as needed
];

const allRegions = Array.from(new Set(honeyVarieties.map(h => h.originRegion)));
const allMethods = Array.from(new Set(honeyVarieties.map(h => h.farmingMethod)));

const ExploreHoneyVarieties: React.FC = () => {
  const [organicOnly, setOrganicOnly] = React.useState(false);
  const [region, setRegion] = React.useState('');
  const [method, setMethod] = React.useState('');

  const filtered = honeyVarieties.filter(h =>
    (!organicOnly || h.isOrganic) &&
    (!region || h.originRegion === region) &&
    (!method || h.farmingMethod === method)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Explore Honey Varieties</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center justify-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} />
          <span className="text-sm">🌿 Organic only</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">📍 Region:</span>
          <select value={region} onChange={e => setRegion(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">🐝 Method:</span>
          <select value={method} onChange={e => setMethod(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            {allMethods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <span className="ml-4 text-xs text-gray-500">{filtered.length} Verified Varieties</span>
      </div>
      {/* Grid */}
      <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((variety) => (
          <Link to={`/honey-varieties/${variety.slug}`} key={variety.name} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
            <img src={variety.image} alt={variety.name} className="w-full h-40 object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold text-green-800 mb-1">{variety.name}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">{variety.farmingMethod}</span>
                {variety.isOrganic && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">Organic</span>}
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">{variety.originRegion}</span>
              </div>
              <p className="text-gray-600 text-sm flex-1">{variety.description}</p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">No varieties found for selected filters.</div>
        )}
      </div>
    </div>
  );
};

export default ExploreHoneyVarieties; 