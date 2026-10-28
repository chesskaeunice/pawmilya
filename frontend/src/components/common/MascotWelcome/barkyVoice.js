// Barky's bark, made with the Web Audio API (no audio files needed).
let ctx = null;

function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A small "woof!": a buzzy tone that drops in pitch.
export function woof() {
  const a = audio();
  if (!a) return;

  const t = a.currentTime;
  const osc = a.createOscillator();
  const filter = a.createBiquadFilter();
  const gain = a.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.18);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + 0.18);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

  osc.connect(filter).connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.22);
}

// Plays Barky's recorded voice and reports how loud it is every frame, so
// his mouth can open and close with the sound. Returns a function that stops it.
export function playVoice(src, { onFrame, onEnd }) {
  const a = audio();
  const el = new Audio(src);
  let raf = 0;

  if (a) {
    const analyser = a.createAnalyser();
    analyser.fftSize = 512;
    a.createMediaElementSource(el).connect(analyser);
    analyser.connect(a.destination);

    const data = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (const value of data) {
        const d = (value - 128) / 128;
        sum += d * d;
      }

      onFrame(Math.sqrt(sum / data.length), el.currentTime / (el.duration || 1));
      raf = requestAnimationFrame(tick);
    };

    tick();
  }

  el.onended = () => {
    cancelAnimationFrame(raf);
    onEnd();
  };

  el.play().catch(() => {
    cancelAnimationFrame(raf);
    onEnd();
  });

  return () => {
    cancelAnimationFrame(raf);
    el.onended = null;
    el.pause();
  };
}
