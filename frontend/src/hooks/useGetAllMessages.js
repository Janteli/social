import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { setMessages } from "@/redux/chatSlice";


const useGetAllMessages = () =>{
    const dispatch = useDispatch()
    const {selectedUSer} = useSelector(store=> store.auth)
    useEffect(()=>{
        const fetchAllMessages = async () => {
            try {
                const res = await axios.get(`https://social-y2e0.onrender.com/api/v1/message/all/${selectedUSer?._id}`, {withCredentials:true})

                // console.log(res.data);
                if(res.data.success){
                    // console.log('home',res.data);
                    dispatch(setMessages(res.data.messages))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllMessages()
    },[selectedUSer,dispatch]) 
};

export default useGetAllMessages;