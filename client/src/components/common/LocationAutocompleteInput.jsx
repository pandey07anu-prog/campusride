import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, School, Bus, Building2, X, Loader2 } from 'lucide-react';
import { POPULAR_INDIAN_LOCATIONS } from '../../constants/indianLocations';
import api from '../../services/api';

export default function LocationAutocompleteInput({
  value = '',
  onChange,
  placeholder = "Search any location in India (e.g. Chitkara, Sector 17, Delhi, Pune)",
  label,
  required = false,
  showMyLocationOption = true,
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal query with incoming prop
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant 0ms local matching
  const getLocalMatches = (rawInput) => {
    if (!rawInput || !rawInput.trim()) {
      return POPULAR_INDIAN_LOCATIONS.slice(0, 7);
    }
    const clean = rawInput.toLowerCase().trim();
    const parts = clean.split(/\s+/).filter(Boolean);

    return POPULAR_INDIAN_LOCATIONS.filter((item) => {
      const name = item.name.toLowerCase();
      return parts.every((part) => name.includes(part));
    }).slice(0, 10);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setSelectedIndex(-1);

    if (!val || val.trim().length === 0) {
      setSuggestions(POPULAR_INDIAN_LOCATIONS.slice(0, 7));
      setShowDropdown(true);
      setIsSearchingApi(false);
      return;
    }

    // 1. Instant local search (0ms)
    const local = getLocalMatches(val);
    setSuggestions(local);
    setShowDropdown(true);

    // 2. Debounced API search for any location across India
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingApi(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Query backend places API or direct Photon Indian Geocoder in parallel
          let apiResults = [];

          try {
            const res = await api.get(`/features/places-autocomplete?q=${encodeURIComponent(val)}`);
            if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
              apiResults = res.data;
            }
          } catch (e) {
            // Fallback to direct Photon Geocoder
            const direct = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=20.5937&lon=78.9629&limit=10`);
            const pData = await direct.json();
            if (pData?.features) {
              apiResults = pData.features.map(f => {
                const p = f.properties || {};
                const parts = [p.name, p.street, p.district || p.city, p.state, p.country].filter(Boolean);
                const fullName = parts.filter((v, i, a) => a.indexOf(v) === i).join(', ');
                return {
                  name: fullName,
                  type: p.osm_key === 'amenity' && p.osm_value === 'university' ? 'campus' : p.osm_key === 'highway' ? 'transit' : 'place',
                };
              });
            }
          }

          // Merge local matches and pan-India API matches
          const seen = new Set();
          const merged = [];

          for (const item of [...local, ...apiResults]) {
            const key = (item.name || '').toLowerCase().trim();
            if (key && !seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          setSuggestions(merged.slice(0, 12));
        } catch (err) {
          // Graceful fallback to local
        } finally {
          setIsSearchingApi(false);
        }
      }, 200);
    } else {
      setIsSearchingApi(false);
    }
  };

  const handleSelectSuggestion = (loc) => {
    const name = typeof loc === 'string' ? loc : loc.name;
    setQuery(name);
    onChange(name);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingGps(true);
    setShowDropdown(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const p = data.features[0].properties;
            const parts = [p.name, p.city || p.district, p.state].filter(Boolean);
            const locName = parts.join(', ');
            setQuery(locName);
            onChange(locName);
          } else {
            const fallback = `Current Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
            setQuery(fallback);
            onChange(fallback);
          }
        } catch (err) {
          const fallback = `Current Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
          setQuery(fallback);
          onChange(fallback);
        } finally {
          setDetectingGps(false);
          setShowDropdown(false);
        }
      },
      (error) => {
        setDetectingGps(false);
        setShowDropdown(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'campus':
        return <School className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />;
      case 'transit':
        return <Bus className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />;
    }
  };

  return (
    <div className={`relative w-full ${showDropdown ? 'z-50' : 'z-0'}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.08em] mb-1.5">{label}</label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={detectingGps ? 'Detecting your location...' : query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!detectingGps) {
              setSuggestions(getLocalMatches(query));
              setShowDropdown(true);
            }
          }}
          placeholder={detectingGps ? '' : placeholder}
          required={required}
          disabled={detectingGps}
          className="!pl-4 !pr-9 !py-3 !text-[13px] !rounded-xl w-full"
          style={{
            background: detectingGps ? 'rgba(251,191,36,0.03)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${detectingGps ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)'}`,
            color: detectingGps ? '#fbbf24' : '#f5f5f5',
          }}
        />
        {detectingGps ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-[#fbbf24] border-t-transparent animate-spin" />
          </div>
        ) : isSearchingApi ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 text-[#a3e635] animate-spin" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setSuggestions(POPULAR_INDIAN_LOCATIONS.slice(0, 7));
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#a6a6a6] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0 mt-1.5 overflow-hidden rounded-xl"
          style={{
            background: '#181818',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
            maxHeight: '340px',
            overflowY: 'auto',
            zIndex: 99999,
          }}
        >
          {/* GPS option */}
          {showMyLocationOption && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUseMyLocation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleUseMyLocation();
              }}
              disabled={detectingGps}
              className="w-full text-left px-4 py-3 flex items-center justify-between text-[12px] font-semibold transition-all hover:bg-white/[0.04] cursor-pointer"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                color: detectingGps ? '#fbbf24' : '#a3e635',
                background: detectingGps ? 'rgba(251,191,36,0.04)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-2.5">
                {detectingGps ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#fbbf24] border-t-transparent animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{detectingGps ? 'Fetching precise GPS coordinates...' : 'Use Current GPS Location'}</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20">
                GPS
              </span>
            </button>
          )}

          {/* Suggestions list */}
          <div className="py-1">
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-[12px] text-[#737373] text-center">
                {isSearchingApi ? 'Searching pan-India locations...' : `Press enter to use "${query}"`}
              </div>
            ) : (
              suggestions.map((item, idx) => {
                const locName = typeof item === 'string' ? item : item.name;
                const type = typeof item === 'string' ? 'place' : item.type;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectSuggestion(item);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSuggestion(item);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-[12px] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#a3e635]/15 text-white font-bold' : 'hover:bg-white/[0.08] text-[#e5e5e5]'
                    }`}
                  >
                    {renderIcon(type)}
                    <div className="flex-1 min-w-0">
                      <span className="truncate block font-medium">
                        {locName}
                      </span>
                    </div>
                    {type === 'campus' && (
                      <span className="text-[9px] font-bold text-[#a3e635] bg-[#a3e635]/10 px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#a3e635]/20 shrink-0">
                        Campus
                      </span>
                    )}
                    {type === 'transit' && (
                      <span className="text-[9px] font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#38bdf8]/20 shrink-0">
                        Transit
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
