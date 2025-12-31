import { useState, useCallback, useEffect, useMemo } from "react";
import { API_URL, fixLevelData } from "../utils/baseUtils";

export const useBaseManager = (token, navigate, logout) => {
    const [baseSnapshot, setBaseSnapshot] = useState(null); 
    const [userProfile, setUserProfile] = useState(null); 
    const [drafts, setDrafts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const authFetch = useCallback(async (endpoint, options = {}) => {
        if (!token) return null;
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) { logout(); navigate("/login"); return null; }
            return res;
        } catch (err) { return null; }
    }, [token, logout, navigate]);

    const loadCoreData = useCallback(async () => {
        setLoading(true);
        const [baseRes, profileRes] = await Promise.all([
            authFetch("/user/base"),
            authFetch("/user/profile")
        ]);

        if (baseRes?.ok) {
            const snapshot = await baseRes.json();
            if (snapshot?.level) {
                setBaseSnapshot({
                    level: fixLevelData(snapshot.level),
                    programs: snapshot.programs || null
                });
            }
        }

        if (profileRes?.ok) {
            // ✅ FIX: Use backend data directly. 
            // The backend now sends { level, exp, expToNextLevel, ... }
            const profileData = await profileRes.json();
            setUserProfile(profileData);
        }
        
        setLoading(false);
    }, [authFetch]);

    const loadDrafts = useCallback(async () => {
        const res = await authFetch("/user/base/drafts");
        if (res && res.ok) { setDrafts((await res.json()).reverse()); return true; }
        return false;
    }, [authFetch]);

    const loadHistory = useCallback(async () => {
        const res = await authFetch("/user/base/history");
        if (res && res.ok) { setHistory((await res.json()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))); return true; }
        return false;
    }, [authFetch]);

    const updateHistoryName = useCallback(async (id, newName) => {
        const res = await authFetch(`/user/base/history/${id}/name`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
        if (res && res.ok) {
            setHistory(prev => prev.map(entry => entry.id === id ? { ...entry, level: { ...entry.level, name: newName } } : entry));
            return true;
        }
        return false;
    }, [authFetch]);

    const saveDraft = useCallback(async (snapshot) => {
        const res = await authFetch("/user/base/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(snapshot) });
        return res && res.ok;
    }, [authFetch]);

    const deleteDraft = useCallback(async (id) => {
        const res = await authFetch(`/user/base/draft/${id}`, { method: "DELETE" });
        if (res && res.ok) { setDrafts(prev => prev.filter(d => d.id !== id)); return true; }
        return false;
    }, [authFetch]);

    const deployBase = useCallback(async (level, programs) => {
        const res = await authFetch("/user/base/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level, programs }) });
        return res ? await res.json() : { detail: "Network Error" };
    }, [authFetch]);

    const restoreHistory = useCallback(async (id) => {
        const res = await authFetch(`/user/base/restore/${id}`, { method: "POST" });
        if (res && res.ok) return { success: true, data: await res.json() };
        return { success: false };
    }, [authFetch]);

    useEffect(() => { loadCoreData(); }, [loadCoreData]);

    return useMemo(() => ({
        baseSnapshot, setBaseSnapshot, 
        userProfile, 
        loading, 
        drafts, loadDrafts, saveDraft, deleteDraft, 
        history, loadHistory, restoreHistory, deployBase, updateHistoryName
    }), [baseSnapshot, userProfile, loading, drafts, history, loadDrafts, loadHistory, saveDraft, deleteDraft, restoreHistory, deployBase, updateHistoryName]);
};