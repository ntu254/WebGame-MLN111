import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// NOTE: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
    try {
        return new URL(url).protocol.startsWith('http');
    } catch {
        return false;
    }
}

const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export interface LeaderboardEntry {
    id: string;
    username: string;
    score: number;
    created_at: string;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    if (!supabase) {
        console.warn("Supabase not configured. Returning empty list.");
        return [];
    }

    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }

    return data as LeaderboardEntry[];
};

export const saveUserScore = async (username: string, score: number): Promise<boolean> => {
    if (!supabase) {
        console.warn("Supabase not configured. Cannot save score.");
        return false;
    }

    const { error } = await supabase
        .from('leaderboard')
        .insert([{ username, score }]);

    if (error) {
        console.error("Error saving score:", error);
        return false;
    }

    return true;
};

export const isSupabaseConfigured = () => !!supabase;