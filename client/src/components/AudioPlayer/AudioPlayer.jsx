import React, { useRef, useEffect, useState } from "react";
import { IoPlaySkipBackSharp, IoPlaySkipForwardSharp } from "react-icons/io5";
import { FaPause, FaPlay, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { playerActions } from "../../store/player";

const AudioPlayer = () => {
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const dispatch = useDispatch();
  const PlayerDivState = useSelector((state) => state.player.isPlayerDiv);
  const songPath = useSelector((state) => state.player.songPath);
  const img = useSelector((state) => state.player.img);
  const userId = useSelector((state) => state.auth.userId);
  const title = useSelector((state) => state.player.title) || "Unknown Track";
  const artist = useSelector((state) => state.player.artist) || "Unknown Artist";

  const audioRef = useRef();
  const progressRef = useRef();

  const closeAudioPlayerDiv = () => {
    dispatch(playerActions.closeDiv());
    dispatch(playerActions.changeImage(" "));
    dispatch(playerActions.changeSong(" "));
    setIsSongPlaying(false);
    setCurrentTime(0);
    if (songPath && songPath !== " ") {
      saveLastPlayed(songPath, currentTime);
    }
  };

  const handlePlayPodcast = () => {
    if (!audioRef.current) return;
    if (isSongPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            savePlayEvent(songPath);
          })
          .catch(error => {
            // Auto-play was prevented
            console.error("Playback error:", error);
          });
      }
    }
    setIsSongPlaying(!isSongPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    setCurrentTime(current);
    if (Math.floor(current) % 10 === 0) {
      saveProgress(songPath, current);
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const progressRect = progressRef.current.getBoundingClientRect();
    const seekPos = (e.clientX - progressRect.left) / progressRect.width;
    const newTime = seekPos * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRangeSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (secs) => {
    const newTime = Math.min(duration, Math.max(0, audioRef.current.currentTime + secs));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      if (audioRef.current) audioRef.current.volume = prevVolume;
    } else {
      setPrevVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleBuffering = () => {
    setIsBuffering(true);
  };

  const handleCanPlay = () => {
    setIsBuffering(false);
  };

  const handleEnded = () => {
    setIsSongPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !songPath) return;
      
      try {
        const res = await fetch(`/api/progress/${userId}/${encodeURIComponent(songPath)}`);
        if (!res.ok) throw new Error('Failed to fetch progress');
        
        const data = await res.json();
        if (data.currentTime && audioRef.current) {
          audioRef.current.currentTime = data.currentTime;
          setCurrentTime(data.currentTime);
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };

    if (songPath && songPath !== " " && audioRef.current) {
      fetchProgress();
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => {
          setIsSongPlaying(true);
          savePlayEvent(songPath);
        })
        .catch(error => {
          console.error("Auto-play failed:", error);
          setIsSongPlaying(false);
        });
    }
  }, [songPath, userId]);

  if (!PlayerDivState) return null;

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`fixed z-50 bottom-0 left-0 right-0 ${
        isExpanded ? "h-96 sm:h-80" : "h-auto"
      } bg-gradient-to-r from-indigo-800 to-purple-900 text-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-in-out`}
    >
      {/* Top controls */}
      <div className="absolute top-3 right-3 flex space-x-3">
        <button 
          onClick={toggleExpanded} 
          className="text-white/70 hover:text-white transition p-1.5 bg-white/10 rounded-full hover:bg-white/20"
          aria-label={isExpanded ? "Minimize player" : "Expand player"}
        >
          {isExpanded ? 
            <RiFullscreenExitFill className="w-5 h-5" /> : 
            <RiFullscreenFill className="w-5 h-5" />
          }
        </button>
        <button 
          onClick={closeAudioPlayerDiv} 
          className="text-white/70 hover:text-white transition p-1.5 bg-white/10 rounded-full hover:bg-white/20"
          aria-label="Close player"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className={`w-full h-full flex ${
        isExpanded ? "flex-col items-center pt-12 pb-6" : "flex-row items-center py-4"
      } px-4 gap-4`}>
        
        {/* Album art */}
        <div className={`${
          isExpanded ? "w-48 h-48" : "w-16 h-16 sm:w-20 sm:h-20"
        } flex-shrink-0 rounded-lg overflow-hidden shadow-lg transition-all duration-300`}>
          <img 
            src={img || "https://via.placeholder.com/200"} 
            alt="Album art" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Player controls and info */}
        <div className={`flex-1 flex flex-col ${
          isExpanded ? "items-center justify-center text-center w-full" : "w-full"
        }`}>
          {/* Track info */}
          <div className={`${isExpanded ? "mb-6" : "mb-1"} max-w-full`}>
            <p className={`${
              isExpanded ? "text-xl font-bold" : "text-sm font-semibold"
            } truncate`}>
              {title}
            </p>
            {(artist && artist !== " ") && (
              <p className="text-white/70 text-sm truncate">{artist}</p>
            )}
          </div>
          
          {/* Progress bar for expanded view */}
          {isExpanded && (
            <div 
              ref={progressRef}
              className="w-full max-w-lg h-2 bg-white/20 rounded-full mb-2 cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="absolute h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
          
          {/* Time display for expanded view */}
          {isExpanded && (
            <div className="w-full max-w-lg flex justify-between text-xs text-white/70 mb-6">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}
          
          {/* Player controls */}
          <div className={`flex items-center justify-${isExpanded ? "center" : "start"} space-x-4 ${isExpanded ? "text-2xl" : "text-xl"}`}>
            <button 
              onClick={() => handleSkip(-10)} 
              className="hover:text-white/90 transition"
              aria-label="Skip backward 10 seconds"
            >
              <IoPlaySkipBackSharp />
            </button>
            
            <button 
              onClick={handlePlayPodcast}
              className={`${
                isExpanded ? "w-14 h-14" : "w-10 h-10"
              } bg-white text-purple-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition relative`}
              aria-label={isSongPlaying ? "Pause" : "Play"}
              disabled={isBuffering}
            >
              {isBuffering ? (
                <div className="w-5 h-5 border-2 border-purple-800 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isSongPlaying ? <FaPause className={isExpanded ? "text-xl" : ""} /> : <FaPlay className={`${isExpanded ? "text-xl" : ""} ml-0.5`} />
              )}
            </button>
            
            <button 
              onClick={() => handleSkip(10)} 
              className="hover:text-white/90 transition"
              aria-label="Skip forward 10 seconds"
            >
              <IoPlaySkipForwardSharp />
            </button>
          </div>
          
          {/* Progress bar for collapsed view */}
          {!isExpanded && (
            <div className="w-full mt-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progressPercentage} 
                onChange={handleRangeSeek} 
                className="w-full h-1 accent-purple-400 cursor-pointer" 
                aria-label="Seek"
              />
            </div>
          )}
        </div>
        
        {/* Volume controls */}
        <div className={`${
          isExpanded ? "flex" : "hidden sm:flex"
        } items-center space-x-2`}>
          <button 
            onClick={toggleMute} 
            className="hover:text-white/90 transition"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange} 
            className="w-24 accent-purple-400 cursor-pointer" 
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={songPath} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleBuffering}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
      />
    </div>
  );
};

// Helper function to format time
const formatTime = (time) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// Function to save play event to API
const savePlayEvent = async (songPath) => {
  if (!songPath || songPath === " ") return;
  
  const userId = window.store?.getState()?.auth?.userId;
  if (!userId) return;
  
  try {
    await fetch("/api/play-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId, 
        songPath, 
        timestamp: new Date().toISOString() 
      })
    });
  } catch (error) {
    console.error("Failed to save play event:", error);
  }
};

// Function to save progress to API
const saveProgress = async (songPath, currentTime) => {
  if (!songPath || songPath === " ") return;
  
  const userId = window.store?.getState()?.auth?.userId;
  if (!userId) return;
  
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, songPath, currentTime })
    });
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
};

// Function to save last played to API
const saveLastPlayed = async (songPath, currentTime) => {
  if (!songPath || songPath === " ") return;
  
  const userId = window.store?.getState()?.auth?.userId;
  if (!userId) return;
  
  try {
    await fetch("/api/last-played", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, songPath, currentTime })
    });
  } catch (error) {
    console.error("Failed to save last played:", error);
  }
};

export default AudioPlayer;