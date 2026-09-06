// WebAudio synthesis — no audio files needed.
// All sounds are generated programmatically using oscillators.

let audioContext: AudioContext | null = null;
let muted = false;

export function unlock() {
  if (audioContext) {
    if (audioContext.state === "suspended") audioContext.resume();
    return;
  }
  try {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
  } catch {
    audioContext = null;
  }
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  vol: number = 0.09,
  delay: number = 0
) {
  if (muted || !audioContext) return;
  try {
    const t0 = audioContext.currentTime + delay;
    const o = audioContext.createOscillator();
    const g = audioContext.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(audioContext.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  } catch {
    // Silently ignore audio errors
  }
}

export const SND = {
  tick: (i?: number) => tone(560 + (i || 0) * 14, 0.075, "sine", 0.055),
  soft: () => {
    tone(523.25, 0.1, "sine", 0.07);
    tone(784, 0.1, "sine", 0.035, 0.03);
  },
  chime: () => {
    tone(1046.5, 0.16, "sine", 0.09);
    tone(1318.5, 0.16, "sine", 0.08, 0.085);
    tone(1568, 0.3, "sine", 0.075, 0.17);
  },
  win: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, 0.34, "sine", 0.085, i * 0.1)
    );
  },
  look: () => {
    tone(440, 0.16, "triangle", 0.05);
    tone(392, 0.22, "triangle", 0.045, 0.13);
  },
  tap: () => tone(680, 0.05, "sine", 0.04),
};
