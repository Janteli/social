import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataURI.js";
import cloudinary from "../utils/coudinary.js";
import { Post } from "../models/post.model.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.this.status(401).json({
        message: "Something is missing. Please check",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "Email already used",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "Account created Successfully",
      success: true,
      newUser,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing. Please check",
        success: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.this.status(201).json({
        message: "Incorrect email",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(201).json({
        message: "Wrong password",
        success: false,
      });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // populate each post if in the post array- without populating onlu post id is accessible - to access each and every details of post populate

    // without Promise.all we have to use await multiple times while mapping to user.posts coz each item is id stored in db - to avoid this using await only one time Promise.all

    const populatedPost = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post?.author?.equals(user._id)) {
          return post;
        }
        return null;
      })
    );

    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 100,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
        token,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    return res.status(201).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    //get logged in user info from authenticated cookie data - middleware is used for that
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    // console.log(profilePicture);

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();
    return res.status(200).json({
      message: "Profile updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedusers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedusers) {
      return res.status(401).json({
        message: "No suggested user",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedusers,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const ownerId = req.id;
    const toWhomOwnerFollowId = req.params.id;

    if (ownerId === toWhomOwnerFollowId) {
      return res.status(401).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(ownerId);
    const targetUser = await User.findById(toWhomOwnerFollowId);

    if (!user || !targetUser) {
      return res.status(401).json({
        message: "User not found for follow/unfollow action",
        success: false,
      });
    }

    const isFollowing = user.following.includes(toWhomOwnerFollowId);

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.updateOne(
          { _id: ownerId },
          { $pull: { following: toWhomOwnerFollowId } }
        ),
        User.updateOne(
          { _id: toWhomOwnerFollowId },
          { $pull: { followers: ownerId } }
        ),
      ]);

      return res.status(201).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // Follow
      await Promise.all([
        User.updateOne(
          { _id: ownerId },
          { $push: { following: toWhomOwnerFollowId } }
        ),
        User.updateOne(
          { _id: toWhomOwnerFollowId },
          { $push: { followers: ownerId } }
        ),
      ]);

      return res.status(201).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
    });
  }
};
