"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Clock, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUser } from "@/store/hooks/useUser";
import { generateDescription, suggestions } from "@/helpers";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [generatedSuggestion, setGeneratedSuggestion] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { user } = useUser();

  const getDescription = async (req) => {
    try {
      setLoadingGenerate(true);
      const data = await generateDescription(req);
      setGeneratedSuggestion(data?.descriptions || []);
    } catch (error) {
      console.error("Error fetching description:", error);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setApiSuggestions([]);
        return;
      }
      try {
        const data = await suggestions(value);
        setApiSuggestions(
          data?.suggestions?.map((s) => ({
            type: "api",
            value: s.title || s,
          })) || []
        );
      } catch (err) {
        console.error("Error fetching API suggestions:", err);
        setApiSuggestions([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  const historySuggestions = useMemo(() => {
    if (!user?.searchHistory) return [];
    if (!query.trim())
      return user.searchHistory.map((h) => ({
        type: "history",
        value: h.query,
      }));
    return user.searchHistory
      .map((h) => ({ type: "history", value: h.query }))
      .filter((item) => item.value.toLowerCase().includes(query.toLowerCase()));
  }, [query, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      try {
        setLoadingSearch(true);
        await onSearch(query);
        setShowSuggestions(false);
      } finally {
        setLoadingSearch(false);
      }
    }
  };

  const handleSelectSuggestion = (value) => {
    setQuery(value);
    if (onSearch) onSearch(value);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(!!value.trim());
  };

  const handleGenerateDescription = async () => {
    if (!query.trim()) return;
    await getDescription(query);
    setShowSuggestions(true);
  };

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1200);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const allSuggestions = [
    ...historySuggestions,
    ...(generatedSuggestion
      ? [{ type: "generated", value: generatedSuggestion }]
      : []),
    ...apiSuggestions,
  ];

  return (
    <div className="w-full max-w-full px-3 md:px-4 relative">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-2 shadow-md transition-all focus-within:ring-1 ring-[#0025cc]"
      >
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search dishes, tags, or cuisines..."
          className="w-full bg-transparent text-sm focus:outline-none text-gray-800 dark:text-white placeholder-gray-400"
        />
        <button
          type="button"
          onClick={handleGenerateDescription}
          disabled={loadingGenerate}
          className="ml-2 flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingGenerate ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Sparkles size={16} />
          )}
          {loadingGenerate ? "Generating..." : "Generate"}
        </button>
        <button
          type="submit"
          disabled={loadingSearch}
          className="ml-2 bg-[#0025cc] hover:bg-[#1c3eff] text-white px-4 py-1.5 text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSearch ? (
            <Loader2 className="animate-spin h-4 w-4 mx-auto" />
          ) : (
            "Search"
          )}
        </button>
      </form>

      <AnimatePresence>
        {showSuggestions && allSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mx-4 mt-2 top-full left-0 right-0 z-50"
          >
            <Command className="border border-gray-200 dark:border-gray-700 rounded-md shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
              <CommandList>
                <CommandEmpty className="py-3 text-gray-500 dark:text-gray-400">
                  No results found.
                </CommandEmpty>

                {generatedSuggestion.length > 0 && (
                  <CommandGroup heading="Generated Description">
                    {generatedSuggestion.map((desc, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                      >
                        <CommandItem className="px-4 py-3 text-sm flex items-center justify-between gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleSelectSuggestion(desc)}
                          >
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="truncate">{desc}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(desc, idx);
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                )}

                {historySuggestions.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {historySuggestions.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                      >
                        <CommandItem
                          onSelect={() => handleSelectSuggestion(item.value)}
                          className="cursor-pointer px-4 py-3 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{item.value}</span>
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                )}

                {apiSuggestions.length > 0 && (
                  <CommandGroup heading="From Our Menu">
                    {apiSuggestions.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                      >
                        <CommandItem
                          onSelect={() => handleSelectSuggestion(item.value)}
                          className="cursor-pointer px-4 py-3 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Search className="h-4 w-4 text-gray-500" />
                          <span className="truncate">{item.value}</span>
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
