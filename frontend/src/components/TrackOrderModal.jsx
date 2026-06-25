import React, { useEffect, useState } from "react";
import { FaTimes, FaMotorcycle, FaMapMarkerAlt, FaStore } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import { serverURL } from "../config/api";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Premium motorcycle icon for the delivery driver
const driverIcon = L.divIcon({
  className: "driver-marker",
  html: `
    <div style="position:relative; width:40px; height:40px;">
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:40px; height:40px; background:rgba(16,185,129,0.2); border-radius:50%; animation:pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite;"></div>
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:30px; height:30px; background:linear-gradient(135deg,#10b981,#059669); border-radius:50%; border:3px solid white; box-shadow:0 4px 10px rgba(16,185,129,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:14px;">
        🏍️
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Premium home/destination icon
const destIcon = L.divIcon({
  className: "dest-marker",
  html: `
    <div style="position:relative; width:36px; height:36px;">
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:26px; height:26px; background:linear-gradient(135deg,#f97316,#ea580c); border-radius:50%; border:3px solid white; box-shadow:0 4px 10px rgba(249,115,22,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:12px;">
        🏠
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Map auto-center logic
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

// Leaflet Routing Machine Integration Component
function RoutingMachine({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end || !map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#f97316', weight: 6, opacity: 0.8 }] // Vibrant orange route
      },
      createMarker: () => null, // We provide our own markers via React-Leaflet
    }).addTo(map);

    // Hide the default text itinerary panel which doesn't fit our premium UI
    const container = routingControl.getContainer();
    if (container) {
      container.style.display = 'none';
    }

    return () => {
      try {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      } catch (e) { }
    };
  }, [map, start, end]);

  return null;
}

function TrackOrderModal({ order, onClose }) {
  const [driverPos, setDriverPos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  const [routingStartPos, setRoutingStartPos] = useState(null); // Keep starting pos static for routing line to remain drawn

  useEffect(() => {
    const socket = io(serverURL);
    socket.emit("join_order", order._id);

    // 1. Set Initial Destination
    const initialDest = { 
      lat: order.deliveryLat || 28.6139, 
      lng: order.deliveryLng || 77.2090 
    };
    setDestPos(initialDest);

    // 2. Set Initial Driver Pos (Shop)
    const initialShop = {
      lat: order.shop?.lat || initialDest.lat - 0.02,
      lng: order.shop?.lng || initialDest.lng - 0.02
    };
    setDriverPos(initialShop);
    setRoutingStartPos(initialShop);

    socket.on("driver_location_update", (data) => {
      const pos = { lat: data.lat, lng: data.lng };
      setDriverPos(pos);
      setRoutingStartPos((prev) => prev || pos);
    });

    return () => socket.disconnect();
  }, [order._id, order.deliveryLat, order.deliveryLng, order.shop]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6 sm:justify-center items-center animate-in fade-in duration-200">

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col mt-auto sm:mt-0 max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
              <FaMotorcycle className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Live Tracking</h2>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Driver is on the way
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[350px] bg-gray-100">
          {!driverPos || !destPos ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
              <p className="mt-3 text-sm font-semibold text-gray-600">Calculating route...</p>
            </div>
          ) : (
            <MapContainer
              center={[driverPos.lat, driverPos.lng]}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />

              {/* Destination Marker */}
              <Marker position={[destPos.lat, destPos.lng]} icon={destIcon}>
                <Popup className="custom-popup" closeButton={false}>
                  <div className="text-center font-bold text-orange-600 text-xs">Destination</div>
                </Popup>
              </Marker>

              {/* Driver Marker */}
              <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon}>
                <Popup className="custom-popup" closeButton={false}>
                  <div className="text-center font-bold text-emerald-700 text-xs">Driver</div>
                </Popup>
              </Marker>

              {/* Route line */}
              {routingStartPos && destPos && (
                <RoutingMachine start={routingStartPos} end={destPos} />
              )}
            </MapContainer>
          )}

          {/* Gradients to blend map edges softly */}
          <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/5 to-transparent z-[400] pointer-events-none"></div>
          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/5 to-transparent z-[400] pointer-events-none"></div>
        </div>

        {/* Footer Details */}
        <div className="p-5 bg-white">
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center flex-shrink-0 border border-orange-100/50">
              <FaMapMarkerAlt className="text-orange-500 text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Delivering to</p>
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {order.deliveryAddress}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TrackOrderModal;
