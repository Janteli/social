import { AvatarFallback } from "@radix-ui/react-avatar";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "./ui/avatar";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store?.auth);

  console.log(suggestedUsers);
  
  return (
    <div className="my-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer my-2">See All</span>
      </div>
      {suggestedUsers.map((user) => {
        return (
          <div key={user._id} className="flex items-center justify-between my-5">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt="Img" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex flex-col items-start">
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}> {user?.username} </Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {user?.bio || "Bio here..."}
                </span>
              </div>
            </div>
            <span className="text-[#3badf8] text-sm font-bold cursor-pointer hover:text-[#185177]"> Follow </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
