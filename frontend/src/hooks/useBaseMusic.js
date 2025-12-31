import { useEffect, useRef, useState } from "react";

// Map keys to your Backend Endpoint
const MUSIC_REGISTRY = {
    "default_base": `${process.env.REACT_APP_API_URL}/music/default_base`,
    "editing": `${process.env.REACT_APP_API_URL}/music/sweet-life-luxury-chill-438146`, 
};

export default function useBaseMusic(trackKey, isEnabled = true) {
    const audioRef = useRef(new Audio());
    
    // Load saved volume (default 0.5)
    const savedVol = localStorage.getItem("game_volume");
    const [volume, setVolume] = useState(savedVol ? parseFloat(savedVol) : 0.5);
    const [isMuted, setIsMuted] = useState(false);

    // 1. Playback Logic
    useEffect(() => {
        const audio = audioRef.current;
        
        // Get URL from registry, default to default_base if missing
        const src = MUSIC_REGISTRY[trackKey] || MUSIC_REGISTRY["default_base"];

        if (!isEnabled) {
            audio.pause();
            return;
        }

        const playAudio = async () => {
            try {
                // Setup source if changed
                if (!audio.src.includes(src)) {
                    audio.src = src;
                    audio.loop = true;
                    audio.preload = "auto";
                }

                // Apply volume
                audio.volume = isMuted ? 0 : volume;

                // 🚀 OPTIMISTIC PLAY: Try to play immediately
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        // 🛑 Browser blocked it? Wait for interaction then try again.
                        console.warn("Autoplay blocked. Waiting for click...");
                        
                        const forcePlay = () => {
                            audio.play();
                            // Remove listener once we succeeded
                            window.removeEventListener('click', forcePlay);
                            window.removeEventListener('keydown', forcePlay);
                        };

                        window.addEventListener('click', forcePlay);
                        window.addEventListener('keydown', forcePlay);
                    });
                }
            } catch (err) {
                console.warn("Audio error:", err);
            }
        };

        playAudio();

        // Cleanup listeners on unmount/change to prevent memory leaks
        return () => {
            const cleanupAudio = () => {
               // We don't pause here to allow seamless transitions if you want
               // But we should clean up event listeners
            };
        };

    }, [trackKey, isEnabled]);

    // 2. Volume Logic (Independent Effect)
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = isMuted ? 0 : volume;
            localStorage.setItem("game_volume", volume);
        }
    }, [volume, isMuted]);

    // 3. Global Cleanup
    useEffect(() => {
        return () => {
            const audio = audioRef.current;
            audio.pause();
            audio.src = "";
        };
    }, []);

    return { 
        volume, 
        setVolume, 
        isMuted, 
        toggleMute: () => setIsMuted(prev => !prev) 
    };
}