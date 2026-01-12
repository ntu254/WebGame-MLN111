// Simple synthesizer using Web Audio API for Sci-fi UI sounds
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    return audioCtx;
};

export const resumeAudio = () => {
    const ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
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

// BGM State
let bgmNodes: { osc: OscillatorNode, gain: GainNode }[] = [];
let bgmGain: GainNode | null = null;

export const startBGM = (type: 'ambient' | 'action' = 'ambient') => {
    const ctx = getContext();
    if (!ctx) return;
    if (bgmNodes.length > 0) return; // Already playing

    if (ctx.state === 'suspended') ctx.resume();

    // Master BGM Gain
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.05; // Low volume
    bgmGain.connect(ctx.destination);

    if (type === 'ambient') {
        // Space Drone: 3 Oscillators slightly detuned
        const freqs = [55, 110, 111]; // Low A
        freqs.forEach(f => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = f;

            // LFO for movement
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1 + Math.random() * 0.1; // Slow
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 5; // Modulate freq by +/- 5Hz
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            gain.gain.value = 0.3;

            osc.connect(gain);
            gain.connect(bgmGain!);
            osc.start();

            bgmNodes.push({ osc, gain }); // We track main osc to stop (LFOs will be GC'd or we should track them too? Ideally track all)
            // For simplicity in this lightweight version, we just track main oscs. 
            // Better: Track everything to stop clean.
            // Simplified for now assuming page reload clears context often or accept minor leak of LFOs if not stopped (actually LFOs stop when disconnected? No, need stop).
            // Let's track LFOs too by attaching to the object if we want perfection, but for "game jam" quality code:
            // Just putting stop logic on the context close or gain disconnect is often enough, but let's be cleaner.
            bgmNodes.push({ osc: lfo, gain: lfoGain });
        });

        // Add a "twinkle" randomizer?
        // Too complex for single function. Drone is enough.
    }
};

export const stopBGM = () => {
    bgmNodes.forEach(n => {
        try {
            n.osc.stop();
            n.osc.disconnect();
            n.gain.disconnect();
        } catch (e) {
            // Already stopped
        }
    });
    bgmNodes = [];
    if (bgmGain) {
        bgmGain.disconnect();
        bgmGain = null;
    }
};

export const playSound = (type: 'success' | 'error' | 'click' | 'alert' | 'build' | 'levelComplete' | 'attack') => {
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

        case 'attack':
            // Quick zap/hit
            playTone(200, 'sawtooth', 0.1, 0, 0.1);
            playTone(600, 'sawtooth', 0.1, 0.05, 0.1);
            break;
    }
};