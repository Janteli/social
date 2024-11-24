import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// for chatting
export const sendMessage = async (req, res) =>{
    try {
        const senderId = req.id; // loggedIn
        const receiverId = req.params.id;
        const {textMessage: message} = req.body;

        let conversation = await Conversation.findOne({participants:{$all:[senderId, receiverId]}});

        // establish conversation if not started
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        if(newMessage) conversation.messages.push(newMessage._id);
        // Promise.all because handlin two docs simultaneously
        await Promise.all([conversation.save(), newMessage.save()]);
        // if no Promise.all is used- in which first conversation gets saved first ;ater mewMessage
        // await conversation.save()
        // await newMessage.save()
        // implement socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(201).json({
            newMessage,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
};

export const getMessage = async (req, res) =>{
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        }).populate('messages');

        if(!conversation) return res.status(200).json({messages:[],
            sucess: true
        });

        return res.status(200).json({
            messages:conversation?.messages,
            sucess:true
        });
    } catch (error) {
        console.log(error);
    }
}