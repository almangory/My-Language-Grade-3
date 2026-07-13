// Native Web Audio Synthesizer for child-friendly sound feedback
export function playSound(type: 'success' | 'failure' | 'click' | 'star' | 'read') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'success') {
      // Ascending arpeggio (C5 -> E5 -> G5 -> C6) for correct answers
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.3);
      });
    } else if (type === 'failure') {
      // Slightly sad double tone (G#3 -> F3)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.25); // D3
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'star') {
      // High-pitched bright magic chime
      const freqs = [880, 1174, 1567, 1975];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        
        gain.gain.setValueAtTime(0.15, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.15);
      });
    } else if (type === 'click') {
      // Short woodblock tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'read') {
      // Soft gentle indicator note
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (error) {
    console.warn('Audio feedback failed or was blocked by browser policies.', error);
  }
}

// Simple confetti physics simulation helper for correct answers
export interface ConfettiItem {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  scaleX: number;
}

export function generateConfetti(): ConfettiItem[] {
  const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#fb923c'];
  return Array.from({ length: 100 }).map((_, idx) => ({
    id: `confetti-${idx}-${Math.random()}`,
    x: Math.random() * 100, // percentage
    y: -10 - Math.random() * 30, // starting above screen
    size: 6 + Math.random() * 12,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    scaleX: 0.5 + Math.random() * 0.5
  }));
}
