const buttonEl = document.getElementById('button-start');

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch(frequency) {
    var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

const startAudio = async (context) => {
    const oscillator = new OscillatorNode(context);
    const bypasser = new AudioWorkletNode(context, 'wasm-worklet-processor');
    oscillator.connect(bypasser).connect(context.destination);
    oscillator.start();
};

const askForMic = async () => {
  let deviceId = "default"
  const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
          deviceId: { exact: deviceId },
          channelCount: 1,
          sampleRate: 48000,
      }, video: false
  }).catch((e) => {
      console.log(e)
      buttonEl.textContent = `Error: ${e.name} ${e.message} ${e.stack}`

      document.addEventListener('click', askForMic, { once: true, capture: false, passive: true });

  });
  
  console.log(mediaStream)
  const sampleRate = mediaStream.getAudioTracks()[0].getSettings().sampleRate
  console.log(sampleRate)
  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('/audio-processor.js')
  const pitchDetectionNode = new AudioWorkletNode(audioContext, 'pitch-detection-processor', { processorOptions: { sampleRate: sampleRate } });

  pitchDetectionNode.port.onmessage = (e) => {
      // console.log(Math.round(parseFloat(e.data) * 100) / 100);
      let [pitch, amplitude] = e.data;
      pitchCallback(pitch)
  };

  const sourceNode = audioContext.createMediaStreamSource(mediaStream);
  sourceNode.connect(pitchDetectionNode);

  audioContext.resume();
  buttonEl.disabled = true;
  buttonEl.textContent = 'Playing...';
}
const getMicAccess = async () => {
    buttonEl.disabled = false;
    // buttonEl.addEventListener('click', async () => {
    document.addEventListener('click', askForMic, { once: true, capture: false, passive: true });
}

window.addEventListener('load',getMicAccess);

function pitchCallback(pitch) {
    if (pitch < 0) {
        hapticFeedback(false)
        addData({ frequency: null, time: 0 });
        return;
    }
    let pitchRounded = Math.round(parseFloat(pitch) * 100) / 100;
    const note = noteFromPitch(pitch);
    const noteString = noteStrings[note % 12];
    hapticFeedback(noteString == "C")
    const noteOctave = Math.floor(note / 12) - 1;
    // console.log(noteString + noteOctave);
    if (interval) {
        clearInterval(interval);
    }
    addData({ frequency: pitch, time: 0 });
    buttonEl.textContent = noteString + noteOctave;
}

function hapticFeedback(on) {
    if (on) {
        if (navigator.vibrate) navigator.vibrate(10);
        document.body.style.backgroundColor = "red";
    } else {
        if (navigator.vibrate) navigator.vibrate(0);
        document.body.style.backgroundColor = "white";
    }
}