const fs = require('fs');
const path = require('path');

function createBeepWav(filePath) {
  const sampleRate = 44100;
  const duration = 2.0; // 2 seconds chime
  const numSamples = Math.floor(sampleRate * duration);
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant loud two-tone chime (880Hz & 1320Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Repeated pulses every 0.35s
    const pulseCycle = t % 0.35;
    const pulseIndex = Math.floor(t / 0.35);
    const freq = (pulseIndex % 2 === 0) ? 880 : 1320;
    
    let sample = 0;
    if (pulseCycle < 0.28) {
      const envelope = Math.exp(-pulseCycle * 8);
      sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.85;
    }

    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, buffer);
  console.log('✓ Created audio chime at:', filePath);
}

// Write to raw folder and assets
createBeepWav(path.join(__dirname, 'android/app/src/main/res/raw/beep.wav'));
createBeepWav(path.join(__dirname, 'assets/beep.wav'));
createBeepWav(path.join(__dirname, 'www/assets/beep.wav'));
