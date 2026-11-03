// High-Performance Real-Time Web Audio Granular Pitch Shifter
// Transposes any audio (MP3, WAV, OGG, M4A, FLAC, local or uploaded) in real-time by ±12 semitones

function safeMod(n: number, m: number): number {
  const r = n % m;
  return r < 0 ? r + m : r;
}

export class StereoPitchShifter {
  private grainSize: number;
  private halfGrain: number;
  private bufferLen: number;
  private ringBufL: Float32Array;
  private ringBufR: Float32Array;
  private writePos: number = 0;
  private readPos1: number = 0;
  private readPos2: number = 0;
  private phase: number = 0;
  private semitones: number = 0;
  private pitchRatio: number = 1.0;

  constructor(grainSize: number = 2048) {
    this.grainSize = grainSize;
    this.halfGrain = Math.floor(grainSize / 2);
    this.bufferLen = 16384;
    this.ringBufL = new Float32Array(this.bufferLen);
    this.ringBufR = new Float32Array(this.bufferLen);
    this.readPos1 = 0;
    this.readPos2 = this.halfGrain;
  }

  public setSemitones(n: number): void {
    this.semitones = Math.max(-12, Math.min(12, n));
    this.pitchRatio = Math.pow(2, this.semitones / 12);
  }

  public getSemitones(): number {
    return this.semitones;
  }

  public process(inpL: Float32Array, inpR: Float32Array, outL: Float32Array, outR: Float32Array): void {
    // 0 semitones bypass mode: 0 processing overhead, zero coloration
    if (this.semitones === 0) {
      outL.set(inpL);
      outR.set(inpR);
      return;
    }

    const len = inpL.length;
    const bufLen = this.bufferLen;
    const gSize = this.grainSize;
    const halfG = this.halfGrain;
    const ratio = this.pitchRatio;

    for (let i = 0; i < len; i++) {
      this.ringBufL[this.writePos] = inpL[i];
      this.ringBufR[this.writePos] = inpR[i];

      // Interpolated Read Head 1
      const p1 = Math.floor(this.readPos1);
      const idx1_0 = safeMod(p1, bufLen);
      const idx1_1 = safeMod(p1 + 1, bufLen);
      const frac1 = this.readPos1 - p1;
      const s1L = this.ringBufL[idx1_0] + frac1 * (this.ringBufL[idx1_1] - this.ringBufL[idx1_0]);
      const s1R = this.ringBufR[idx1_0] + frac1 * (this.ringBufR[idx1_1] - this.ringBufR[idx1_0]);

      // Interpolated Read Head 2
      const p2 = Math.floor(this.readPos2);
      const idx2_0 = safeMod(p2, bufLen);
      const idx2_1 = safeMod(p2 + 1, bufLen);
      const frac2 = this.readPos2 - p2;
      const s2L = this.ringBufL[idx2_0] + frac2 * (this.ringBufL[idx2_1] - this.ringBufL[idx2_0]);
      const s2R = this.ringBufR[idx2_0] + frac2 * (this.ringBufR[idx2_1] - this.ringBufR[idx2_0]);

      // Hann window crossfading between heads
      const grainPhase = this.phase % gSize;
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * grainPhase) / gSize));

      outL[i] = s1L * (1 - w) + s2L * w;
      outR[i] = s1R * (1 - w) + s2R * w;

      this.readPos1 += ratio;
      this.readPos2 += ratio;
      this.phase++;

      // When head completes window, reset to tail of ring buffer
      if (grainPhase === 0) {
        this.readPos1 = this.writePos - gSize;
      }
      if (grainPhase === halfG) {
        this.readPos2 = this.writePos - gSize;
      }

      this.writePos = (this.writePos + 1) % bufLen;
    }
  }

  public reset(): void {
    this.ringBufL.fill(0);
    this.ringBufR.fill(0);
    this.writePos = 0;
    this.readPos1 = 0;
    this.readPos2 = this.halfGrain;
    this.phase = 0;
  }
}

export class StudioAudioEngine {
  private audioCtx: AudioContext | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;
  private shifter: StereoPitchShifter = new StereoPitchShifter(2048);
  private currentSemitones: number = 0;
  private isHooked: boolean = false;

  public init(audioEl: HTMLAudioElement): void {
    if (this.attachedElement === audioEl && this.isHooked) {
      return;
    }
    this.attachedElement = audioEl;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }

    try {
      if (!this.mediaSource) {
        this.mediaSource = this.audioCtx.createMediaElementSource(audioEl);
      }
      if (!this.processorNode) {
        // 2048 buffer size gives ~46ms latency at 44.1kHz, ideal for real-time responsiveness
        this.processorNode = this.audioCtx.createScriptProcessor(2048, 2, 2);
        this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
          const inpL = e.inputBuffer.getChannelData(0);
          const inpR = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : inpL;
          const outL = e.outputBuffer.getChannelData(0);
          const outR = e.outputBuffer.getChannelData(1);
          this.shifter.process(inpL, inpR, outL, outR);
        };
      }
      if (!this.gainNode) {
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 1.0;
      }

      this.mediaSource.disconnect();
      this.mediaSource.connect(this.processorNode);
      this.processorNode.disconnect();
      this.processorNode.connect(this.gainNode);
      this.gainNode.disconnect();
      this.gainNode.connect(this.audioCtx.destination);
      this.isHooked = true;
    } catch (err) {
      console.warn('Pitch shifter node hook warning:', err);
    }
  }

  public setPitch(semitones: number): void {
    this.currentSemitones = semitones;
    this.shifter.setSemitones(semitones);
  }

  public getPitch(): number {
    return this.currentSemitones;
  }

  public async unlock(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume:', e);
      }
    }
  }

  public resetPitch(): void {
    this.setPitch(0);
    this.shifter.reset();
  }
}

export const studioAudioEngine = new StudioAudioEngine();
if (typeof window !== 'undefined') {
  (window as any).studioAudioEngine = studioAudioEngine;
}
