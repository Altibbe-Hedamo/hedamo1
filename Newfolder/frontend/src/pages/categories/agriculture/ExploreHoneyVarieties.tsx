import React from 'react';
import { Link } from 'react-router-dom';
import { honeyVarieties } from '../../../data/honeyVarieties';

const allRegions = Array.from(new Set(honeyVarieties.map(h => h.originRegion)));
const allMethods = Array.from(new Set(honeyVarieties.map(h => h.farmingMethod)));

const ExploreHoneyVarieties: React.FC = () => {
  const [region, setRegion] = React.useState('');
  const [method, setMethod] = React.useState('');

  const filtered = honeyVarieties.filter(h =>
    (!region || h.originRegion === region) &&
    (!method || h.farmingMethod === method)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Explore Honey Varieties</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center justify-center">
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