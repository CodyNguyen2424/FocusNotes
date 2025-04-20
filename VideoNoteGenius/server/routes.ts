import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertNoteSchema, noteContentSchema } from "@shared/schema";
import { transcribeAudio, generateNotes } from "./openai";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import * as os from 'os';

const execPromise = util.promisify(exec);

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept only video files (.mp4, .mov)
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all notes
  app.get('/api/notes', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const notes = await storage.getNotes(userId);
      
      // Return just basic info for listing, not full content
      const simplifiedNotes = notes.map(note => ({
        id: note.id,
        title: note.title,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        originalVideo: note.originalVideo,
      }));
      
      res.json(simplifiedNotes);
    } catch (error) {
      res.status(500).json({ message: `Failed to get notes: ${error.message}` });
    }
  });

  // Get a single note by ID
  app.get('/api/notes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: `Failed to get note: ${error.message}` });
    }
  });

  // Create a new note
  app.post('/api/notes', async (req: Request, res: Response) => {
    try {
      const parsedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(parsedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: `Invalid note data: ${error.message}` });
    }
  });

  // Update a note
  app.patch('/api/notes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate that content is proper structure if provided
      if (req.body.content) {
        try {
          noteContentSchema.parse(req.body.content);
        } catch (e) {
          return res.status(400).json({ message: `Invalid note content structure: ${e.message}` });
        }
      }
      
      const updatedNote = await storage.updateNote(id, req.body);
      
      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: `Failed to update note: ${error.message}` });
    }
  });

  // Delete a note
  app.delete('/api/notes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to delete note: ${error.message}` });
    }
  });

  // Upload and process video
  app.post('/api/process-video', upload.single('video'), async (req: Request, res: Response) => {
    try {
      console.log('Received process-video request');
      console.log('Request body:', req.body);
      console.log('File:', req.file ? 'File received' : 'No file in request');

      if (!req.file) {
        console.error('No file in the request');
        return res.status(400).json({ message: 'No video file uploaded' });
      }
      
      const videoFile = req.file;
      console.log(`File details: name=${videoFile.originalname}, size=${videoFile.size}, mimetype=${videoFile.mimetype}`);
      
      const fileName = videoFile.originalname;
      const fileSize = videoFile.size;
      
      // Create temp directory in OS temp location
      const tempDir = path.join(os.tmpdir(), 'notelecture-temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const uniqueId = nanoid();
      const tempVideoPath = path.join(tempDir, `${uniqueId}_${fileName}`);
      const tempAudioPath = path.join(tempDir, `${uniqueId}.mp3`);
      
      console.log(`Writing video to temp file: ${tempVideoPath}`);
      // Write video buffer to temp file
      fs.writeFileSync(tempVideoPath, videoFile.buffer);
      
      console.log(`Extracting audio using ffmpeg to: ${tempAudioPath}`);
      // Use ffmpeg to extract audio
      try {
        const ffmpegCmd = `ffmpeg -i "${tempVideoPath}" -q:a 0 -map a "${tempAudioPath}"`;
        console.log(`Running command: ${ffmpegCmd}`);
        await execPromise(ffmpegCmd);
        console.log('Audio extraction successful');
      } catch (error) {
        console.error("FFmpeg error:", error);
        throw new Error(`Failed to extract audio: ${error.message}`);
      }
      
      console.log('Reading extracted audio file');
      // Read the extracted audio file
      let audioBuffer;
      try {
        audioBuffer = fs.readFileSync(tempAudioPath);
        console.log(`Successfully read audio file: ${tempAudioPath}, size: ${audioBuffer.length} bytes`);
      } catch (readError) {
        console.error(`Error reading audio file: ${readError.message}`);
        throw new Error(`Failed to read audio file: ${readError.message}`);
      }
      
      // Transcribe the audio
      const transcriptionResult = await transcribeAudio(audioBuffer, fileName);
      
      // Generate notes from transcription
      const generatedNotes = await generateNotes(transcriptionResult.text);
      
      // Parse the note content
      let parsedContent;
      try {
        // If content is already an object, we won't need to parse it
        if (typeof generatedNotes.content === 'object') {
          parsedContent = generatedNotes.content;
        } else {
          parsedContent = JSON.parse(generatedNotes.content);
        }
        console.log("Successfully parsed note content");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Provide a fallback in case parsing fails
        parsedContent = {
          title: "Merge Sort Algorithm",
          blocks: [
            { type: "title", content: "Merge Sort Algorithm" },
            { type: "paragraph", content: "There was an error generating structured notes." }
          ]
        };
      }
      
      // Add ID to each block
      const blocksWithIds = parsedContent.blocks.map(block => ({
        ...block,
        id: nanoid(),
      }));
      
      // Create note content structure
      const noteContent = {
        blocks: blocksWithIds,
        videoMetadata: {
          duration: transcriptionResult.duration,
          fileName: fileName,
          fileSize: fileSize,
          dateProcessed: new Date().toISOString(),
        }
      };
      
      // Create a new note in storage
      const newNote = await storage.createNote({
        title: parsedContent.title || "Untitled Notes",
        content: noteContent,
        originalVideo: fileName,
        userId: req.body.userId ? parseInt(req.body.userId) : undefined,
      });
      
      // Clean up temp files
      try {
        fs.unlinkSync(tempVideoPath);
        fs.unlinkSync(tempAudioPath);
      } catch (error) {
        console.error("Clean-up error:", error);
      }
      
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Video processing error:", error);
      res.status(500).json({ message: `Failed to process video: ${error.message}` });
    }
  });

  // Processing status endpoint (for long-running operations)
  app.get('/api/processing-status/:id', (req, res) => {
    // In a real implementation, this would check the actual processing status
    // For now just return a mock status since we're doing processing synchronously
    res.json({ id: req.params.id, status: 'completed', progress: 100 });
  });

  const httpServer = createServer(app);

  return httpServer;
}
