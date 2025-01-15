import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Profile/Header";
import Error from "./Error";
import MyPodcast from "../components/Profile/MyPodcast";

const Profile = () => {
    const isLoggedIn = useSelector((state)=> state.auth.isLoggedIn ?? false);
    return (
        <div>
            {isLoggedIn ? <>
            <Header/>
            <MyPodcast/>
            </>: <Error/>}
        </div>
    )
}

export default Profile