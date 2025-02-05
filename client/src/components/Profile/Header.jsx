import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { authActions } from "../../store/auth";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const res = await axios.get("http://localhost:8800/api/v1/user-details", {
                    withCredentials: true,
                });
                setUserData(res.data.user);
            } catch (err) {
                console.error("Error fetching user details:", err);
                setError("Failed to load user details.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
    }, []);

    const LogOutHandler = async () => {
        try {
            await axios.post("http://localhost:8800/api/v1/logout", null, {
                withCredentials: true,
            });
            dispatch(authActions.logout());
            navigate("/");
        } catch (err) {
            console.error("Error during logout:", err);
        }
    };

    if (loading)
        return <p className="text-center text-gray-500 animate-pulse">Loading...</p>;

    if (error)
        return <p className="text-center text-red-500">{error}</p>;

    return (
        userData && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg py-8 flex flex-col md:flex-row items-center justify-between gap-6 px-6 lg:px-16 shadow-2xl">
                <div className="text-center md:text-left">
                    <p className="text-gray-200 text-sm mb-1 tracking-wide">
                        Welcome back,
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                        {userData.username}
                    </h1>
                    <p className="text-gray-300 mt-2 text-sm">{userData.email}</p>
                </div>
                <div>
                    <button
                        className="bg-white text-indigo-600 px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-gray-100 transition-transform duration-300 ease-in-out transform hover:scale-105"
                        onClick={LogOutHandler}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        )
    );
};

export default Header;
