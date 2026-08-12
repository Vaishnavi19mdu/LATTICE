let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtor =
      window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtor();
  }
  return audioCtx;
}

/**
 * Plays a synthesized siren wail for `durationMs` milliseconds.
 * Returns a stop() function you can call to cut it off early.
 *
 * No external audio file — this generates the tone directly via
 * Web Audio oscillator + gain nodes, so there's nothing to host
 * or bundle.
 */
export function playSirenSound(durationMs: number): () => void {
  const ctx = getAudioContext();

  // Browsers block audio until the page has had some user interaction.
  // Clicking "START EMERGENCY SIMULATION" earlier counts as that
  // interaction, so this resume() should succeed silently.
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      /* ignore — will simply stay silent if browser still blocks it */
    });
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  const durationSec = durationMs / 1000;

  // Fade in quickly to avoid a harsh click
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);

  // Classic siren wail: frequency sweeps up and down repeatedly
  const cycleDuration = 1; // seconds per up/down sweep
  const numCycles = Math.ceil(durationSec / cycleDuration);
  for (let i = 0; i < numCycles; i++) {
    const cycleStart = now + i * cycleDuration;
    oscillator.frequency.setValueAtTime(600, cycleStart);
    oscillator.frequency.linearRampToValueAtTime(1200, cycleStart + cycleDuration / 2);
    oscillator.frequency.linearRampToValueAtTime(600, cycleStart + cycleDuration);
  }

  // Fade out at the very end so it doesn't cut off abruptly
  const fadeOutStart = Math.max(now, now + durationSec - 0.15);
  gainNode.gain.setValueAtTime(0.3, fadeOutStart);
  gainNode.gain.linearRampToValueAtTime(0, now + durationSec);

  oscillator.start(now);
  oscillator.stop(now + durationSec);

  return () => {
    try {
      oscillator.stop();
    } catch {
      /* already stopped */
    }
  };
}