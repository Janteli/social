import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";


const useGetAllPost = () =>{
    const dispatch = useDispatch()
    useEffect(()=>{
        const fetchAllPost = async () => {
            try {
                const res = await axios.get('https://social-y2e0.onrender.com/api/v1/post/all', {withCredentials:true})

                // console.log(res.data);
                if(res.data.success){
                    // console.log('home',res.data);
                    dispatch(setPosts(res.data.posts))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost()
    },[dispatch]) 
};

export default useGetAllPost;