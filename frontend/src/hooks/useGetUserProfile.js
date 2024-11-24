import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {  setUserProfile } from "@/redux/authSlice";


const useGetUserProfile = (userId) =>{
    const dispatch = useDispatch()
    // const [userProfile, setUserProfile] = useState(null)
    useEffect(()=>{
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`https://social-y2e0.onrender.com/api/v1/user/${userId}/profile`,{withCredentials:true})

                // console.log(res.data);
                
                // console.log(res.data);
                if(res.data.success){
                    // console.log('home',res.data);
                    dispatch(setUserProfile(res.data.user))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile()
    },[dispatch, userId]) 
};

export default useGetUserProfile;