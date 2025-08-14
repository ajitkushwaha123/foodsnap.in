"use client";

import { useState, useCallback } from "react";
import debounce from "lodash/debounce";

export default function DescriptionSearch() {
  const [query, setQuery] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDescriptions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) {
        setDescriptions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/descriptions?query=${encodeURIComponent(searchTerm)}`
        );
        const data = await res.json();
        if (data.success) {
          setDescriptions(data.descriptions);
        }
      } catch (error) {
        console.error("Error fetching descriptions:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchDescriptions(value);
  };

  return (
    <div className="p-4">
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search descriptions..."
        className="border p-2 rounded w-full"
      />
      {loading && <p className="text-gray-500">Loading...</p>}
      <ul className="mt-2 list-disc list-inside">
        {descriptions.map((desc, idx) => (
          <li key={idx}>{desc}</li>
        ))}
      </ul>
    </div>
  );
}
