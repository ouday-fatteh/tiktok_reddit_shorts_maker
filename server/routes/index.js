import { Router } from "express";
import ytdl from "ytdl-core";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import pathToFfmpeg from "ffmpeg-static";
import ffprobe from "ffprobe-static";

const dir = "./assets/videos/";

//router for the api
const router = Router();

//get youtube video from youtube-dl

const downloadVideo = async (req, res) => {
  const { url, duration } = req.query;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log("Downloading video ..");
  ytdl(url)
    .pipe(fs.createWriteStream(dir + "background.mp4"), [
      { quality: "highestvideo" },
    ])
    .on("finish", async () => {
      console.log("Video downloaded");
      await trimVideo(
        dir + "background.mp4",
        dir + "backgroundfinal.mp4",
        30,
        duration,
        res
      );
    });
};

const trimVideo = async (sourcePath, outputPath, startTime, duration, res) => {
  console.log("Beginning video trimming...");
  await new Promise((resolve, reject) => {
    ffmpeg(sourcePath)
      .setFfmpegPath(pathToFfmpeg)
      .setFfprobePath(ffprobe.path)
      .complexFilter([
        {
          filter: "crop",
          options: {
            w: "iw/3",
            h: "ih",
            x: "iw/3",
            y: "0",
          },
        },
      ])
      .output(outputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .withVideoCodec("libx264")
      .withNoAudio()
      .on("end", function (err) {
        if (!err) {
          console.log("conversion Done");
          res.status(200).send({ message: "Video generated successfully" });
          resolve();
        }
      })
      .on("error", function (err) {
        console.log("error: ", err);
        res.status(500).send({ message: "An error occured during conversion" });
        reject(err);
      })
      .run();
  });
};

//stream the video to the client
const streamVideo = async (req, res) => {
  const { fileName } = req.query;
  const path = dir + fileName + ".mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
};

// store images
const storeImage = async (req, res) => {
  const { files } = req.body;

  try {
    files.forEach((file) => {
      let rawBase64 = file.dataUrl;
      let filename = file.index;
      let base64Image = rawBase64.split(";base64,").pop();
      fs.writeFileSync("assets/images/" + filename + ".png", base64Image, {
        encoding: "base64",
      });
    });
    res.status(200).send({
      message: "Getting text-to-speech audio",
    });
  } catch (error) {
    res.status(500).send({ message: "An error occured during conversion" });
  }
};

// get text-to-speech audio
const getTextToSpeech = async (req, res) => {
  const { text, filename } = req.body;
  const dir = "./assets/audio/";
  const audioPath = dir + filename + ".wav";
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    res.status(200).send({
      message: "Getting background video",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An error occured during getting TTS" });
  }
};

router.get("/yt", downloadVideo);
router.get("/video", streamVideo);
router.post("/comments", storeImage);
router.post("/tts", getTextToSpeech);

export default router;
