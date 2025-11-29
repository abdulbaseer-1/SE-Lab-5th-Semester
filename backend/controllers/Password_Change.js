import User from "../models/User.model.js";
import bcrypt from "bcrypt";

const changePassword = async (req, res) => {
  try {
    const { previousPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // Fetch the authenticated user's ID from the session
    const userName = req.session.user?.username; // Ensure user is authenticated via session

    if (!userName) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await User.findOne({username: userName});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the previous password with the stored password
    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect previous password" });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: error.message });
  }
};

export default changePassword;