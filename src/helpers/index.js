import axios from "axios";

export const search = async ({ query, page = 1, limit = 5 }) => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const res = await axios.get(
      `/api/library/search?search=${encodedQuery}&page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Search error:", error);

    if (error?.response) {
      throw error;
    }

    // Fallback error
    throw new Error("Failed to perform search");
  }
};

export const latest = async ({ page = 1, limit = 5 }) => {
  try {
    const res = await axios.get(
      `/api/library/latest?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("Search error:", error);

    if (error?.response) {
      throw error;
    }

    // Fallback error
    throw new Error("Failed to perform search");
  }
};
