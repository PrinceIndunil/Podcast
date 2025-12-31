import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
    Mic, MicOff, Users, MessageSquare, Send,
    X, Radio, Volume2, ShieldCheck, LogOut
} from 'lucide-react';
import { useSelector } from 'react-redux';

const socket = io('http://localhost:8800');

const LiveRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, username, isLoggedIn } = useSelector(state => state.auth);

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(true);

    // Agora Refs
    const client = useRef(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
    const localAudioTrack = useRef(null);
    const joined = useRef(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    useEffect(() => {
        const joinSession = async () => {
            if (joined.current) return;
            try {

                const res = await axios.post(`http://localhost:8800/api/v1/live/join/${id}`);
                setSession(res.data.session);

                const currentIsHost = res.data.session.host === userId;
                setIsHost(currentIsHost);

                // Agora Setup
                const appId = res.data.appId;
                const token = res.data.agoraToken;
                const channel = res.data.session.agoraChannel;

                // Check connection state to avoid "already connecting" errors
                if (client.current.connectionState === 'DISCONNECTED' && !joined.current) {
                    joined.current = true;
                    await client.current.join(appId, channel, token, null);

                    if (currentIsHost) {
                        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
                        await client.current.publish([localAudioTrack.current]);

                        // Start Recording for Host
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            mediaRecorder.current = new MediaRecorder(stream);
                            audioChunks.current = [];

                            mediaRecorder.current.ondataavailable = (event) => {
                                if (event.data.size > 0) audioChunks.current.push(event.data);
                            };

                            mediaRecorder.current.start();
                            console.log("Recording started...");
                        } catch (recErr) {
                            console.error("Recording start error:", recErr);
                        }
                    } else {
                        client.current.on('user-published', async (user, mediaType) => {
                            await client.current.subscribe(user, mediaType);
                            if (mediaType === 'audio') {
                                user.audioTrack.play();
                            }
                        });
                    }
                }

                // Socket Setup
                socket.emit("join_live", id);
                socket.on("receive_message", (msg) => {
                    setMessages(prev => [...prev, msg]);
                });

                setLoading(false);
            } catch (error) {
                console.error("Join room error:", error);
                joined.current = false;
                navigate('/live');
            }
        };

        if (id && userId) joinSession();

        return () => {
            const leave = async () => {
                if (localAudioTrack.current) {
                    localAudioTrack.current.close();
                    localAudioTrack.current = null;
                }
                if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
                    mediaRecorder.current.stop();
                }
                if (client.current.connectionState !== 'DISCONNECTED') {
                    await client.current.leave();
                }
                joined.current = false;
                socket.off("receive_message");
            };
            leave();
        };
    }, [id, userId, navigate]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isLoggedIn) return;

        const msgData = {
            sessionId: id,
            message: newMessage,
            username: username || "Guest",
            userId: userId
        };

        socket.emit("send_message", msgData);
        setNewMessage("");
    };

    const toggleMute = async () => {
        if (!isHost || !localAudioTrack.current) return;
        setIsMuted(!isMuted);
        await localAudioTrack.current.setEnabled(isMuted);
    };

    const endSession = async () => {
        if (!window.confirm("End this live session?")) return;

        try {
            let audioFile = null;

            if (isHost && mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
                await new Promise((resolve) => {
                    mediaRecorder.current.onstop = () => {
                        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                        audioFile = new File([audioBlob], `live_${id}.webm`, { type: 'audio/webm' });
                        resolve();
                    };
                    mediaRecorder.current.stop();
                });
            }

            const formData = new FormData();
            if (audioFile) {
                formData.append('audioFile', audioFile);
            }

            await axios.post(`http://localhost:8800/api/v1/live/end/${id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/all-podcasts');
        } catch (error) {
            console.error("End session error:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Entering Audio Room...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row">
            {/* Main Stage */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Visualizer Background */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="flex items-center justify-center h-full gap-2">
                        {Array(20).fill(0).map((_, i) => (
                            <div
                                key={i}
                                className="bg-indigo-500 w-3 rounded-full transition-all duration-200"
                                style={{
                                    height: isMuted ? '5%' : `${Math.random() * 60 + 10}%`,
                                    opacity: isMuted ? 0.3 : 1
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-center max-w-2xl w-full">
                    <div className="inline-flex items-center gap-2 bg-rose-500 px-4 py-1.5 rounded-full mb-8 shadow-lg shadow-rose-500/20 animate-pulse">
                        <Radio className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-tighter">Live Session</span>
                    </div>

                    <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        {session?.title}
                    </h1>
                    <p className="text-slate-400 text-lg mb-12 line-clamp-2 italic font-light">
                        "{session?.description}"
                    </p>

                    <div className="flex items-center justify-center gap-12">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 mx-auto group-hover:border-indigo-500 transition-colors">
                                <Users className="w-10 h-10 text-indigo-400" />
                            </div>
                            <p className="text-3xl font-black">{session?.viewers}</p>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Listeners</p>
                        </div>
                    </div>
                </div>

                {/* Host Controls */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                    {isHost ? (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                            </button>
                            <button
                                onClick={endSession}
                                className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-rose-500/20 border border-white/10 flex items-center justify-center transition-all group"
                            >
                                <LogOut className="w-8 h-8 text-rose-500 group-hover:text-white" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold backdrop-blur-md transition-all flex items-center gap-3"
                        >
                            <X className="w-5 h-5" /> Leave Room
                        </button>
                    )}
                </div>
            </div>

            {/* Side Chat */}
            <div className="w-full lg:w-[400px] bg-slate-900 border-l border-white/5 flex flex-col h-[500px] lg:h-auto">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Live Chat</h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`animate-in slide-in-from-bottom-2 duration-300 ${msg.userId === userId ? 'ml-8' : 'mr-8'}`}>
                            <div className={`p-3 rounded-2xl ${msg.userId === userId ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-tighter mb-1">
                                    {msg.username} {msg.userId === session?.host && '⭐ HOST'}
                                </p>
                                <p className="text-sm">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-8">
                            <MessageSquare className="w-12 h-12 mb-4" />
                            <p className="text-sm italic">Welcome to the live chat! Be the first to say hello.</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="p-6 bg-slate-900 border-t border-white/5">
                    <div className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isLoggedIn ? "Say something..." : "Login to chat..."}
                            disabled={!isLoggedIn}
                            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !isLoggedIn}
                            className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LiveRoom;
