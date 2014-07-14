/* Thanks Marc @ stackoverflow for this module definition pattern
 * http://stackoverflow.com/questions/13673346/supporting-both-commonjs-and-amd
 */
(function(name, deps, definition) {
    if (typeof module != 'undefined') {
        module.exports = definition();
    } else if (typeof define == 'function' && typeof define.amd == 'object') {
        define(name, deps, definition);
    } else {
        this[name] = definition();
    }
}('jssynth_core', [], function() {
    "use strict";

    var jssynth = {};

    jssynth.clone = function(obj) {
        var newObj = {};

        for(var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    };

    jssynth.merge = function(existingObj, toMerge) {
        var newObj = jssynth.clone(existingObj);

        if (toMerge !== undefined && toMerge !== null) {
            for(var key in toMerge) {
                if (toMerge.hasOwnProperty(key)) {
                    newObj[key] = toMerge[key];
                }
            }
        }
        return newObj;
    };

    jssynth.makeArrayOf = function (value, length) {
        var arr = [], i = length;
        while (i--) {
            arr[i] = value;
        }
        return arr;
    };

    /*
     * Mixer definitions
     */

    var DEFAULT_CHANNEL_STATE = {
        panPos: 0,  /* -1 = full left, +1 = full right */
        playbackFreqHz: 0,
        sample: undefined,
        samplePosition: -1,
        volume: 64,
        enabled: true
    };



    var DEFAULT_SAMPLE_METADATA = {
        name: "",
        bits: 24,
        channels: 2,
        little_endian: true,
        delta_encoding: false,
        signed: true,
        sampleRate: 44100,
        representedFreq: 440,  /* the frequency that this sample will produce if played at it's sample rate */
        pitchOfs: 1,
        repeatType: 'NON_REPEATING',
        volume: 64,
        repeatStart: 0,
        repeatEnd: 0,
        sampleLength: 0
    };

    var DEFAULT_INSTRUMENT_METADATA = {
        noteToSampleMap: [
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ],

        volumeType: 0,  // bit 0: On; 1: Sustain; 2: Loop
        volumeEnvelope: [],
        numVolumePoints: 0,
        volumeSustainPoint: 0,
        volumeLoopStartPoint: 0,
        volumeLoopEndPoint: 0,

        panningType: 0, // bit 0: On; 1: Sustain; 2: Loop
        panningEnvelope: [],
        numPanningPoints: 0,
        panningSustainPoint: 0,
        panningLoopStartPoint: 0,
        panningLoopEndPoint: 0,

        vibratoType: 0,  // ???
        vibratoSweep: 0,
        vibratoDepth: 0,
        vibratoRate: 0,

        volumeFadeout: 0
    };

    /*
     * Convert a set of raw (byte-wise) samples into arrays of doubles
     */
    var convertSamplesBytesToDoubles = function(samples, metadata, offset) {
        var startOfs = offset || 0;
        var channelData = [];
        var rawData = [];
        var meta = jssynth.merge(DEFAULT_SAMPLE_METADATA, metadata);
        for (var chan = 0; chan < meta.channels; chan++) {
            channelData[chan] = [];
            rawData[chan] = [];
        }
        if (meta.bits % 8 !== 0 || meta.bits > 24) {
            console.log("can only read 8, 16 or 24-bit samples");
            return channelData;
        }
        var bytesPerSample = meta.bits / 8;
        var bytesPerSamplePeriod = bytesPerSample * meta.channels;
        var periodsToRead = metadata.sampleLength;
        for (var i = 0 ; i < periodsToRead; i++) {
            var ofs = bytesPerSamplePeriod * i;
            for (var chan = 0; chan < meta.channels; chan++) {
                var chanOfs = ofs + chan * bytesPerSample;
                var startBytePos = chanOfs + (meta.little_endian ? (bytesPerSample-1) : 0);
                var endBytePos = chanOfs + (meta.little_endian ? -1 : bytesPerSample);
                var bytePosDelta = (meta.little_endian ? -1 : 1);
                var data = 0;
                var scale = 0.5;
                var mask = 255;
                for (var bytePos = startBytePos; bytePos !== endBytePos; bytePos += bytePosDelta) {
                    data = data * 256 + samples.charCodeAt(startOfs+bytePos);
                    scale = scale * 256;
                    mask = mask * 256 + 255;
                }
                if (meta.signed) {
                    /* samp XOR 0x8000 & 0xffff converts from signed to unsigned */
                    data = (data ^ scale) & mask;
                }
                if (meta.delta_encoding) {
                    var previousVal = ((i == 0) ? 0x00 : rawData[chan][i-1]);
                    rawData[chan][i] = (previousVal + ((data^scale)&mask)) & 0xff;
                    channelData[chan][i] = (((rawData[chan][i] ^ scale) & mask) - scale) / scale;
                } else {
                    data = (data - scale) / scale;
                    channelData[chan][i] = data;
                }
            }
        }
        return channelData;
    };

    jssynth.Sample = function(sampleData, metadata, offset) {
        if (typeof sampleData === 'function') {
            this.data = sampleData();
        } else {
            this.data = convertSamplesBytesToDoubles(sampleData, metadata, offset);
        }
        this.metadata = jssynth.merge(DEFAULT_SAMPLE_METADATA, metadata);
        if (this.metadata.repeatType !== 'NON_REPEATING') {
            for (var c = 0; c < this.data.length; c++) {
                this.data[c][metadata.repeatEnd+1] = this.data[c][metadata.repeatEnd];
            }
        }
    };

    jssynth.Instrument = function(metadata, samples) {
        this.metadata = jssynth.merge(DEFAULT_INSTRUMENT_METADATA, metadata);
        this.samples = samples;
    };

    jssynth.Mixer = function(globalState, defaultChannelState) {
        this.globalState = jssynth.merge({
            numChannels: 8,
            volume: 64,
            secondsPerMix: 0.1,
            filters: null
        }, globalState);
        this.preMixCallback = null;
        this.preMixObject = null;
        this.channelState = [];
        var dcs = jssynth.merge(DEFAULT_CHANNEL_STATE, defaultChannelState);
        for (var chan = 0; chan < this.globalState.numChannels; chan++) {
            this.channelState[chan] = jssynth.clone(dcs);
        }
    };

    /**
     * Set the callback to be called prior to mixing the next batch of samples
     * @param preMixCallback
     */
    jssynth.Mixer.prototype.setPreMixCallback = function(f, c) {
        this.preMixCallback = f;
        this.preMixObject = c;
    };

    jssynth.Mixer.prototype.setGlobalVolume = function(vol) {
        this.globalState.volume = vol;
    };

    /**
     * Set the number of seconds worth of data to return from each mix() call
     * @param secondsPerMix
     */
    jssynth.Mixer.prototype.setSecondsPerMix = function(secondsPerMix) {
        this.globalState.secondsPerMix = secondsPerMix;
    };

    /**
     * Trigger a sample to start playing on a given channel
     * @param channel channel to play the sample on
     * @param sample sample to play
     * @param freqHz frequency (absolute) to play the sample at
     */
    jssynth.Mixer.prototype.triggerSample = function(channel, sample, freqHz) {
    	if (!sample) {
    		console.warn("audio sample not found.");
    	}
    	else {
    		this.channelState[channel].sample = sample;
            this.channelState[channel].playbackFreqHz = freqHz;
            this.channelState[channel].samplePosition = 0;
            this.channelState[channel].volume = sample.metadata.volume;	
    	}
    };

    jssynth.Mixer.prototype.enableChannels = function(channels) {
        for (var i = 0; i < channels.length ; i++) {
            this.channelState[channels[i]].enabled = true;
        }
    };

    jssynth.Mixer.prototype.disableChannels = function(channels) {
        for (var i = 0; i < channels.length ; i++) {
            this.channelState[channels[i]].enabled = false;
        }
    };
    /**
     * Set sample without updating any other params
     * @param channel channel to play the sample on
     * @param sample sample to play
     * @param freqHz frequency (absolute) to play the sample at
     */
    jssynth.Mixer.prototype.setSample = function(channel, sample) {
        this.channelState[channel].sample = sample;
    };


    /**
     * Set the current position/offset of the sample playing on a given channel
     * @param channel
     * @param offset
     */
    jssynth.Mixer.prototype.setSamplePosition = function(channel, offset) {
        var sample = this.channelState[channel].sample;
        if (sample) {
            var length = sample.metadata.sampleLength;
            if (sample.metadata.repeatType !== 'NON_REPEATING') {
                var repStart = sample.metadata.repeatStart;
                var repEnd = sample.metadata.repeatEnd;
                var repLen = repEnd - repStart;
                while (offset > length) {
                    offset -= repLen;
                }
            }
            if (offset < length) {
                this.channelState[channel].samplePosition = offset;
            } else {
                this.channelState[channel].samplePosition = -1;
            }
        }
    };

    /**
     * Add a phase offset to the sample playing on a given channel
     * @param channel
     * @param offset
     */
    jssynth.Mixer.prototype.addToSamplePosition = function(channel, offset) {
        var sample = this.channelState[channel].sample;
        if (sample && this.channelState[channel].samplePosition >= 0) {
            this.setSamplePosition(channel, this.channelState[channel].samplePosition + offset);
        }
    };

    /**
     * Change the frequency of a sample playing on a given channel
     * @param channel
     * @param freqHz
     */
    jssynth.Mixer.prototype.setFrequency = function(channel, freqHz) {
        this.channelState[channel].playbackFreqHz = freqHz;
    };

    /**
     * Change the volume of a sample playing on a given channel
     * @param channel
     * @param vol
     */
    jssynth.Mixer.prototype.setVolume = function(channel, vol) {
        this.channelState[channel].volume = vol;
    };

    /**
     * Change the L/R mix for a given channel (-1 = full left, +1 = full right)
     * @param channel
     * @param panPos
     */
    jssynth.Mixer.prototype.setPanPosition = function(channel, panPos) {
        this.channelState[channel].panPos = panPos;
    };

    /**
     * (Immediately) cut playback of a sample playing on a given channel
     * @param channel
     */
    jssynth.Mixer.prototype.cut = function(channel) {
        this.channelState[channel].samplePosition = -1;
        this.channelState[channel].sample = undefined;
    };

    /**
     * Set globally applied filters (array, 0 = left filter, 1 = right filter)
     * @param filters
     */

    jssynth.Mixer.prototype.setFilters = function(filters) {
        if (filters) {
            this.globalState.filters = filters;
        } else {
            this.globalState.filters = null;
        }
    };



    /* TODO; not sure if things need to get this complicated for now */
    var calculatePanMatrix = function(pp) {
        if (pp >= -1 && pp <= 1) {
            var pp = (pp + 1) / 2;   /* shift values from -1 to 1, to be in the range 0..1 (left -> right) */
            return {
                ll: 1-pp, /* left channel, % left mix */
                lr: 0, /* left channel, % right mix - TODO */
                rl: 0, /* right channel, % left mix */
                rr: pp  /* right channel, % right mix - TODO */
            };
        } else {
            return {ll: 1, rr: -1 };  /* surround */
        }
    };

    var STEP_FUNCS = {  /* step through the sample, key is "repeatType" flag */
        'REP_NORMAL': function(samplePos, samplePosStep, repEnd, repLen) {
            samplePos += samplePosStep;
            while (samplePos >= repEnd) {
                samplePos -= repLen;
            }
            return samplePos;
        },
        'NON_REPEATING': function(samplePos, samplePosStep) {
            return samplePos + samplePosStep;
        }
    };

    jssynth.Mixer.prototype.mix = function(sampleRate) {
        if (this.preMixCallback) {
            this.preMixCallback.call(this.preMixObject, this, sampleRate);
        }
        var i = 0, chan = 0;
        var output = [];
        var numSamples = Math.floor(sampleRate * this.globalState.secondsPerMix);
        output[0] = jssynth.makeArrayOf(0.0, numSamples); /* left */
        output[1] = jssynth.makeArrayOf(0.0, numSamples); /* right */
        var numChannels = this.globalState.numChannels;
        var globalVolume = this.globalState.volume;
        for (chan = 0; chan < numChannels; chan++) {
            var state = this.channelState[chan];
            if (!state.enabled) {
                break;
            }

            var panPos = calculatePanMatrix(state.panPos);
            var sample = state.sample;

            var channelVolume = state.volume;
            var samplePos = state.samplePosition;
            var samplePosStep = state.playbackFreqHz / sampleRate;
            var scale = (1 / (numChannels / 2)) * (globalVolume / 64) * (channelVolume / 64);
            var leftScale = scale * panPos.ll;
            var rightScale = scale * panPos.rr;
            if (sample && sample.data && samplePos >= 0 && samplePosStep > 0) {
                var representedFreq = sample.metadata.representedFreq;
                var sampleSampleRate = sample.metadata.sampleRate;
                samplePosStep *= sampleSampleRate / representedFreq;

                var leftSampleData = sample.data[0];
                var rightSampleData = sample.data[1] || sample.data[0]; /* mix in mono if that's all we've got */
                var sampleLength = sample.metadata.sampleLength;
                var repStart = sample.metadata.repeatStart;
                var repEnd = sample.metadata.repeatEnd;
                var repLen = repEnd - repStart;
                var stepFunc = STEP_FUNCS[sample.metadata.repeatType];
                for (i = 0; (i < numSamples) && (samplePos < sampleLength); i++) {
                    output[0][i] += (leftSampleData[Math.floor(samplePos)] * leftScale);
                    output[1][i] += (rightSampleData[Math.floor(samplePos)] * rightScale);
                    samplePos = stepFunc(samplePos, samplePosStep, repEnd, repLen);
                }
            }
            state.samplePosition = samplePos;
        }
        if (this.globalState.filters) {
            var filters = this.globalState.filters;
            for (var i = 0; i < numSamples; i++) {
                output[0][i] = filters[0].next(output[0][i]);
                output[1][i] = filters[1].next(output[1][i]);
            }
        }
        return {
            bufferSize: numSamples,
            output: output
        };
    };


    jssynth.additiveSynth = function(length, sampleRate, baseFreq, harmonics, globalVolume, state) {
        var results = jssynth.makeArrayOf(0.0, length);
        var synthState = state || {};

        if (synthState.ofs === undefined) {
            synthState.ofs = 0;
        }
        for (var h = 0 ; h < harmonics.length; h++) {
            var freq = baseFreq * harmonics[h].freqMul;
            freq = freq * harmonics[h].random;
            if (freq < (sampleRate / 2)) {
                var scale = Math.pow(10, harmonics[h].dB/10) * (globalVolume / 64);
                for (var i = 0 ; i < length; i++) {
                    results[i] +=  Math.cos(2 * Math.PI * (freq / sampleRate) * (synthState.ofs+i)) * scale;
                }
            }
        }
        synthState.ofs += length;
        return results;
    };




    /* WEB AUDIO OUTPUT SUPPORT */

    var WA_BUF_SIZE = 2048;
    var WA_NUM_OUTPUT_CHANNELS = 2;

    /**
     * Web Audio ("ScriptProcessorNode") audio output functionality
     * @param mixer A mixer function that gets called periodically to produce new sampled audio data.
     * @constructor
     */
    jssynth.WebAudioOutput = function(mixer, bufferSize) {
        var self = this;

        if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
            window.AudioContext = window.webkitAudioContext;
        }

        if(window.hasOwnProperty('AudioContext')) {
            this.context = new AudioContext();
            this.mode = 'MODE_WEBKIT';
            this.node = this.context.createScriptProcessor(bufferSize || WA_BUF_SIZE, 0, WA_NUM_OUTPUT_CHANNELS);

            this.nextSamples = null;
            this.nextSamplesOffset = 0;



            var processSamples = function(event) {
                var outputBuffer = event.outputBuffer;
                var sampleRate = outputBuffer.sampleRate;
                var bufferLength = outputBuffer.length;
                var channelData = [ outputBuffer.getChannelData(0), outputBuffer.getChannelData(1) ];
                var i = null;
                var outputOfs = 0;

                while (outputOfs < bufferLength) {
                    if (!self.nextSamples) {
                        self.nextSamples = mixer.mix(sampleRate);
                        self.nextSamplesOffset = 0;
                    }

                    for (var chan = 0; chan < WA_NUM_OUTPUT_CHANNELS; chan++) {
                        for (i = 0; ((self.nextSamplesOffset+i) < self.nextSamples.bufferSize) && ((i + outputOfs) < bufferLength); i++) {
                            channelData[chan][outputOfs+i] = self.nextSamples.output[chan][self.nextSamplesOffset + i];
                        }
                    }
                    outputOfs += i;
                    self.nextSamplesOffset += i;

                    if (self.nextSamplesOffset >= self.nextSamples.bufferSize) {
                        self.nextSamples = null;
                    }
                }
            };

//            this.node.onaudioprocess = processSamples;

        }

        /**
         * Start the audio output
         */
        jssynth.WebAudioOutput.prototype.start = function() {
            self.node.connect(self.context.destination);
            this.node.onaudioprocess = processSamples;
        };

        /**
         * Stop/pause the audio output
         */
        jssynth.WebAudioOutput.prototype.stop = function() {
            self.node.disconnect();
            this.node.onaudioprocess = undefined;
        };
    }

    return jssynth;
}));