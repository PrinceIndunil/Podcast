import React, { useRef, useEffect, useState } from "react";
import { IoPlaySkipBackSharp, IoPlaySkipForwardSharp } from "react-icons/io5";
import { FaPause, FaPlay } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { playerActions } from "../../store/player";

const AudioPlayer = () => {
    const [isSongPlaying, setIsSongPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const dispatch = useDispatch();
    const PlayerDivState = useSelector((state) => state.player.isPlayerDiv);
    const songPath = useSelector((state) => state.player.songPath);
    const img = useSelector((state) => state.player.img);

    const audioRef = useRef();

    // Close audio player
    const closeAudioPlayerDiv = (e) => {
        e.preventDefault();
        dispatch(playerActions.closeDiv());
        dispatch(playerActions.changeImage(" "));
        dispatch(playerActions.changeSong(" "));
        setIsSongPlaying(false);
        setCurrentTime(0);
    };

    // Play/Pause Podcast
    const handlePlayPodcast = () => {
        if (!audioRef.current) return;
        if (isSongPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsSongPlaying(!isSongPlaying);
    };

    // Handle audio time update
    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    // Handle metadata loaded
    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    // Seek audio
    const handleSeek = (e) => {
        const newTime = (e.target.value / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Skip forward and backward
    const handleSkip = (direction) => {
        if (!audioRef.current) return;
        const newTime = audioRef.current.currentTime + direction;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Auto-play when songPath changes
    useEffect(() => {
        if (songPath) {
            setIsSongPlaying(true);
            if (audioRef.current) {
                audioRef.current.play();
            }
        }
    }, [songPath]);

    return (
        <div className={`${PlayerDivState ? "fixed" : "hidden"} fixed bottom-0 left-0 w-full bg-zinc-900 text-zinc-300 px-4 rounded py-4 flex items-center gap-4`}>
            {/* Song Thumbnail */}
            <div className="hidden md:block w-1/3">
                <img src={img} alt="Song" className="size-12 rounded-full object-cover" />
            </div>

            {/* Controls */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-center gap-4 text-xl">
                    <button onClick={() => handleSkip(-10)}>
                        <IoPlaySkipBackSharp />
                    </button>
                    <button onClick={handlePlayPodcast}>
                        {isSongPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={() => handleSkip(10)}>
                        <IoPlaySkipForwardSharp />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center justify-center mt-3">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={duration ? (currentTime / duration) * 100 : 0} 
                        onChange={handleSeek} 
                        className="w-full hover:cursor-pointer" 
                    />
                </div>

                {/* Timestamps */}
                <div className="w-full flex items-center justify-between text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Close Button */}
            <div className="w-1/3 flex items-center justify-end">
                <button onClick={closeAudioPlayerDiv}>
                    <ImCross />
                </button>
            </div>

            {/* Audio Element */}
            <audio 
                ref={audioRef} 
                src={songPath} 
                onTimeUpdate={handleTimeUpdate} 
                onLoadedMetadata={handleLoadedMetadata} 
            />
        </div>
    );
};

// Format time helper function
const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default AudioPlayer;
