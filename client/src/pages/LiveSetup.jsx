import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radio, Type, AlignLeft, Users, Play, Crown } from 'lucide-react';
import { useSelector } from 'react-redux';

const LiveSetup = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userId } = useSelector(state => state.auth);
    const [activeSessions, setActiveSessions] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchLiveSessions = async () => {
            try {
                const res = await axios.get('http://localhost:8800/api/v1/live/active');
                setActiveSessions(res.data);
            } catch (error) {
                console.error("Error fetching live sessions:", error);
            } finally {
                setFetching(false);
            }
        };

        fetchLiveSessions();
        const interval = setInterval(fetchLiveSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8800/api/v1/live/start', formData, { withCredentials: true });
            navigate(`/live/${res.data.session._id}`);
        } catch (error) {
            console.error("Start live error:", error);
            alert(error.response?.data?.message || "Failed to start live session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-6">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-600/20 to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="mb-16">
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Live Podcasts</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">Discover real-time broadcasts or start your own studio session to connect with your audience instantly.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Side: Discovery */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                Happening Now
                            </h2>
                            <span className="text-slate-500 font-medium text-sm">{activeSessions.length} active sessions</span>
                        </div>

                        {fetching ? (
                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2].map(i => (
                                    <div key={i} className="bg-slate-900/50 border border-white/5 h-40 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : activeSessions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {activeSessions.map((session) => (
                                    <div
                                        key={session._id}
                                        onClick={() => navigate(`/live/${session._id}`)}
                                        className="group bg-slate-900 border border-white/5 hover:border-indigo-500/50 rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/20 transition-all"></div>

                                        <div className="relative flex items-start gap-5">
                                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                                <Radio className="w-10 h-10 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-rose-500 text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-md tracking-wider">Live</span>
                                                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {session.viewers} listening
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-indigo-400 transition-colors">{session.title}</h3>
                                                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{session.description}</p>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                                            <Users className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                        <span className="text-slate-300 text-xs font-semibold">@{session.host?.username || 'Creator'}</span>
                                                    </div>
                                                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                                                        <Play className="w-3 h-3 fill-white" /> Tune In
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-900/30 border border-dashed border-white/10 rounded-3xl py-20 text-center">
                                <Radio className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-500">No active broadcasts</h3>
                                <p className="text-slate-600 max-w-xs mx-auto mt-2">Check back later or be the first to start a conversation.</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        {isLoggedIn ? (
                            <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 sticky top-32 shadow-2xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                        <Crown className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Live Studio</h2>
                                        <p className="text-slate-500 text-sm font-medium">Ready to take the stage?</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Type className="w-3 h-3" /> Broadcast Title
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="What's on your mind?"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <AlignLeft className="w-3 h-3" /> Description
                                        </label>
                                        <textarea
                                            rows="4"
                                            placeholder="Tell listeners what to expect..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-medium"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-tighter ${loading ? 'opacity-70 animate-pulse' : ''}`}
                                    >
                                        {loading ? 'Preparing Studio...' : (
                                            <>
                                                <Radio className="w-5 h-5" /> Start Broadcast
                                            </>
                                        )}
                                    </button>
                                </form>
                                <p className="text-center text-slate-500 text-[10px] mt-6 font-medium leading-relaxed">
                                    Starting a broadcast makes it public. Please follow community guidelines.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-white/10 rounded-[32px] p-10 text-center sticky top-32">
                                <Crown className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-white mb-4">Start your own show</h2>
                                <p className="text-slate-400 mb-8">Login to access the Live Studio and start your own broadcast.</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all"
                                >
                                    Log In Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSetup;
