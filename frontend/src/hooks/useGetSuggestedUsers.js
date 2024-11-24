import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "@/redux/authSlice";


const useGetSuggestedUsers = () =>{
    const dispatch = useDispatch()
    useEffect(()=>{
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/user/suggested`, {withCredentials:true})

                // console.log(res.data);
                
                // console.log(res.data);
                if(res.data.success){
                    // console.log('home',res.data);
                    dispatch(setSuggestedUsers(res.data.users))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSuggestedUsers()
    },[dispatch]) 
};

export default useGetSuggestedUsers;