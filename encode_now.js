const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

async function encodeNow() {
  console.log('--- Encoding MediLens AI MP4 Video with FFmpeg ---');

  const ffmpeg = path.join(__dirname, 'tools', 'ffmpeg.exe');
  const videoAssets = path.join(__dirname, 'video_assets');
  const audioListFile = path.join(videoAssets, 'audio_list.txt');

  // 1. Build audio concat file list
  const lines = [];
  for (let i = 1; i <= 8; i++) {
    const sceneWav = path.join(videoAssets, `scene${i}.wav`).replace(/\\/g, '/');
    lines.push(`file '${sceneWav}'`);
  }
  fs.writeFileSync(audioListFile, lines.join('\n'));
  console.log('Wrote audio playlist to:', audioListFile);

  // 2. Concat audio
  const masterAudio = path.join(videoAssets, 'master_narration.wav');
  console.log('Concatenating narration audio with FFmpeg...');
  execFileSync(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', audioListFile,
    masterAudio
  ], { stdio: 'inherit' });

  // 3. Encode video frames + audio to MP4
  const framePattern = path.join(videoAssets, 'frames', 'frame_%05d.jpg').replace(/\\/g, '/');
  const outputMp4 = path.join(__dirname, 'MediLens_AI_Demo_Video.mp4');

  console.log('Encoding 1646 frames and master audio into MP4...');
  execFileSync(ffmpeg, [
    '-y',
    '-r', '10',
    '-i', framePattern,
    '-i', masterAudio.replace(/\\/g, '/'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '160k',
    outputMp4
  ], { stdio: 'inherit' });

  // 4. Verify & Copy
  const stats = fs.statSync(outputMp4);
  const userDownloads = path.join(process.env.USERPROFILE || 'C:\\Users\\Shree', 'Downloads', 'MediLens_AI_Demo_Video.mp4');
  const distPath = path.join(__dirname, 'frontend', 'dist', 'MediLens_AI_Demo_Video.mp4');

  fs.copyFileSync(outputMp4, userDownloads);
  fs.copyFileSync(outputMp4, distPath);

  console.log('\n======================================================');
  console.log('🎬 MP4 DEMO VIDEO SUCCESSFULLY CREATED:');
  console.log(`   Local File: ${outputMp4}`);
  console.log(`   File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Downloads Destination: ${userDownloads}`);
  console.log(`   Browser URL: http://localhost:5000/MediLens_AI_Demo_Video.mp4`);
  console.log('======================================================');
}

encodeNow().catch(err => {
  console.error('Encoding error:', err);
  process.exit(1);
});
