# Real-Time Pitch Detection and Audio Feedback Application
## Comprehensive Implementation Plan

---

## Project Overview

**Goal:** Create a web application that detects flute pitch in real-time and generates corresponding piano notes for tuning reference.

**Key Requirements:**
- Real-time pitch detection from microphone input
- Instant piano note synthesis at detected frequency
- Low latency (<50ms) audio processing
- Continuous audio output during sustained notes
- React-based user interface
- Web Audio API for all audio operations

---

## 1. Project Setup and Environment Configuration

### 1.1 Development Environment Selection

**Recommended: Vite over Create React App**
- **Rationale:** Vite offers faster hot module replacement (HMR), critical for iterative audio development
- **Build Performance:** 10-100x faster cold starts compared to CRA
- **Modern Tooling:** Native ESM support, optimized for modern browsers
- **Bundle Size:** Better tree-shaking and code splitting

**Alternative:** Create React App (if team familiarity is priority)

### 1.2 Project Initialization Steps

**Phase 1: Scaffold React Application**
1. Initialize Vite project with React template
2. Configure TypeScript (optional but recommended for Web Audio API type safety)
3. Set up ESLint and Prettier for code consistency
4. Configure IntelliJ IDEA to recognize project structure

**Phase 2: IntelliJ IDEA Configuration**
1. Enable JavaScript/TypeScript language support
2. Configure Node.js interpreter
3. Set up run configurations for development server
4. Install recommended plugins:
   - React snippets
   - ESLint integration
   - Prettier integration
   - GitToolBox (for version control)

**Phase 3: Dependency Planning**
- **Core Dependencies:** React, React-DOM
- **Audio Processing:** No external libraries needed (Web Audio API is native)
- **Development Tools:** Vite, ESLint, Prettier
- **Optional Enhancements:** 
  - Chart.js or D3.js for waveform visualization
  - Tailwind CSS or Material-UI for UI components

### 1.3 Project Structure Design

```
pitch-correction/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AudioController.jsx       # Main audio orchestration
│   │   ├── PitchDetector.jsx         # Pitch detection logic
│   │   ├── PianoSynthesizer.jsx      # Audio synthesis
│   │   ├── FrequencyDisplay.jsx      # Visual feedback
│   │   └── ControlPanel.jsx          # User controls
│   ├── utils/
│   │   ├── audioContext.js           # Shared audio context
│   │   ├── pitchDetection.js         # Detection algorithms
│   │   ├── noteMapping.js            # Frequency to note conversion
│   │   └── audioWorklets/
│   │       └── pitchProcessor.js     # Audio worklet for processing
│   ├── hooks/
│   │   ├── useAudioInput.js          # Microphone access hook
│   │   ├── usePitchDetection.js      # Pitch detection hook
│   │   └── useAudioSynthesis.js      # Synthesis hook
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### 1.4 Browser Compatibility Considerations

**Target Browsers:**
- Chrome/Edge 89+ (best Web Audio API support)
- Firefox 88+
- Safari 14.1+ (requires user gesture for AudioContext)

**Critical Compatibility Notes:**
- AudioWorklet support required (no fallback to ScriptProcessorNode)
- HTTPS required for microphone access (except localhost)
- Mobile browsers have additional latency challenges

---

## 2. Audio Input Capture and Processing Pipeline

### 2.1 Microphone Access Strategy

**Phase 1: Permission Handling**
- Request microphone access via `navigator.mediaDevices.getUserMedia()`
- Implement graceful error handling for:
  - Permission denied
  - No microphone available
  - Browser incompatibility
- Provide clear user feedback during permission request

**Phase 2: Audio Context Initialization**
- Create single shared AudioContext instance (avoid multiple contexts)
- Handle AudioContext state management (suspended/running)
- Implement user gesture requirement for Safari/iOS
- Set optimal sample rate (48000 Hz recommended for modern browsers)

**Phase 3: Input Stream Configuration**
- Configure MediaStreamConstraints:
  - `echoCancellation: false` (preserve musical content)
  - `noiseSuppression: false` (avoid pitch artifacts)
  - `autoGainControl: false` (maintain dynamic range)
  - `sampleRate: 48000` (if supported)

### 2.2 Audio Processing Pipeline Architecture

**Signal Flow:**
```
Microphone → MediaStream → MediaStreamSource → AnalyserNode → AudioWorklet
                                                      ↓
                                              Pitch Detection
                                                      ↓
                                              Frequency Output
                                                      ↓
                                              Piano Synthesis
                                                      ↓
                                              AudioDestination (Speakers)
```

**Key Components:**

1. **MediaStreamSource Node**
   - Converts microphone MediaStream to Web Audio API node
   - No processing, just routing

2. **AnalyserNode**
   - Provides time-domain data for pitch detection
   - Configure FFT size: 2048-4096 samples (balance between resolution and latency)
   - Smoothing time constant: 0 (no smoothing for real-time)

3. **AudioWorklet (Pitch Processor)**
   - Runs pitch detection in separate thread (avoids main thread blocking)
   - Processes audio in 128-sample chunks (default)
   - Sends detected frequency to main thread via messaging

### 2.3 Latency Considerations

**Sources of Latency:**
- Input buffering: ~3-10ms (browser-dependent)
- Processing time: ~5-15ms (algorithm-dependent)
- Output buffering: ~3-10ms
- **Total Expected:** 11-35ms (well under 50ms target)

**Optimization Strategies:**
- Use AudioWorklet instead of ScriptProcessorNode (lower latency)
- Minimize FFT size while maintaining accuracy
- Avoid unnecessary audio graph connections
- Use `AudioContext.baseLatency` to measure system latency

---

## 3. Pitch Detection Algorithm Implementation

### 3.1 Algorithm Selection

**Option 1: Autocorrelation (Recommended for Simplicity)**
- **Principle:** Finds periodicity by correlating signal with delayed version of itself
- **Pros:** Simple to implement, computationally efficient, good for monophonic sources
- **Cons:** Can struggle with noisy signals or complex harmonics
- **Best For:** Clean flute input in controlled environment

**Option 2: YIN Algorithm (Recommended for Accuracy)**
- **Principle:** Enhanced autocorrelation with difference function and cumulative mean normalization
- **Pros:** More accurate, better harmonic rejection, handles noisy signals
- **Cons:** Slightly more complex, marginally higher CPU usage
- **Best For:** Production-quality pitch detection

**Option 3: FFT-based Detection**
- **Principle:** Analyzes frequency spectrum to find fundamental
- **Pros:** Good for understanding harmonic content
- **Cons:** Lower time resolution, more complex peak detection
- **Best For:** Visualization alongside pitch detection

### 3.2 Autocorrelation Implementation Strategy

**High-Level Algorithm:**

1. **Input Preparation**
   - Obtain time-domain samples from AnalyserNode (Float32Array)
   - Apply windowing function (Hamming or Hann) to reduce edge effects
   - Typical buffer size: 2048-4096 samples

2. **Autocorrelation Calculation**
   ```
   For each lag τ from 0 to maxLag:
       correlation[τ] = Σ(signal[i] × signal[i + τ])
   ```
   - maxLag determined by minimum frequency (e.g., 80 Hz for flute)
   - Normalize correlation values

3. **Peak Detection**
   - Find first peak after initial decline (ignore τ=0)
   - Peak represents period of fundamental frequency
   - Implement threshold to ignore noise (e.g., correlation > 0.5)

4. **Frequency Calculation**
   ```
   frequency = sampleRate / peakLag
   ```

5. **Smoothing and Validation**
   - Apply median filter over last 3-5 detections
   - Reject outliers (sudden large jumps)
   - Implement confidence threshold

### 3.3 YIN Algorithm Enhancement

**Key Improvements over Basic Autocorrelation:**

1. **Difference Function**
   ```
   d[τ] = Σ((signal[i] - signal[i + τ])²)
   ```

2. **Cumulative Mean Normalized Difference**
   ```
   d'[τ] = d[τ] / ((1/τ) × Σ(d[j]) for j=1 to τ)
   ```

3. **Absolute Threshold**
   - Find first τ where d'[τ] < threshold (typically 0.1-0.15)
   - Provides better harmonic rejection

4. **Parabolic Interpolation**
   - Refine peak location for sub-sample accuracy
   - Improves frequency precision

### 3.4 Frequency Range Considerations

**Flute Range:**
- Lowest note: C4 (~262 Hz)
- Highest note: D7 (~2349 Hz)
- **Detection Range:** 200-2500 Hz (with margin)

**Buffer Size Calculation:**
- Minimum period at 2500 Hz: ~19 samples at 48kHz
- Maximum period at 200 Hz: ~240 samples at 48kHz
- **Recommended Buffer:** 2048 samples (covers range with resolution)

---

## 4. Piano Note Synthesis and Playback

### 4.1 Synthesis Architecture

**Approach: Additive Synthesis with Envelope Shaping**
- More realistic than pure sine wave
- Computationally efficient
- Controllable timbre

**Alternative Approaches:**
- **Sample Playback:** More realistic but requires audio files and complex pitch shifting
- **Physical Modeling:** Most realistic but computationally expensive
- **FM Synthesis:** Complex timbre but harder to control

### 4.2 Oscillator Configuration

**Multi-Oscillator Setup:**

1. **Fundamental Oscillator**
   - Type: Sine wave
   - Frequency: Detected pitch
   - Gain: 1.0 (reference level)

2. **Harmonic Oscillators (Piano-like Timbre)**
   - 2nd harmonic: frequency × 2, gain × 0.5
   - 3rd harmonic: frequency × 3, gain × 0.25
   - 4th harmonic: frequency × 4, gain × 0.125
   - 5th harmonic: frequency × 5, gain × 0.0625

3. **Mixing**
   - Sum all oscillators through GainNode
   - Apply master volume control
   - Connect to AudioDestination

### 4.3 Envelope Shaping (ADSR)

**Attack-Decay-Sustain-Release Envelope:**

1. **Attack Phase (20-50ms)**
   - Rapid gain increase from 0 to peak
   - Simulates piano hammer strike
   - Use `gainNode.gain.linearRampToValueAtTime()`

2. **Decay Phase (100-200ms)**
   - Slight decrease to sustain level
   - Adds realism to piano tone
   - Sustain level: ~0.7-0.8 of peak

3. **Sustain Phase (continuous)**
   - Maintain constant level while note detected
   - No time limit (follows input)

4. **Release Phase (200-500ms)**
   - Gradual fade when note stops
   - Prevents clicks and pops
   - Use `gainNode.gain.exponentialRampToValueAtTime()`

### 4.4 Continuous Playback Strategy

**Challenge:** Smoothly update frequency without restarting oscillators

**Solution 1: Frequency Ramping**
```
oscillator.frequency.setTargetAtTime(newFrequency, audioContext.currentTime, 0.01)
```
- Smooth transition between frequencies
- Time constant: 10ms (balance between smoothness and responsiveness)

**Solution 2: Crossfading Oscillators**
- Start new oscillator at new frequency
- Fade out old oscillator
- Fade in new oscillator
- More CPU intensive but smoother for large jumps

**Recommended:** Frequency ramping for small changes (<50 cents), crossfading for large jumps

### 4.5 Feedback Loop Prevention

**Critical Issue:** Synthesized piano note could be picked up by microphone

**Prevention Strategies:**

1. **Frequency Gating**
   - Only synthesize if detected frequency is stable for 50-100ms
   - Prevents feedback from synthesized output

2. **Amplitude Threshold**
   - Only trigger synthesis if input amplitude exceeds threshold
   - Ignores weak feedback signals

3. **User Controls**
   - Volume control for synthesized output
   - Mute button for quick disable
   - Headphone recommendation in UI

4. **Signal Analysis**
   - Monitor for sudden amplitude increases
   - Detect feedback patterns (rapid frequency oscillation)
   - Auto-mute if feedback detected

---

## 5. Real-time Audio Processing Optimization

### 5.1 AudioWorklet Implementation

**Why AudioWorklet:**
- Runs in separate high-priority thread
- Guaranteed 128-sample processing blocks
- Lower latency than ScriptProcessorNode
- No main thread blocking

**Worklet Structure:**

1. **Processor Class**
   - Extends AudioWorkletProcessor
   - Implements `process()` method
   - Receives 128-sample chunks at audio rate

2. **Main Thread Communication**
   - Use `port.postMessage()` to send frequency data
   - Minimize message frequency (every 2-3 processing blocks)
   - Use transferable objects for large data

3. **Registration**
   - Load worklet module via `audioContext.audioWorklet.addModule()`
   - Create AudioWorkletNode in main thread
   - Connect to audio graph

### 5.2 Performance Optimization Techniques

**1. Algorithm Optimization**
- Pre-allocate buffers (avoid garbage collection)
- Use typed arrays (Float32Array) for numerical operations
- Implement early exit conditions in loops
- Cache frequently used calculations

**2. Processing Rate Reduction**
- Don't run pitch detection every audio callback
- Process every 2-4 callbacks (still <20ms update rate)
- Use circular buffer to accumulate samples

**3. Computational Shortcuts**
- Downsample audio for pitch detection (e.g., 48kHz → 12kHz)
- Reduce autocorrelation lag range based on expected frequency
- Use integer operations where possible

**4. Memory Management**
- Reuse buffers instead of creating new ones
- Avoid closures in hot paths
- Use object pooling for frequently created objects

### 5.3 Latency Measurement and Monitoring

**Measurement Strategy:**

1. **System Latency**
   ```javascript
   const latency = audioContext.baseLatency + audioContext.outputLatency;
   ```

2. **Processing Latency**
   - Timestamp when audio received
   - Timestamp when synthesis triggered
   - Calculate difference

3. **End-to-End Testing**
   - Use loopback cable (output to input)
   - Measure time from input to output
   - Target: <50ms total

**Monitoring Dashboard:**
- Display current latency in UI
- Show processing time per block
- Alert if latency exceeds threshold

### 5.4 Buffer Size Tuning

**Trade-offs:**
- **Smaller Buffers:** Lower latency, higher CPU usage, potential glitches
- **Larger Buffers:** Higher latency, lower CPU usage, more stable

**Recommended Approach:**
- Start with default (128 samples)
- Monitor CPU usage and audio glitches
- Adjust if necessary (browser-dependent)
- Provide user setting for advanced users

---

## 6. User Interface Design and Implementation

### 6.1 Component Architecture

**Main Components:**

1. **AudioController (Container)**
   - Manages audio context lifecycle
   - Coordinates pitch detection and synthesis
   - Handles state management

2. **ControlPanel**
   - Start/Stop button
   - Volume slider
   - Sensitivity adjustment
   - Mute toggle

3. **FrequencyDisplay**
   - Current detected frequency (Hz)
   - Nearest note name (e.g., "A4")
   - Cents deviation from perfect pitch
   - Visual tuner (needle or bar)

4. **WaveformVisualizer (Optional)**
   - Real-time waveform display
   - Spectrum analyzer
   - Helps user understand input quality

5. **StatusIndicator**
   - Microphone permission status
   - Audio context state
   - Latency display
   - Error messages

### 6.2 User Experience Flow

**Initial Load:**
1. Display welcome screen with instructions
2. Show "Enable Microphone" button
3. Request permissions on user click
4. Initialize audio context
5. Display ready state

**Active Use:**
1. User plays flute note
2. Frequency display updates in real-time
3. Piano note plays automatically
4. Visual tuner shows pitch accuracy
5. Continuous feedback during sustained notes

**Error Handling:**
1. Clear error messages for common issues
2. Troubleshooting tips (check microphone, browser compatibility)
3. Graceful degradation if features unavailable

### 6.3 Visual Feedback Design

**Frequency Display:**
- Large, readable font for frequency value
- Color coding: Green (in tune), Yellow (slightly off), Red (significantly off)
- Note name with octave (e.g., "C4", "F#5")

**Tuner Visualization:**
- Needle-style meter (classic tuner look)
- Center position = perfect pitch
- Left/right deviation shows cents sharp/flat
- Range: ±50 cents

**Waveform Display:**
- Canvas-based rendering
- Update at 30-60 FPS (not audio rate)
- Show last 100-200ms of audio
- Optional spectrum view

### 6.4 Accessibility Considerations

**Keyboard Navigation:**
- All controls accessible via keyboard
- Tab order follows logical flow
- Space/Enter to activate buttons

**Screen Reader Support:**
- ARIA labels for all controls
- Live regions for frequency updates
- Descriptive error messages

**Visual Accessibility:**
- High contrast mode support
- Colorblind-friendly color schemes
- Adjustable text size

---

## 7. Testing and Debugging Strategy

### 7.1 Development Testing Approach

**Phase 1: Component Testing**
- Test microphone access in isolation
- Verify audio context initialization
- Test pitch detection with known frequencies
- Validate synthesis output

**Phase 2: Integration Testing**
- Test complete audio pipeline
- Verify latency requirements
- Test continuous playback
- Validate feedback prevention

**Phase 3: User Testing**
- Test with actual flute input
- Verify accuracy across frequency range
- Test in different acoustic environments
- Gather user feedback on responsiveness

### 7.2 Debugging Tools and Techniques

**Browser DevTools:**
- Performance profiler for CPU usage
- Memory profiler for leak detection
- Console logging for audio events
- Network tab for worklet loading

**Audio-Specific Tools:**
- Web Audio Inspector (Chrome extension)
- Oscilloscope visualization for waveforms
- Frequency counter for validation
- Latency measurement tools

**Test Signal Generation:**
- Use OscillatorNode to generate known frequencies
- Test pitch detection accuracy
- Validate synthesis output
- Measure end-to-end latency

### 7.3 Common Issues and Solutions

**Issue 1: Inaccurate Pitch Detection**
- **Causes:** Noisy input, incorrect algorithm parameters, harmonics
- **Solutions:** Adjust threshold, improve algorithm, filter input

**Issue 2: High Latency**
- **Causes:** Large buffers, slow algorithm, main thread blocking
- **Solutions:** Optimize algorithm, use AudioWorklet, reduce buffer size

**Issue 3: Audio Glitches**
- **Causes:** CPU overload, buffer underruns, garbage collection
- **Solutions:** Optimize code, increase buffer size, pre-allocate memory

**Issue 4: Feedback Loop**
- **Causes:** Synthesized output picked up by microphone
- **Solutions:** Implement gating, reduce volume, recommend headphones

**Issue 5: Browser Compatibility**
- **Causes:** Different Web Audio API implementations
- **Solutions:** Feature detection, polyfills, browser-specific workarounds

### 7.4 Performance Benchmarking

**Metrics to Track:**
- Pitch detection accuracy (% correct within 5 cents)
- Latency (input to output time)
- CPU usage (% of single core)
- Memory usage (MB)
- Frame rate (for visualizations)

**Benchmarking Process:**
1. Generate test tones at known frequencies
2. Measure detection accuracy
3. Record latency with loopback test
4. Monitor CPU/memory during extended use
5. Test across different browsers/devices

**Acceptance Criteria:**
- Pitch accuracy: >95% within 5 cents
- Latency: <50ms end-to-end
- CPU usage: <25% of single core
- No memory leaks over 10-minute session
- Smooth 60 FPS for visualizations

---

## Implementation Timeline Estimate

**Week 1: Foundation**
- Project setup and configuration
- Basic React structure
- Microphone access implementation

**Week 2: Core Audio**
- Pitch detection algorithm
- Audio synthesis engine
- Basic integration

**Week 3: Optimization**
- AudioWorklet implementation
- Latency optimization
- Performance tuning

**Week 4: UI and Polish**
- User interface components
- Visual feedback
- Error handling

**Week 5: Testing**
- Comprehensive testing
- Bug fixes
- Browser compatibility

**Week 6: Refinement**
- User testing feedback
- Final optimizations
- Documentation

---

## Next Steps

1. Review this implementation plan
2. Set up development environment
3. Begin with Project Setup phase
4. Implement components incrementally
5. Test continuously throughout development
6. Iterate based on testing results

This plan provides a comprehensive roadmap for building your real-time pitch detection and audio feedback application. Each phase builds upon the previous one, ensuring a solid foundation before adding complexity.

