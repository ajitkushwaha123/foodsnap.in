import User from "@/models/User";

export const updateCredits = async (userId, amount) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    user.credits -= amount;

    if (user.credits < 0) {
      return { success: false, message: "Insufficient credits" };
    }

    if (user.credits === 0) {
      user.subscription.isActive = false;
    }

    await user.save();

    return { success: true, credits: user.credits };
  } catch (error) {
    console.error("Error updating credits:", error);
    return { success: false, message: "Failed to update credits" };
  }
};
