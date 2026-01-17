import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// --- TTS function (Sonauto) ---
async function generateAudioWithSonauto({
  prompt,
  bpm = 120,
  balanceStrength = 0.8,
  promptStrength = 1.56,
  outputFormat = "mp3",
}, sendStatus = null) {
  const sonaApiKey = process.env.SUNAOTO_API_KEY;
  if (!sonaApiKey) throw new Error("Set your SUNAOTO_API_KEY environment variable!");

  try {
    const instrumental = balanceStrength <= 0.15;
    const cacheBuster = `\n\n[SessionID:${Date.now()}-${Math.floor(Math.random() * 10000)}]`;

    const payload = {
      prompt: prompt + cacheBuster,
      instrumental,
      balance_strength: balanceStrength,
      bpm,
      prompt_strength: promptStrength,
      num_songs: 2
    };

    const response = await axios.post(
      "https://api.sonauto.ai/v1/generations",
      payload,
      {
        headers: {
          "Authorization": `Bearer ${sonaApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const taskId = response.data.task_id;
    console.log("Sonauto task ID:", taskId);

    let songUrls = [];
    let finalLyrics = null;

    while (songUrls.length === 0) {
      await new Promise(res => setTimeout(res, 3000));
      const statusRes = await axios.get(
        `https://api.sonauto.ai/v1/generations/${taskId}`,
        { headers: { "Authorization": `Bearer ${sonaApiKey}` } }
      );

      const status = statusRes.data.status;
      console.log("Status:", status);

      // Send status updates to frontend
      if (sendStatus) {
        let progress = 50;
        let message = 'Generating audio...';

        switch (status) {
          case 'PROMPT':
            progress = 50; message = 'Processing prompt...'; break;
          case 'TASK_SENT':
            progress = 55; message = 'Task sent to audio engine...'; break;
          case 'GENERATING':
            progress = 60; message = 'Generating audio...'; break;
          case 'DECOMPRESSING':
            progress = 80; message = 'Processing audio...'; break;
          case 'SAVING':
            progress = 90; message = 'Saving audio files...'; break;
          case 'SUCCESS':
            progress = 95; message = 'Audio generation complete!'; break;
          case 'FAILURE':
            progress = 0; message = 'Audio generation failed'; break;
        }
        sendStatus(status, progress, message);
      }

      if (status === "SUCCESS") {
        songUrls = statusRes.data.song_paths;
        finalLyrics = statusRes.data.lyrics;
        console.log("Final tags used:", statusRes.data.tags);

        // Save all generated songs
        for (let i = 0; i < songUrls.length; i++) {
          const audioResponse = await axios.get(songUrls[i], { responseType: "arraybuffer" });
          fs.writeFileSync(`song_${i + 1}.mp3`, audioResponse.data);
          console.log(`Audio saved as song_${i + 1}.mp3`);
        }
      } else if (status === "FAILURE") {
        throw new Error("Sonauto generation failed: " + statusRes.data.error_message);
      }
    }

    return finalLyrics;

  } catch (err) {
    console.error("Error generating audio with Sonauto:", err.response?.data || err.message);
  }
}

// --- API Endpoints ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aether API is running (no OpenRouter)' });
});

// Song generation endpoint (only Sonauto)
app.post('/generate', async (req, res) => {
  try {
    const { userInput, bpm = 135, balance = 1.0 } = req.body;
    if (!userInput) return res.status(400).json({ error: 'userInput is required' });

    console.log('Starting TTS generation with:', { userInput, bpm, balance });

    // Setup SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendStatus = (status, progress, message = '') => {
      res.write(`data: ${JSON.stringify({ status, progress, message })}\n\n`);
    };

    sendStatus('STARTED', 10, 'Starting audio generation...');

    // Directly use the user prompt for TTS
    const ttsLyrics = await generateAudioWithSonauto({
      prompt: userInput,
      bpm: bpm,
      balanceStrength: balance,
    }, sendStatus);

    sendStatus('SUCCESS', 100, 'Audio generation complete!');
    res.write(`data: ${JSON.stringify({
      ttsLyrics,
      audioFiles: ['song_1.mp3', 'song_2.mp3'],
      complete: true
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Error in audio generation:', error);
    res.write(`data: ${JSON.stringify({
      error: 'Failed to generate audio',
      details: error.message,
      complete: true
    })}\n\n`);
    res.end();
  }
});

// Serve audio files
app.get('/audio/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = `./${filename}`;

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { root: '.' });
  } else {
    res.status(404).json({ error: 'Audio file not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Aether API running on port ${PORT} (without OpenRouter)`);
});
