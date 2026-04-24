import { useState, useEffect, useCallback, useMemo } from "react";
import debounce from "lodash.debounce";
import { Suggestion } from "@/types/types";
import { env } from "@/lib/env";
import { makeDisplayNameFromComponents, isValidSuggestion } from "@/lib/utils";

export const useSearch = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (!env.NEXT_PUBLIC_OPENCAGE_API_KEY) return;
    setLoadingSuggestions(true);
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${env.NEXT_PUBLIC_OPENCAGE_API_KEY}&countrycode=PH&limit=5`;
      const res = await fetch(url);
      const data = await res.json();

      const safeSuggestions = (data.results || [])
        .filter(isValidSuggestion)
        .map((r: any) => ({
          display: makeDisplayNameFromComponents(r.components, r.formatted),
          lat: r.geometry.lat,
          lng: r.geometry.lng,
        }));

      setSuggestions(safeSuggestions);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce((q: string) => fetchSuggestions(q), 500),
    []
  );

  useEffect(() => {
    if (input.length > 2 && !selected) {
      debouncedFetch(input);
    } else if (input.length <= 2) {
      setSuggestions([]);
      debouncedFetch.cancel();
    }

    return () => debouncedFetch.cancel();
  }, [input, selected, debouncedFetch]);

  const onChange = (val: string) => {
    setInput(val);
    setSelected(null);
  };

  const pickSuggestion = (suggestion: Suggestion) => {
    setInput(suggestion.display || "");
    setSelected(suggestion);
    setSuggestions([]);
  };

  return {
    input,
    suggestions,
    selected,
    loadingSuggestions,
    onChange,
    pickSuggestion,
    setSuggestions,
  };
};