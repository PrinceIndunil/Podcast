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
            const res = await axios.post("http://localhost:8800/api/v1/logout", null, {
                withCredentials: true,
            });
            //console.log(res);
            dispatch(authActions.logout());
            navigate("/");
        } catch (err) {
            console.error("Error during logout:", err);
        }
    };

    if (loading) return <p className="text-center text-zinc-300">Loading...</p>;

    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        userData && (
            <div className="bg-green-900 rounded py-8 flex flex-col md:flex-row items-center justify-center gap-4 md:justify-between px-4 lg:px-12">
                <div className="flex flex-col items-center md:items-start">
                    <p className="text-zinc-300">{userData.username}</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl text-zinc-100 font-bold text-center">
                        Hello Welcome
                    </h1>
                    <p className="text-zinc-300 mt-1">{userData.email}</p>
                </div>
                <div>
                    <button
                        className="bg-white px-4 py-2 rounded text-zinc-800 font-semibold hover:shadow-xl transition-all duration-300"
                        onClick={LogOutHandler}
                    >
                        LogOut
                    </button>
                </div>
            </div>
        )
    );
};

export default Header;
