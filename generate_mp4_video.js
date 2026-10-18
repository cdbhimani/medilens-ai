const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

async function main() {
  console.log('=== MediLens AI Official MP4 Demo Video Generator ===');

  // 1. Scene files and durations
  const sceneFiles = [];
  for (let i = 1; i <= 8; i++) {
    sceneFiles.push(path.join(__dirname, 'video_assets', `scene${i}.wav`));
  }

  const buffers = sceneFiles.map(f => fs.readFileSync(f));
  const byteRate = buffers[0].readUInt32LE(28);
  const blockAlign = buffers[0].readUInt16LE(32);
  const silenceSec = 1.2;
  const silenceBytes = Math.floor(byteRate * silenceSec);
  const alignedSilence = silenceBytes - (silenceBytes % blockAlign);
  const silence = Buffer.alloc(alignedSilence);

  const sceneDurations = [];
  const pcm = [];

  for (let i = 0; i < buffers.length; i++) {
    const rawPcm = buffers[i].subarray(44);
    pcm.push(rawPcm);
    const audioDur = rawPcm.length / byteRate;
    const durWithPause = audioDur + (i < buffers.length - 1 ? silenceSec : 0.5);
    sceneDurations.push(durWithPause);
    if (i < buffers.length - 1) {
      pcm.push(silence);
    }
  }

  const totalPcm = Buffer.concat(pcm);
  const header = Buffer.alloc(44);
  buffers[0].copy(header, 0, 0, 44);
  header.writeUInt32LE(36 + totalPcm.length, 4);
  header.writeUInt32LE(totalPcm.length, 40);

  const masterAudioPath = path.join(__dirname, 'video_assets', 'narration_master.wav');
  fs.writeFileSync(masterAudioPath, Buffer.concat([header, totalPcm]));

  const totalDuration = totalPcm.length / byteRate;
  console.log(`[Step 1/4] Master narration ready: ${totalDuration.toFixed(2)}s across 8 scenes.`);

  // 2. Prepare frames folder
  const framesDir = path.join(__dirname, 'video_assets', 'frames');
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  // 3. Launch Chrome & render frames
  console.log('[Step 2/4] Launching Headless Chrome to capture 720p HD canvas frames...');
  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:5000/demo_video.html');

  const FPS = 10;
  let globalFrameIndex = 0;

  console.log(`[Step 3/4] Rendering frames at ${FPS} FPS...`);
  const startTime = Date.now();

  for (let s = 0; s < sceneDurations.length; s++) {
    const dur = sceneDurations[s];
    const frameCount = Math.round(dur * FPS);
    console.log(`  -> Scene ${s + 1} / 8 (${frameCount} frames, ${dur.toFixed(1)}s)`);

    for (let f = 0; f < frameCount; f++) {
      const t = f / FPS;
      const dataUrl = await page.evaluate((sceneIdx, time, totalTime) => {
        SCENES[sceneIdx].draw(ctx, time, totalTime);
        return canvas.toDataURL('image/jpeg', 0.88);
      }, s, t, dur);

      const buf = Buffer.from(dataUrl.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
      const filename = `frame_${String(globalFrameIndex).padStart(5, '0')}.jpg`;
      fs.writeFileSync(path.join(framesDir, filename), buf);
      globalFrameIndex++;
    }
  }

  const renderElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Captured all ${globalFrameIndex} frames in ${renderElapsed}s.`);
  await browser.close();

  // 4. Encode with FFmpeg
  console.log('[Step 4/4] Encoding video and audio into MP4 with FFmpeg...');
  const ffmpegPath = path.join(__dirname, 'tools', 'ffmpeg.exe');
  const outputMp4 = path.join(__dirname, 'MediLens_AI_Demo_Video.mp4');
  const framePattern = path.join(framesDir, 'frame_%05d.jpg').replace(/\\/g, '/');
  const audioInput = masterAudioPath.replace(/\\/g, '/');
  const finalMp4 = outputMp4.replace(/\\/g, '/');

  const ffmpegArgs = [
    '-y',
    '-r', String(FPS),
    '-i', framePattern,
    '-i', audioInput,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-shortest',
    finalMp4
  ];

  execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });

  // Clean frames to save disk space
  fs.rmSync(framesDir, { recursive: true, force: true });

  // Copy to Downloads & dist
  const userDownloads = path.join(process.env.USERPROFILE || 'C:\\Users\\Shree', 'Downloads', 'MediLens_AI_Demo_Video.mp4');
  const distPath = path.join(__dirname, 'frontend', 'dist', 'MediLens_AI_Demo_Video.mp4');

  fs.copyFileSync(outputMp4, userDownloads);
  fs.copyFileSync(outputMp4, distPath);

  const stats = fs.statSync(outputMp4);
  console.log('\n================================================================');
  console.log('🎬 MP4 VIDEO DEMO READY:');
  console.log(`   File: ${outputMp4}`);
  console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Duration: ~${(totalDuration / 60).toFixed(1)} minutes (720p HD, 10 FPS, H.264 / AAC)`);
  console.log(`   Saved to Downloads: ${userDownloads}`);
  console.log(`   Direct HTTP Link: http://localhost:5000/MediLens_AI_Demo_Video.mp4`);
  console.log('================================================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
