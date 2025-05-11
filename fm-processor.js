class FmProcessor extends AudioWorkletProcessor {
    constructor() {
        super(...arguments);
        this._phase = 0;
    }
    static get parameterDescriptors() {
        return [
            {
                name: "frequency",
                defaultValue: 440,
                minValue: 0.01,
                maxValue: 20000,
                automationRate: "a-rate",
            },
            {
                name: "level",
                defaultValue: 1,
                minValue: 0,
                maxValue: 1000,
                automationRate: "a-rate",
            },
            {
                name: "gain",
                defaultValue: 1,
                minValue: 0,
                maxValue: 1,
                automationRate: "a-rate",
            },
        ];
    }
    process(inputs, outputs, parameters) {
        const blockSize = outputs[0][0].length;
        const levelValues = parameters.level;
        // mix down all input channels to mono
        const processedInput = new Float32Array(blockSize);
        for (const input of inputs) {
            const channelCount = input.length;
            for (const channel of input) {
                console.assert(channel.length === blockSize);
                for (let i = 0; i < channel.length; i++) {
                    processedInput[i] += channel[i] / channelCount * levelValues[i];
                }
            }
        }
        const result = new Float32Array(blockSize);
        const frequencyValues = parameters.frequency;
        const gainValues = parameters.gain;
        for (let i = 0; i < blockSize; i++) {
            const frequency = frequencyValues[i];
            const phaseIncrement = frequency / sampleRate;
            this._phase += phaseIncrement;
            result[i] = gainValues[i] * Math.sin(this._phase * Math.PI * 2 + processedInput[i] * Math.PI * 2);
        }
        for (const output of outputs) {
            for (const channel of output) {
                for (let i = 0; i < channel.length; i++) {
                    channel[i] = result[i];
                }
            }
        }
        return true;
    }
}
registerProcessor('fm-processor', FmProcessor);