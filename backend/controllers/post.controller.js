import sharp from "sharp";
import cloudinary from "../utils/coudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import {Comment} from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) =>{
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image){
            return res.status(401).json({
                message: 'Image is required',
            })
        }

        // image upload
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width:800, height:800, fit: 'inside'})
        .toFormat('jpg', {quality:80})
        .toBuffer()

        // new method to convert to datauri
        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`

        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author:authorId
        })

        // pushing each post created by this particular user to post array of User model created as field
        const user = await User.findById(authorId);

        if(user) {
            user.posts.push(post._id);
            await user.save()
        }

        // auhor is field declared inside  Post model
        await post.populate({path: 'author', select: '-password'});

        return res.status(201).json({
            message: 'New post added.',
            post,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
};

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1})
        .populate({path:'author', select:'username profilePicture,'})
        .populate({
            path:'comments', 
            options: { sort: { createdAt: -1 } },
            populate:{
                path:'author', 
                select:'username profilePicture'
            }
        })
        
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const getUserPost = async (req, res) =>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author: authorId})
        .sort({createdAt:-1})
        .populate({
            path:'author',
            select:'username, profilePicture'
        })
        .populate({
            path:'comments', 
            sort: 'createdAt:-1'
            .populate({
                path:'author', 
                select:'username, profilePicture'
            })
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async (req, res) =>{
    try {
        const userIdWhoLikes = req.id; //user logged in
        const postId = req.params.id;
        console.log("liker", userIdWhoLikes);
        
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({
            message: 'Post not found',
            scuccess: false
        });

        // like logic 
        // $addToSet only unique value likes is array and id is kept withn it
        await post.updateOne({$addToSet:{likes:userIdWhoLikes}});
        await post.save();

        // post.likes.push(userIdWhoLikes) if this is done then same user can like multipli times

        // implementing socket.io for real time notification
        const user = await User.findById(userIdWhoLikes).select('username profilePicture')
        const postOwnerId = post?.author?.toString()
        if(postOwnerId !== userIdWhoLikes){
            //emit  notification
            const notification = {
                type:'like',
                userId: userIdWhoLikes,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification) 
        }

        return res.status(200).json({
            message: 'Post liked',
            post,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const disLikePost = async (req, res) =>{
    try {
        const userIdWhoLikes = req.id; //user logged in
        const postId = req.params.id;

        console.log('hello',userIdWhoLikes)

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({
            message: 'Post not found',
            scuccess: false
        });

        // like logic 
        // $addToSet only unique value likes is array and id is kept withn it
        await post.updateOne({$pull:{likes:userIdWhoLikes}});
        await post.save();

        // post.likes.push(userIdWhoLikes) if this is done then same user can like multipli times

        // implementing socket.io for real time notification
        const user = await User.findById(userIdWhoLikes).select('username profilePicture')
        const postOwnerId = post?.author?.toString()
        if(postOwnerId !== userIdWhoLikes){
            //emit  notification
            const notification = {
                type:'dislike',
                userId: userIdWhoLikes,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification) 
        }

        return res.status(200).json({
            message: 'Post disliked',
            post,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};

export const addComment = async (req, res) =>{
    try {
        const postId = req.params.id;
        const idWhoComments = req.id;  //user who logged in

        const {text} = req.body;

        const post = await Post.findById(postId);
        if(!text) return res.status(400).json({message: 'text is required',
            success: false
        });

        const comment = await Comment.create({
            text,
            author:idWhoComments,
            post:postId
        })
        // .populate({
        // //     path: 'author',
        // //     select: 'username, profilePicture'
        // // });

        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        })

        post.comments.push(comment._id);

        await post.save();

        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: 'true'
        })

    } catch (error) {
        console.log(error);
    }
};

export const getCommentsOfPost = async (req, res) =>{
    try {
        const postId = req.params.id;
        
        const comments = await Comment.find({post: postId}).populate('author', 'username', 'profilePicture');

        if(!comments) return res.status(404).json({
            message: ' Coments not found for this post',
            success: false
        })

        return res.status(200).json({
            comments,
            success: true
        })
    } catch (error) {
        console.log(error);
        
    }
};

export const deletePost = async (req, res) =>{
    try {
        const postId = req.params.id;
        const authorId = req.id;

        console.log(postId);
        

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message: 'Post not found',
            success: false
        })

        // check wether the user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({
            message: 'Unauthorized to delete.',
        })

        await Post.findByIdAndDelete(postId);
        // remove the post id from user - post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id=> id.toString() !== postId);
        await user.save();

        // delete associated comments- when post is deleted all comments done in this particular post
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success: true,
            message: 'Post deleted with messages'
        });

    } catch (error) {
        console.log(error);
        
    }
};

export const bookmarkPost = async (req, res) =>{
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);

        if(!post) return res.status(404).json({
            message: 'Post not found',
            success: fall
        });

        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked- then remove from bookmark array
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                type:'unsaved',
                message: 'Removed from bookmark',
                success:true
            })
        }else {
            // book mark - push to bookmarks array
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({
                type:'nsaved',
                message: 'bookmark saved.',
                success:true
            })
        }
    } catch (error) {
        console.log(error);
    }
};


