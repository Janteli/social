import { setAuthUser } from "@/redux/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import axios from "axios";
import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  SearchX,
  TrendingUp,
} from "lucide-react";

const sidebarItems = [
  {
    icon: <Home />,
    text: "Home",
  },
  {
    icon: <SearchX />,
    text: "Search",
  },
  {
    icon: <TrendingUp />,
    text: "Explore",
  },
  {
    icon: <MessageCircle />,
    text: "Messages",
  },
  {
    icon: <Heart />,
    text: "Notifications",
  },
  {
    icon: <PlusSquare />,
    text: "Create",
  },
  {
    icon: (
      <Avatar className="w-6 h-6 border rounded-full flex items-center justify-center">
        <AvatarImage
          className="border rounded-full h-6 w-6"
          src="https://github.com/shadcn.png"
          alt="@shadcn"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
    text: "Profile",
  },
  {
    icon: <LogOut />,
    text: "Logout",
  },
];
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const {likeNotification} = useSelector(store => store.realTimeNotification)
  const sidebarItems = [
    {
      icon: <Home />,
      text: "Home",
    },
    {
      icon: <SearchX />,
      text: "Search",
    },
    {
      icon: <TrendingUp />,
      text: "Explore",
    },
    {
      icon: <MessageCircle />,
      text: "Messages",
    },
    {
      icon: <Heart />,
      text: "Notifications",
    },
    {
      icon: <PlusSquare />,
      text: "Create",
    },
    {
      icon: (
        <Avatar className="w-6 h-6 border rounded-full flex items-center justify-center">
          <AvatarImage
            className="border rounded-full h-6 w-6"
            src={user?.profilePicture}
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut />,
      text: "Logout",
    },
  ];
  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://social-y2e0.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });

      // console.log(res.data.success);

      if (res?.data?.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null))
        dispatch(setPosts([]))
        navigate("/login");
        toast.success(res?.data?.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if(textType === 'Create'){
      setOpen(true)
    } else if(textType === 'Profile'){
      navigate(`profile/${user?._id}`)
    } else if (textType === 'Home'){
      navigate('/')
    } else if (textType === 'Messages') {
      navigate("/chat")
    }
  };
  return (
    <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen ">
      <div className="flex flex-col ">
        <div className="md:justify-center md:border"> 
        <h1 className="my-6 pl-3 font-bold text-xl ">Teacher's Media</h1>

        </div>
        <div>
          {sidebarItems.map((item, idx) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={idx}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                <div className="h-[30px] w-[30px] border rounded-full">
                  {item.icon}
                </div>
                <span>{item.text}</span>
                {
                  item.text ==='Notifications' && likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                          <Button size='icon' className='rounded-full h-5 w-5 absolute lef-6 bottom-6 bg-red-600 hover:bg-red-600'> {likeNotification.length} </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {
                            likeNotification.length === 0 ? ( <p>No new notification</p>) : (likeNotification.map((notification)=> {
                              return (
                                <div keys = {notification.userId} className="flex items-center gap-2 my-2">
                                  <Avatar>
                                    <AvatarImage srr={notification?.userDetaile?.profilePicture} alt='profile'/>
                                  </Avatar>
                                  <AvatarFallback>CN</AvatarFallback>
                                  <p className="text-sm"> <span className="font-bold"> {notification?.userDetaile?.username}  </span>Liked your post</p>
                                </div>
                              )
                            }))
                          }
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen}/>
    </div>
  );
};

export default LeftSidebar;
