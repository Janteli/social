import { Dialog, DialogHeader } from "./ui/dialog";
import React, { useRef, useState } from "react";
import { DialogContent } from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileDataUrl } from "@/lib/utils";
import { AlignStartVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import store from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { setPosts } from "@/redux/postSlice";


const CreatePost = ({ open, setOpen }) => {
    const [file, setFile] = useState("");
    const [caption, setCaption ] = useState("");
    const [imagePreview, setImagePreview] = useState("") 
    const [loading, setLoading] = useState("")
    const {posts} = useSelector(store=> store?.post)
    const imageRef = useRef()
    const dispatch = useDispatch()
    const {user} = useSelector(store=>store.auth)

    const fileChangeHandler =async (e) =>{
        const file = e.target.files[0];
        if(file){
            setFile(file);
            const dataUrl = await readFileDataUrl(file);
            setImagePreview(dataUrl);
        }
    } 

  const createPostHandler = async (e) => {
    e.preventDefault();
    // console.log(file, caption);
    const formData = new FormData();
    formData.append("caption", caption);
    if(imagePreview) formData.append("image", file)
    try {
        setLoading(true)
        const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
            headers: {
                'Content-Type': "multipart/form-data"
            },
            withCredentials: true
        });

      console.log('create-outside ',res?.data?.message);
        console.log('boolean', res?.data?.success);
        

        if(res?.data?.success){
            dispatch(setPosts([ res?.data?.post, ...posts, ]))
            toast.success(res.data.message);
      console.log('create inside',res?.data?.message);

            setOpen(false)
        }
        
    } catch (error) {
        toast.error(error?.response?.data?.message)
    } finally{
        setLoading(false)
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <span className="text-center font-semibold">Create New Post</span>
        </DialogHeader>
        <div className="flex gap-3 items-center"> 
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="profileImage"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
           <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Bio here...</span>
           </div>
        </div>
        <Textarea value={caption} onChange = {(e)=> setCaption(e.target.value)} className="focus-visible:ring-transparent border-none" placeholder="Write a caption..."/>

        {
            imagePreview && (
                <div className="w-full h-64 flex items-center justify-center">
                    <img src={imagePreview} alt="" className="object-cover h-full w-full rounded"/>
                </div>
            )
        }

        <input ref={imageRef} type="file" className="hidden" onChange={fileChangeHandler}/>
        <Button onClick ={()=> imageRef.current.click()} className="w-fit mx-auto bg-[#0095F6] hover:bg-[#08293f]">Select image from computer</Button>
        {
            imagePreview && (loading ? (<Button> <Loader2 className="mr-2 h-4 2-4 animate-spin"/> Please Wait...  </Button>) : ( <Button onClick={createPostHandler} type="sumit" className="w-full">Post</Button> ))
        }
        
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
