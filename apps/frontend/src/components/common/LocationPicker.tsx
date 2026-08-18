"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, X, Loader2, Navigation, AlertCircle } from 'lucide-react';

export interface LocationAddress {
    label: string;
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
    lat?: number;
    lng?: number;
    notes?: string;
}

interface LocationPickerProps {
    value?: string | LocationAddress;
    onChange?: (address: LocationAddress) => void;
    placeholder?: string;
    show_map?: boolean;
    className?: string;
    disabled?: boolean;
    country_restriction?: string;
}

interface PhotonFeature {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        city?: string;
        district?: string;
        locality?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
    geometry: {
        coordinates: [number, number]; // [lon, lat]
    };
}

const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta [lat, lng]

// Dynamically import Leaflet Map to avoid SSR `window is not defined`
const MapComponent = dynamic(
    () => import('./LeafletMapInner'),
    {
        ssr: false,
        loading: () => (
            <div className="h-44 w-full bg-[#111] rounded-2xl flex items-center justify-center border border-white/10 text-xs text-zinc-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                <span>Loading map...</span>
            </div>
        )
    }
);

export default function LocationPicker({
    value,
    onChange,
    placeholder = "Search street, district, or city...",
    show_map = true,
    className = "",
    disabled = false,
}: LocationPickerProps) {
    const [inputValue, setInputValue] = useState("");
    const [selectedAddress, setSelectedAddress] = useState<LocationAddress | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [suggestions, setSuggestions] = useState<LocationAddress[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync external value
    useEffect(() => {
        if (!value) {
            setInputValue("");
            setSelectedAddress(null);
            setCoords(null);
            return;
        }

        if (typeof value === "string") {
            setInputValue(value);
            setSelectedAddress({ label: value });
        } else if (typeof value === "object") {
            setInputValue(value.label || "");
            setSelectedAddress(value);
            if (value.lat && value.lng) {
                setCoords({ lat: value.lat, lng: value.lng });
            }
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search with Photon (OpenStreetMap Autocomplete)
    const searchPlaces = useCallback(async (query: string) => {
        if (!query || query.trim().length < 2) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            // Biased to Indonesia (lat -6.2, lon 106.8)
            const res = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=-6.2&lon=106.8`,
                { headers: { Accept: "application/json" } }
            );

            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();

            const parsed: LocationAddress[] = (data.features || []).map((f: PhotonFeature) => {
                const p = f.properties || {};
                const [lon, lat] = f.geometry.coordinates;

                const street = [p.street, p.housenumber].filter(Boolean).join(" ");
                const city = p.city || p.district || p.locality || "";
                const province = p.state || "";
                const postal_code = p.postcode || "";
                const country = p.country || "";

                // Build clean label
                const labelParts = [
                    p.name !== street ? p.name : null,
                    street,
                    city,
                    province,
                    country
                ].filter(Boolean);

                const label = labelParts.length > 0 ? labelParts.join(", ") : query;

                return {
                    label,
                    street: street || undefined,
                    city: city || undefined,
                    province: province || undefined,
                    postal_code: postal_code || undefined,
                    country: country || undefined,
                    lat,
                    lng: lon,
                };
            });

            setSuggestions(parsed);
            setIsDropdownOpen(parsed.length > 0);
        } catch (err) {
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle typing with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputValue(text);

        const manualAddress: LocationAddress = {
            ...(selectedAddress || {}),
            label: text,
        };
        setSelectedAddress(manualAddress);
        if (onChange) {
            onChange(manualAddress);
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            searchPlaces(text);
        }, 300);
    };

    // Select suggestion from dropdown
    const handleSelectSuggestion = (item: LocationAddress) => {
        setInputValue(item.label);
        setSelectedAddress(item);
        if (item.lat && item.lng) {
            setCoords({ lat: item.lat, lng: item.lng });
        }
        setIsDropdownOpen(false);
        if (onChange) {
            onChange(item);
        }
    };

    // Clear input
    const handleClear = () => {
        setInputValue("");
        setSelectedAddress(null);
        setCoords(null);
        setSuggestions([]);
        setIsDropdownOpen(false);
        if (onChange) {
            onChange({ label: "" });
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Reverse Geocode when pin is dragged/clicked on map
    const handleCoordsChange = useCallback(async (newCoords: { lat: number; lng: number }) => {
        setCoords(newCoords);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${newCoords.lat}&lon=${newCoords.lng}&format=json&addressdetails=1`,
                { headers: { Accept: "application/json" } }
            );

            if (!res.ok) throw new Error("Reverse geocode failed");
            const data = await res.json();
            const addr = data.address || {};

            const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
            const city = addr.city || addr.town || addr.regency || addr.county || "";
            const province = addr.state || "";
            const postal_code = addr.postcode || "";
            const country = addr.country || "";
            const label = data.display_name || inputValue;

            const structured: LocationAddress = {
                label,
                street: street || undefined,
                city: city || undefined,
                province: province || undefined,
                postal_code: postal_code || undefined,
                country: country || undefined,
                lat: newCoords.lat,
                lng: newCoords.lng,
            };

            setInputValue(structured.label);
            setSelectedAddress(structured);
            if (onChange) {
                onChange(structured);
            }
        } catch (err) {
            // Keep coords even if reverse geocode fails
            const fallback: LocationAddress = {
                ...(selectedAddress || { label: inputValue }),
                lat: newCoords.lat,
                lng: newCoords.lng,
            };
            setSelectedAddress(fallback);
            if (onChange) {
                onChange(fallback);
            }
        }
    }, [inputValue, onChange, selectedAddress]);

    return (
        <div className={`space-y-3 relative ${className}`}>
            {/* Search Input */}
            <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    <MapPin className="w-4 h-4 text-yellow-400/80" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setIsDropdownOpen(true)}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-yellow-400/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all duration-200"
                />

                <div className="absolute right-3 flex items-center gap-1.5">
                    {isSearching && (
                        <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                    )}
                    {inputValue && !disabled && !isSearching && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-12 left-0 right-0 z-50 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto"
                >
                    {suggestions.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full text-left px-4 py-2.5 hover:bg-yellow-400/10 border-b border-white/5 last:border-0 transition-colors flex items-start gap-3 group"
                        >
                            <MapPin className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{item.label}</p>
                                {(item.city || item.province) && (
                                    <p className="text-[10px] text-zinc-500 truncate">
                                        {[item.city, item.province, item.country].filter(Boolean).join(", ")}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Map Preview */}
            {show_map && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg h-44 w-full bg-[#111]">
                    <MapComponent
                        coords={coords}
                        defaultCenter={defaultCenter}
                        onCoordsChange={!disabled ? handleCoordsChange : undefined}
                    />

                    {/* Coordinates Badge */}
                    {coords && (
                        <div className="absolute bottom-2 left-2 z-[400] bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-zinc-400 flex items-center gap-1.5 pointer-events-none">
                            <Navigation className="w-3 h-3 text-yellow-400" />
                            <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                            {!disabled && <span className="text-zinc-600">| Drag pin or click map</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
