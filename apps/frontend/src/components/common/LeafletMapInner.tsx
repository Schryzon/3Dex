"use client";

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapInnerProps {
    coords: { lat: number; lng: number } | null;
    defaultCenter: [number, number];
    onCoordsChange?: (coords: { lat: number; lng: number }) => void;
}

// Custom 3Dēx Yellow Pin Icon
const createCustomPin = () => {
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div style="
                position: relative;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    position: absolute;
                    width: 28px;
                    height: 28px;
                    background: rgba(250, 204, 21, 0.2);
                    border-radius: 50%;
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                    width: 14px;
                    height: 14px;
                    background: #facc15;
                    border: 2px solid #000000;
                    border-radius: 50%;
                    box-shadow: 0 0 12px rgba(250, 204, 21, 0.8);
                "></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// Auto-center map when coords change
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom() < 13 ? 14 : map.getZoom());
    }, [center, map]);
    return null;
}

// Map Click Listener
function MapEvents({ onCoordsChange }: { onCoordsChange?: (coords: { lat: number; lng: number }) => void }) {
    useMapEvents({
        click(e) {
            if (onCoordsChange) {
                onCoordsChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });
    return null;
}

export default function LeafletMapInner({
    coords,
    defaultCenter,
    onCoordsChange,
}: LeafletMapInnerProps) {
    const customPin = useMemo(() => createCustomPin(), []);
    const center: [number, number] = coords ? [coords.lat, coords.lng] : defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={coords ? 14 : 11}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', backgroundColor: '#111' }}
            attributionControl={false}
        >
            {/* Dark CartoDB Tiles matching 3Dēx aesthetic */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
            />

            {coords && (
                <>
                    <ChangeView center={[coords.lat, coords.lng]} />
                    <Marker
                        position={[coords.lat, coords.lng]}
                        icon={customPin}
                        draggable={!!onCoordsChange}
                        eventHandlers={{
                            dragend(e) {
                                const marker = e.target;
                                const position = marker.getLatLng();
                                if (onCoordsChange) {
                                    onCoordsChange({ lat: position.lat, lng: position.lng });
                                }
                            },
                        }}
                    />
                </>
            )}

            {onCoordsChange && <MapEvents onCoordsChange={onCoordsChange} />}
        </MapContainer>
    );
}
