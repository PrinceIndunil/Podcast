import React from "react";
import { useSelector } from "react-redux";
import Header from "../components/Profile/Header";
import Error from "./Error";
import MyPodcast from "../components/Profile/MyPodcast";

const Profile = () => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn ?? false);

    if (!isLoggedIn) {
        return <Error />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-20 pb-12">
                <MyPodcast />
            </main>
        </div>
    );
};

export default Profile;

