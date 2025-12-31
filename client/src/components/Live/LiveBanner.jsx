import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Radio, Users, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveBanner = () => {
    const [activeSessions, setActiveSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLiveSessions = async () => {
            try {
                const res = await axios.get('http://localhost:8800/api/v1/live/active');
                setActiveSessions(res.data);
            } catch (error) {
                console.error("Error fetching live sessions:", error);
            }
        };

        fetchLiveSessions();
        const interval = setInterval(fetchLiveSessions, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (activeSessions.length === 0) return null;

    return (
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 p-[2px]">
            <div className="bg-slate-900 rounded-[22px] p-6 text-white relative overflow-hidden">
                {/* Decorative background circles */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
                                <Radio className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute -top-2 -right-2 bg-white text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-rose-100">
                                LIVE
                            </span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Happening Now</h2>
                            <p className="text-slate-400 text-sm font-medium">Join the live conversation with creators</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 flex-1 justify-center md:justify-end">
                        {activeSessions.map((session) => (
                            <div
                                key={session._id}
                                onClick={() => navigate(`/live/${session._id}`)}
                                className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Play className="w-5 h-5 text-white" />
                                </div>
                                <div className="max-w-[150px]">
                                    <p className="font-bold text-sm truncate">{session.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-medium text-indigo-400">{session.host?.username}</span>
                                        <span className="text-[10px] flex items-center gap-1 text-slate-400">
                                            <Users className="w-3 h-3" /> {session.viewers}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveBanner;
