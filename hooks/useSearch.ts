import { useState, useEffect } from "react";
import { Suggestion } from "@/types/types";
import { OPENCAGE_KEY } from "@/lib/constants";
import { makeDisplayNameFromComponents, isValidSuggestion } from "@/lib/utils";

export const useSearch = () => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.length > 2 && !selected) {
        fetchSuggestions(input);
      } else if (input.length <= 2) {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [input, selected]);

  const fetchSuggestions = async (query: string) => {
    if (!OPENCAGE_KEY) return;
    setLoadingSuggestions(true);
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_KEY}&countrycode=PH&limit=5`;
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

  const onChange = (val: string) => {
    setInput(val);
    setSelected(null);
  };

  const pickSuggestion = (suggestion: Suggestion) => {
    setInput(suggestion.display);
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
    setSuggestions, // <--- IMPORTANT: Ensure this is here
  };
};