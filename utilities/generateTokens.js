import User from "../models/user-schema.js";

export const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("No user found");
    }
  
    // generate access token
    const accessToken = user.generateAccessToken();
    // generate refresh token
    const refreshToken = user.generateRefreshToken();
  
    // save the refresh token to the database
    user.refreshToken = refreshToken;
    // save the user and also disable the validation
    await user.save({ validateBeforeSave: false });
  
    return { accessToken, refreshToken };
  };