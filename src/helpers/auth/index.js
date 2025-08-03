import User from "@/models/User";

export const getUserId = async (clerkId) => {
  try {
    const user = await User.findOne({
      clerkId: clerkId,
    });
    return user ? user._id : null;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw new Error("Unable to retrieve user ID");
  }
};
