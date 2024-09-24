import User from "../models/user-schema.js";
import Column from "../models/column-schema.js";
import { generateTokens } from "../utilities/generateTokens.js";
import columnData from "../utilities/columnData.js";
import { googleClient, verifyGoogleToken } from "../utilities/googleHelper.js";

// #########################################Create User#############################################
export const createUser = async (req, res) => {
  const { fName, lName, email, password } = req.body;
  try {
    if (!fName || !lName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // const user = await User.create({ fName, lName, email, password });
    const user = new User({ fName, lName, email, password });
    //============================= creating the collumn for the new user ====================================
    const columns = columnData.map((column) => {
      return new Column({ ...column, userId: user._id });
    });
    await Column.insertMany(columns);

    await user.save();

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'Strict'
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // set the access token in the cookie
      .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
      .json({ success: true, message: "User Registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
// #########################################Login User#############################################
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'Strict'
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // set the access token in the cookie
      .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// #########################################Social Register#############################################
export const socialRegister = async (req, res) => {
  const { code } = req.body;
  try {
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { tokens } = await googleClient.getToken(code);
    if (!tokens) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }
    const payload = await verifyGoogleToken(tokens.id_token);

    const user = await User.findOne({ email: payload?.email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists,please try login",
      });
    }
    const newUser = new User({
      fName: payload?.given_name,
      lName: payload?.family_name,
      email: payload?.email,
    });
    await newUser.save();
    const columns = columnData.map((column) => {
      return new Column({ ...column, userId: newUser._id });
    });
    await Column.insertMany(columns);
    const { accessToken, refreshToken } = await generateTokens(newUser._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
       sameSite: 'Strict'
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options) // set the access token in the cookie
      .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
      .json({ success: true, message: "User Registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// #########################################Social Login#############################################
export const socialLogin = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { tokens } = await googleClient.getToken(code);
    if (!tokens) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    const payload = await verifyGoogleToken(tokens.id_token);

    const user = await User.findOne({ email: payload?.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist,please login first" });
    }
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
       sameSite: 'Strict'
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options) // set the access token in the cookie
      .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// #########################################Logout User#############################################
export const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
     sameSite: 'Strict'
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User logged out successfully" });
};

// #########################################Refresh Token#############################################
export const refreshToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token is required" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
       sameSite: 'Strict'
    };

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// #########################################Get user info#############################################
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken "
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
