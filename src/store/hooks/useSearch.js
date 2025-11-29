import { useDispatch, useSelector } from "react-redux";
import {
  setQuery,
  setPage,
  setLimit,
  setSeed,
  clearSearch,
  fetchSearchResults,
  fetchLatestResults,
} from "@/store/slice/searchSlice";

export const useSearch = () => {
  const dispatch = useDispatch();

  const {
    query,
    page,
    limit,
    seed,
    results,
    pagination,
    loading,
    error,
    openStudio,
  } = useSelector((state) => state.search);

  const runSearch = () => {
    if (!query) return;
    dispatch(fetchSearchResults({ query, page, limit }));
  };

  const fetchLatest = () => {
    const newSeed = Math.random().toString(36).substring(2);
    dispatch(setSeed(newSeed));
    dispatch(fetchLatestResults({ page: 1, limit, seed: newSeed }));
  };

  const loadMore = () => {
    if (loading || !pagination?.hasNextPage) return;

    const nextPage = page + 1;
    dispatch(setPage(nextPage));

    if (query) {
      dispatch(fetchSearchResults({ query, page: nextPage, limit }));
    } else {
      dispatch(fetchLatestResults({ page: nextPage, limit, seed }));
    }
  };

  return {
    query,
    page,
    limit,
    seed,
    results,
    pagination,
    loading,
    error,
    openStudio,
    runSearch,
    loadMore,
    updateQuery: (v) => dispatch(setQuery(v)),
    updateLimit: (v) => dispatch(setLimit(v)),
    updatePage: (v) => dispatch(setPage(v)),
    resetSearch: () => dispatch(clearSearch()),
    fetchLatest,
  };
};
