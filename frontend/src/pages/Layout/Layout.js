import React from "react";
import { useMusic } from "../../context/MusicContext";

// 🎵 The Persistent Audio Widget
const AudioWidget = () => {
  const { volume, setVolume, isMuted, toggleMute } = useMusic();
  
  return (
    <div className="audio-widget" style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 10000 }}>
      <button className="btn-audio-mute" onClick={toggleMute}>
        {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
      </button>
      <div className="volume-slider-container">
        <input 
          type="range" min="0" max="1" step="0.05" 
          value={isMuted ? 0 : volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))} 
          className="volume-slider" 
        />
      </div>
    </div>
  );
};

export default function GlobalLayout({ children }) {
  return (
    <>
      <AudioWidget />
      <main>{children}</main>
    </>
  );
}