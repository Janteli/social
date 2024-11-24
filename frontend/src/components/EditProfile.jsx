import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

function EditProfile() {
  const { user } = useSelector((store) => store.auth);
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender
  })
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) =>{
    const file = e.target.files?.[0];
    if(file) setInput({...input, profilePhoto:file});
  }

  const selectHandler = (value)=>{
    setInput({...input, gender: value })
  }

  const editProfileHandler = async () => {
    console.log(input);
    const formData = new FormData();
    formData.append('bio', input.bio);
    formData.append('gender', input.gender);
    if(input.profilePhoto) {
        formData.append('profilePhoto', input.profilePhoto)
    }
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/v1/user/profile/edit', formData, {
        headers:{
            'Content-Type':'multipart/form-data',
        },
        withCredentials:true
      })
      if(res.data.success) {
        const updatedUserData = {
            ...user,
            bio: res.data.user.bio,
            profilePicture: res.data.user?.profilePicture,
            gender: res.data.user?.gender
        } 
        dispatch(setAuthUser(updatedUserData))
        toast.success(res.data.message);
        navigate(`/profile/${user?._id}`)
      }
      
    } catch (error) {
      console.log(error.message);
      toast.error(error.response.data.message)
    } finally {
        setLoading(false)
    }
  };
  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="Img" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start">
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>
          <input onChange={fileChangeHandler} ref={imageRef} type="file" className="hidden" />
          <Button
            onClick={() => {
              imageRef.current.click();
            }}
            className="bg-[#0095F6] h-8 hover:bg-[#0c91e9]"
          >
            Change Photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2"> Bio </h1>
          <Textarea value={input.bio} onChange={(e)=>setInput({...input, bio:e.target.value})} name="bio" className="focus-visible:ring-transparent" />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select defaultValue={input?.gender} onValueChange={selectHandler}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#074269] hover: bg-[#1077bd]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button onClick={editProfileHandler} className="w-fit bg-[#074269] hover: bg-[#1077bd]">
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default EditProfile;