import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // Fixed typo in 'bcypt'

const userSchema = new mongoose.Schema( // Fixed typo here
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: { // Fixed typo: 'avtar' to 'avatar'
            type: String, // Cloudinary URL
            required: true,
        },
        coverImage: {
            type: String, // Cloudinary URL
        },
        watchHistory: [ // Fixed typo: 'watchHistroy' to 'watchHistory'
            {
                type: mongoose.Schema.Types.ObjectId, // Fixed 'Schema' to 'mongoose.Schema'
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to hash the password before saving it to the database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10); // Fixed typo: 'bcypt' to 'bcrypt'
    next();
});

// Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Corrected typo in environment variable name
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
