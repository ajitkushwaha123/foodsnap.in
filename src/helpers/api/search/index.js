import axios from "axios";

export const search = async ({ query }) => {
  try {
    const { data } = await axios.get(`/api/library/search?search=${query}`);
    return data;
  } catch (error) {
    console.error("Search error:", error);

    if (error.response) {
      throw error;
    }
    throw new Error("Failed to perform search");
  }
};
