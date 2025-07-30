import axios from "axios";

export const image = async () => {
  try {
    const { data } = await axios.get(`/api/admin/photos`);
    return data;
  } catch (error) {
    console.error("image error:", error);
    throw new Error("Failed to perform image retrieval");
  }
};

export const updateTitle = async ({ id, title }) => {
  try {
    const { data } = await axios.put(`/api/admin/photos/${id}/title`, {
      title,
    });
    return data;
  } catch (error) {
    console.error("Update title error:", error);
    throw new Error("Failed to update image title");
  }
};

export const updateApproveStatus = async ({ id, approved }) => {
  try {
    const { data } = await axios.put(`/api/admin/photos/${id}/approved`, {
      approved,
    });
    return data;
  } catch (error) {
    console.error("Update approved status error:", error);
    throw new Error("Failed to update image approved status");
  }
};
