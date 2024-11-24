import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessages from "@/hooks/useGetAllMessages";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUSer }) => {
  useGetRTM()
  useGetAllMessages()
  const { messages } = useSelector((store) => store.chat);
  const {user} = useSelector(store=> store.auth)

    // console.log('yo ho ta',messages);
    
  return (
    <div className="overflow-y-auto flex-1 p-4 ">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUSer?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span> {selectedUSer?.username} </span>
          <Link to={`/profile/${selectedUSer?._id}`}>
            <Button className="h-8 my-2" variant="secondary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {messages && messages?.map((msg) => {
          return (
            <div className={`flex ${msg.senderId === user?._id ? 'justify-end': 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-xs break-words ${msg?.senderId === user?._id ? 'bg-blue-500 text-white': 'bg-gray-200 text-black'}`}>{msg?.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
