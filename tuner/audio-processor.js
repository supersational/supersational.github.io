import Module from './PitchDetector.js';

const RMS = (floatArray) => Math.sqrt(floatArray.reduce((acc, sample) => acc + sample ** 2, 0) / floatArray.length);

class PitchDetectionProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // Example frequencies, adjust based on your requirements
        const lowestFrequency = 50; // Hz
        const highestFrequency = 5000; // Hz
        Module._init(48000, lowestFrequency, highestFrequency);
    }

    process(inputs) {
        const lInput = inputs[0][0];
        if (!lInput) return true; // Guard clause for empty input
        // console.log();
        Module.HEAPF32.set(lInput, Module._getInputMemoryOffset() / Float32Array.BYTES_PER_ELEMENT);
        const frequency = Module._run(lInput.length);

        if (frequency > 0) {
            this.port.postMessage([frequency, RMS(lInput)]);
        } else {
            this.port.postMessage([-1, -1]);
        }

        return true;
    }
}

registerProcessor('pitch-detection-processor', PitchDetectionProcessor);
