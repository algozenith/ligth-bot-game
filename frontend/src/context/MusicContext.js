import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import useBaseMusic from "../hooks/useBaseMusic";
import { useAuth } from "./AuthContext";

const MusicContext = createContext();

const API_URL = process.env.REACT_APP_API_URL;

export function MusicProvider({ children }) {
  const { token, isAuth } = useAuth();
  
  // Default to 'default_base' initially
  const [musicTrack, setMusicTrack] = useState("default_base");

  // Initialize the audio hook with the current track
  const musicControls = useBaseMusic(musicTrack);

  // Sync music preference with User Auth state
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    async function fetchUserMusic() {
      // 1. If Logged In: Fetch User Preference
      if (token && isAuth) {
        try {
          const res = await fetch(`${API_URL}/user/base`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            // Only update if component is mounted and we have a track
            if (isMounted && data?.level?.music) {
              setMusicTrack(data.level.music);
            }
          }
        } catch (err) {
          console.warn("Global Music: Failed to fetch preference", err);
        }
      } 
      // 2. If Guest / Logged Out: Reset to Default
      else {
        setMusicTrack("default_base");
      }
    }

    fetchUserMusic();

    return () => { isMounted = false; };
  }, [token, isAuth]);

  // 3. Optimize Context Value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...musicControls,
    musicTrack,
    setMusicTrack
  }), [musicControls, musicTrack]);

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);