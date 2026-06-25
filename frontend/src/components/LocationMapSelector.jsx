import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCity } from "../redux/userSlice";
import { FaSearch, FaCrosshairs, FaMapPin, FaTimes } from "react-icons/fa";

// Fix Leaflet's default marker asset paths losing reference under bundlers like Vite
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing marker icon for premium feel
const PulsingIcon = L.divIcon({
  className: "custom-pulsing-marker",
  html: `
    <div style="position:relative;width:36px;height:36px;">
      <div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:36px;height:36px;
        background:rgba(255,77,45,0.18);
        border-radius:50%;
        animation:pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite;
      "></div>
      <div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:18px;height:18px;
        background:linear-gradient(135deg,#ff4d2d,#ff6f47);
        border-radius:50%;
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(255,77,45,0.4);
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// Helper component to pan the map camera view dynamically with smooth animation
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [coords, map]);
  return null;
}

// Component to handle map click events to place marker
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function LocationMapSelector({ address, setAddress, setCoordinates }) {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const debounceTimer = useRef(null);

  const [position, setPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const API_KEY = import.meta.env.VITE_GEOAPIKEY;

  // Fetch address from coordinates via reverse geocoding
  const fetchAddressFromCoords = useCallback(
    async (lat, lng) => {
      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${API_KEY}`
        );

        const data = result?.data?.results?.[0];
        if (data) {
          const newCity = data.city || data.county || "";
          const newAddress = data.formatted || "";

          setAddress(newAddress);
          if (newCity) dispatch(setCity(newCity));
        }
      } catch (error) {
        console.error("Geoapify reverse-geocoding failed:", error);
      }
    },
    [API_KEY, setAddress, dispatch]
  );

  // Auto-detect user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(currentCoords);
          fetchAddressFromCoords(currentCoords.lat, currentCoords.lng);
        },
        (error) => {
          console.warn("Geolocation access denied. Defaulting coordinates.", error);
          fetchAddressFromCoords(position.lat, position.lng);
        }
      );
    } else {
      fetchAddressFromCoords(position.lat, position.lng);
    }
  }, []);

  // Sync position with parent component if setCoordinates is provided
  useEffect(() => {
    if (setCoordinates) {
      setCoordinates(position);
    }
  }, [position, setCoordinates]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced search with Geoapify autocomplete
  const handleSearchInput = (value) => {
    setSearchQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            value
          )}&format=json&apiKey=${API_KEY}`
        );

        const results = res?.data?.results || [];
        setSearchResults(results.slice(0, 5));
        setShowResults(results.length > 0);
      } catch (err) {
        console.error("Autocomplete search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  // Handle picking a search result
  const handleSelectResult = (result) => {
    const newPos = { lat: result.lat, lng: result.lon };
    setPosition(newPos);
    setAddress(result.formatted || "");
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);

    const city = result.city || result.county || "";
    if (city) dispatch(setCity(city));
  };

  // Locate Me button - GPS re-detect
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        fetchAddressFromCoords(coords.lat, coords.lng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("Could not access your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle map click to move marker
  const handleMapClick = (latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    fetchAddressFromCoords(latlng.lat, latlng.lng);
  };

  // Draggable marker component
  function DraggableMarker() {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            setPosition({ lat: newPos.lat, lng: newPos.lng });
            fetchAddressFromCoords(newPos.lat, newPos.lng);
          }
        },
      }),
      []
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[position.lat, position.lng]}
        ref={markerRef}
        icon={PulsingIcon}
      >
        <Popup
          className="custom-popup"
          closeButton={false}
          autoPan={false}
        >
          <div style={{ textAlign: "center", padding: "4px 2px" }}>
            <span style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#1f2937",
              letterSpacing: "0.01em",
            }}>
              📍 Drag to adjust
            </span>
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* SEARCH BAR */}
      <div ref={searchContainerRef} className="relative w-full">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-gray-400">
            <FaSearch size={13} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search for your area, landmark, or street..."
            className="w-full pl-10 pr-24 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all duration-200"
          />

          {/* Clear search button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="absolute right-[88px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={12} />
            </button>
          )}

          {/* Locate Me button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm shadow-orange-500/20 disabled:opacity-60"
          >
            <FaCrosshairs
              size={11}
              className={isLocating ? "animate-spin" : ""}
            />
            {isLocating ? "..." : "Locate"}
          </button>
        </div>

        {/* Search loading indicator */}
        {isSearching && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50">
            <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Searching locations...</span>
            </div>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && !isSearching && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden backdrop-blur-sm">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50/40 transition-all duration-150 flex items-start gap-3 group border-b border-gray-50 last:border-b-0"
              >
                <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition">
                  <FaMapPin size={11} className="text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {result.address_line1 || result.name || "Unknown Location"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {result.address_line2 || result.formatted || ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAP CONTAINER */}
      <div
        className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md relative block z-0"
        style={{
          background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        }}
      >
        {/* Gradient overlays for premium edge effect */}
        <div
          className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,0.6), transparent)",
          }}
        />

        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "160px", width: "100%" }}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <DraggableMarker />
          <ChangeMapView coords={position} />
          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        {/* Map interaction hint pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(8px)",
              color: "#374151",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <span style={{ fontSize: "11px" }}>🗺️</span>
            Tap or drag pin to set location
          </div>
        </div>
      </div>

      {/* DELIVERY ADDRESS TEXT BOX */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Delivery Address
          </label>
          {address && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
              Location set
            </span>
          )}
        </div>
        <div className="relative">
          <textarea
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your delivery address will appear here when you select a location on the map..."
            className="w-full border border-gray-200 rounded-xl p-3.5 pl-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 transition-all duration-200 resize-none leading-relaxed"
            style={{
              background: "linear-gradient(135deg, rgba(249,250,251,0.8), rgba(255,255,255,1))",
            }}
          />
          <div className="absolute left-3.5 top-3.5 text-orange-400">
            <FaMapMarkerIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline SVG map marker icon for the textarea
function FaMapMarkerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor">
      <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
    </svg>
  );
}

export default LocationMapSelector;