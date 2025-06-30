import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow, OverlayView } from '@react-google-maps/api';
import api from '../config/axios';
import { toast } from 'react-toastify';

// Define the interface for our product data
interface Product {
  id: number;
  name: string;
  location: string | null;
}

// Define the interface for a map marker
interface MarkerData {
  lat: number;
  lng: number;
  name: string;
}

const containerStyle = {
  width: '100%',
  height: '80vh'
};

// A default center for the map (e.g., center of India)
const center = {
  lat: 20.5937,
  lng: 78.9629
};

const API_KEY = 'AIzaSyB9RvwCIunsn2k5kL25KlAoklBab-3l59Y';

const ProductsMap: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY
  });

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMarker, setActiveMarker] = useState<MarkerData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProductsAndGeocode = async () => {
      if (!isLoaded) return; // Wait until the map script is loaded

      setLoading(true);
      try {
        // 1. Fetch products from the API
        const response = await api.get<{ success: boolean, products: Product[] }>('/api/products/public');
        if (!response.data.success) {
          throw new Error('Failed to fetch products');
        }
        const productsWithLocation = response.data.products.filter(p => p.location);

        // 2. Geocode locations
        const geocoder = new window.google.maps.Geocoder();
        const geocodePromises = productsWithLocation.map(product => {
          return new Promise<MarkerData | null>((resolve) => {
            if (!product.location) {
              return resolve(null);
            }
            
            // Set a timeout for each geocoding request
            const timer = setTimeout(() => {
              console.warn(`Geocoding timed out for location: "${product.location}"`);
              resolve(null);
            }, 5000); // 5-second timeout

            geocoder.geocode({ address: product.location }, (results, status) => {
              clearTimeout(timer); // Clear the timeout if the request completes
              if (status === 'OK' && results && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                resolve({
                  lat: lat(),
                  lng: lng(),
                  name: product.name,
                });
              } else {
                console.warn(`Geocode failed for location: "${product.location}" with status: ${status}`);
                resolve(null); // Resolve with null if geocoding fails
              }
            });
          });
        });

        const newMarkers = (await Promise.all(geocodePromises)).filter((m): m is MarkerData => m !== null);
        setMarkers(newMarkers);

      } catch (error) {
        console.error("Error fetching or geocoding products:", error);
        toast.error('Could not load product locations.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndGeocode();
  }, [isLoaded]); // Rerun when the map is loaded

  const handleMarkerClick = (marker: MarkerData) => {
    setActiveMarker(marker);
  };

  const handleMapClick = () => {
    setActiveMarker(null);
  };

  if (loadError) {
    return <div className="text-center py-10">Error loading maps. Please check the API key and ensure it is configured correctly.</div>;
  }

  if (!isLoaded) {
    return <div className="text-center py-10">Loading Map...</div>;
  }
  
  const filteredMarkers = markers.filter(marker =>
    marker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
       {!loading && (
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search for products on the map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
       )}
       <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Products Global View</h1>
       {loading ? (
         <div className="text-center py-10">Loading Product Locations...</div>
       ) : (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onClick={handleMapClick}
        >
          {filteredMarkers.map((marker, index) => (
            <React.Fragment key={index}>
              <MarkerF
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.name}
                icon={{
                  path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                  fillColor: '#FF0000',
                  fillOpacity: 1,
                  strokeWeight: 0,
                  scale: 1.2,
                }}
                onClick={() => handleMarkerClick(marker)}
              />
              <OverlayView
                position={{ lat: marker.lat, lng: marker.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(width, height) => ({
                  x: -(width / 2),
                  y: -45, // Position the label above the marker pin
                })}
              >
                <div style={{
                  display: 'inline-block',
                  background: 'white',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                  fontSize: '14px',
                  color: '#000000',
                  whiteSpace: 'nowrap'
                }}>
                  {marker.name}
                </div>
              </OverlayView>
            </React.Fragment>
          ))}

          {activeMarker && (
            <InfoWindow
              position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div>
                <h4 className="font-bold">{activeMarker.name}</h4>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
       )}
    </div>
  );
};

export default ProductsMap; 