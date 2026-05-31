"use client"
import { setUserData } from "@/redux/userSlice"
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function UseGetMe(){
  const dispatch = useDispatch()
  useEffect(()=>{
    const getMe = async ()=>{
      try {
        const response = await axios.get("/api/me")
        dispatch(setUserData(response.data))
      } catch (error) {
        console.log(error)
      }
    }
    getMe()
  },[])
}