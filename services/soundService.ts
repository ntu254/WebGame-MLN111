// Simple synthesizer using Web Audio API for Sci-fi UI sounds
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    return audioCtx;
};

// Helper to play a tone
const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
};

export const playSound = (type: 'success' | 'error' | 'click' | 'alert' | 'build' | 'levelComplete') => {
    const ctx = getContext();
    if (!ctx) return;

    switch (type) {
        case 'success':
            // Ascending major chime
            playTone(523.25, 'sine', 0.1, 0);       // C5
            playTone(659.25, 'sine', 0.1, 0.1);     // E5
            playTone(783.99, 'sine', 0.3, 0.2);     // G5
            break;
        
        case 'error':
            // Low buzz/descending
            playTone(150, 'sawtooth', 0.2, 0, 0.1);
            playTone(100, 'sawtooth', 0.3, 0.1, 0.1);
            break;

        case 'click':
            // High tech blip
            playTone(1200, 'sine', 0.05, 0, 0.05);
            break;

        case 'build':
            // Mechanical thud
            playTone(100, 'square', 0.1, 0, 0.1);
            playTone(200, 'square', 0.2, 0.05, 0.05);
            break;

        case 'alert':
            // Siren-like
            playTone(880, 'triangle', 0.2, 0, 0.1);
            playTone(440, 'triangle', 0.2, 0.2, 0.1);
            playTone(880, 'triangle', 0.2, 0.4, 0.1);
            break;

        case 'levelComplete':
            // Fanfare
            playTone(523.25, 'square', 0.1, 0, 0.1); // C
            playTone(523.25, 'square', 0.1, 0.1, 0.1); // C
            playTone(523.25, 'square', 0.1, 0.2, 0.1); // C
            playTone(659.25, 'square', 0.4, 0.3, 0.1); // E
            playTone(783.99, 'square', 0.6, 0.4, 0.1); // G
            break;
    }
};