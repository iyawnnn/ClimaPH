import { useEffect, useRef, useState } from "react";
import { Suggestion } from "@/types";
import { OPENCAGE_KEY, SUGGESTIONS_TTL, ACCEPTED_PLACE_TYPES } from "@/lib/constants";
import { makeDisplayNameFromComponents, setWithTTL, getWithTTL, isValidSuggestion } from "@/lib/utils";

export const useSearch = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState("");

  const debounceTimer = useRef<number | null>(null);

  // Fetch suggestions from OpenCage API
  const fetchSuggestions = async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    setError("");
    setLoadingSuggestions(true);

    const cacheKey = `oc_suggestions_${q.toLowerCase()}`;
    const cached = getWithTTL(cacheKey);

    if (cached) {
      setSuggestions(cached);
      setLoadingSuggestions(false);
      return;
    }

    if (!OPENCAGE_KEY) {
      setError("Missing OpenCage API key.");
      setLoadingSuggestions(false);
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        q
      )}&key=${OPENCAGE_KEY}&countrycode=PH&limit=10`;

      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data.results)) {
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }

      const cleanedResults = data.results.filter(isValidSuggestion);

      const mapped: Suggestion[] = cleanedResults
        .map((r: any, idx: number) => {
          const components = r.components || {};
          const place_type = components._type || r._type || "";

          return {
            id:
              r.annotations?.geohash ||
              `${place_type}-${r.geometry.lat}-${r.geometry.lng}-${idx}`,
            display: makeDisplayNameFromComponents(components, r.formatted),
            lat: r.geometry.lat,
            lng: r.geometry.lng,
            components,
            place_type,
          };
        })
        .reduce((acc, cur) => {
          if (!acc.some((a) => a.display === cur.display)) acc.push(cur);
          return acc;
        }, []);

      // Remove duplicates
      const preferred = mapped.filter((m) =>
        ACCEPTED_PLACE_TYPES.has(m.place_type.toLowerCase())
      );

      const final = preferred.length > 0 ? preferred : mapped;
      setSuggestions(final);
      setWithTTL(cacheKey, final, SUGGESTIONS_TTL);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const debouncedFetch = (q: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      fetchSuggestions(q);
      debounceTimer.current = null;
    }, 450);
  };

  const onChange = (val: string) => {
    setInput(val);
    setSelected(null);
    debouncedFetch(val);
  };

  const pickSuggestion = (s: Suggestion) => {
    if (
      !s ||
      typeof s.lat !== "number" ||
      typeof s.lng !== "number" ||
      !s.components ||
      Object.keys(s.components).length === 0
    ) {
      setError("This location has incomplete data. Please choose another.");
      return;
    }
    setSelected(s);
    setInput(s.display);
    setSuggestions([]); // Clear suggestions after pick
  };

  return {
    input,
    suggestions,
    selected,
    loadingSuggestions,
    error,
    onChange,
    pickSuggestion,
    setError, // Expose to allow clearing error from outside
  };
};