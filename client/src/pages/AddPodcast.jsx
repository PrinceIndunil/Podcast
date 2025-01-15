import React from "react";
import { useSelector } from "react-redux";
import InputPodcast from "../components/AddPodcast/InputPodcast";
import Error from "./Error";

const AddPodcast = () =>{
    const isLoggedIn = useSelector((state)=> state.auth.isLoggedIn ?? false);
    return(
        <div>
            {isLoggedIn ? <InputPodcast/> : <Error/>}
        </div>
    )
};
export default AddPodcast;