import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// NOTE: Ensure process.env.SUPABASE_URL and process.env.SUPABASE_ANON_KEY are set
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
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