import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) =>
{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken =user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }

   
}

const registerUser = asyncHandler(async (req, res) => {
   console.log("🔹 Received Body:", req.body);
   console.log("🔹 Received Files:", req.files);
   console.log("🔹 Avatar File:", req.files?.avatar);

  // Logs the full object containing the files
   if (req.files.avatar && req.files.avatar.length > 0) {
      console.log("✅ Avatar File Path:", req.files.avatar[0].path);
   }
   if (req.files.coverImage && req.files.coverImage.length > 0) {
      console.log("✅ Cover Image Path:", req.files.coverImage[0].path);
   }
   
   // 🟢 Extract user details
   const { fullName, email, username, password } = req.body;

   // 🟢 Validate required fields
   if ([fullName, email, username, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
   }

   // 🟢 Check if user already exists
   const existedUser = await User.findOne({ $or: [{ username }, { email }] });
   if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
   }
   // console.log(req.files);

   // 🟢 Validate file upload (Check if Multer processed files)
   if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
      throw new ApiError(400, "Avatar file is required");
   }

   // ✅ Extract file paths safely
   const avatarFilePath = req.files.avatar[0].path;
   const coverImageFilePath = req.files?.coverImage?.[0]?.path || null;

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
      
   } 

   console.log("✅ Avatar Path:", avatarFilePath);
   console.log("✅ Cover Image Path:", coverImageFilePath);

   // 🟢 Upload files to Cloudinary
   const avatarUpload = await uploadOnCloudinary(avatarFilePath);
   const coverImageUpload = coverImageFilePath ? await uploadOnCloudinary(coverImageFilePath) : null;

   if (!avatarUpload) {
      throw new ApiError(500, "Failed to upload avatar to Cloudinary");
   }

   // 🟢 Create new user
   const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatarUpload.url,
      coverImage: coverImageUpload?.url || "",
   });

   // 🟢 Fetch created user details without sensitive fields
   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
   }

   console.log("User Created:", createdUser);

   //  Send response
   return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});
const loginUser = asyncHandler(async (req, res) =>{
   // req body -> data
   // username or email
   //find the user
   //password check
   //accesss and refresh token
   //send cookies

   const {email, username, password} = req.body
   console.log(email);

   if (!username && !email) {
      throw new ApiError(400, "username or email is required")
   }
   const user = await User.findOne({
      $or: [{username}, {email}]
   })
   
   if (!user) {
      throw new ApiError(404, "User does not exist")
   }
   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials")
      }
      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

      const loggedInUser = await User.findById(user._id).
      select("-password -refreshToken")

      const options = {
         httpOnly: true,
         secure: true,
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            {
               user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
         )
      )
})

const logoutUser = asyncHandler(async(req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure: true,
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res)=> {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
   
   
      const user = await User.findById(decodedToken?._id)
      if (!user) {
         throw new ApiError(401, "Invalid refresh token")
      }
      if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
      }
      const options = {
   
         httpOnly: true,
         secure: true
      }
   
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
         new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
         )
      )
   
   
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
   }

})   

export { 
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
};
