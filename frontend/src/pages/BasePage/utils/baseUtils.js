export const API_URL = process.env.REACT_APP_API_URL;

export const UNLOCK_LEVELS = {
    ICE: 5,
    ELEVATOR: 10,
    TELEPORT: 15
};

export const MUSIC_OPTIONS = [
    { key: "default_base", label: "Default Theme" },
    { key: "editing", label: "Relaxed Vibe" },
    { key: "cyber_theme_01", label: "Cyberpunk" },
    { key: "ice_theme", label: "Ice World" },
    { key: "lava_theme", label: "Lava Core" }
];

export const normalizePrograms = (data) => {
    if (!data) return { main: Array(12).fill(null), m1: Array(8).fill(null), m2: Array(8).fill(null) };
    return {
        main: data.main || Array(12).fill(null),
        m1: data.m1 || data.p1 || Array(8).fill(null),
        m2: data.m2 || data.p2 || Array(8).fill(null)
    };
};

export const fixLevelData = (data) => {
    if (!data) return null;
    const size = data.gridSize || 6;
    return {
        ...data,
        id: data.id || 999, 
        gridSize: size,
        goals: data.goals || [],
        iceTiles: Array.isArray(data.iceTiles) ? data.iceTiles : [],
        elevatorMeta: data.elevatorMeta || {},
        teleportLinks: data.teleportLinks || {},
        heights: Array.isArray(data.heights) 
            ? data.heights 
            : Array(size).fill().map(() => Array(size).fill(0)),
        start: data.start || { x: 0, y: 0, dir: 0 },
        music: data.music || "default_base" 
    };
};