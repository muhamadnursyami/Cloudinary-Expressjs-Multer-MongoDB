const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Video = require("./models/video");
const Buku = require("./models/buku");
require("dotenv").config();
const cors = require("cors");
// Connect DB
mongoose
  .connect(process.env.MONGOO_URI)
  .then(() => console.log("Mongo DB is Connected"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDDINARY_API_KEY,
  api_secret: process.env.CLOUDDINARY_API_SECRET,
});

// Konfigurasi Multer untuk menyimpan di dalam memori
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Batas ukuran file (100 MB)
});
// Middlerware
app.use(express.json());
app.use(cors());

// Endpoint untuk mengunggah file/video
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Periksa apakah file/video diunggah
    if (!req.file) {
      return res.status(400).json({ error: "No file or video uploaded" });
    }

    // Ubah buffer menjadi readable stream
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", timeout: 120000 }, // Batas waktu unggah (120 detik)
      (error, result) => {
        // Handle Cloudinary upload errors
        if (error) {
          return res.status(500).json({
            error: "Cloudinary upload failed",
            details: error.message,
          });
        }
        if (req.body.type === "video") {
          let video = new Video({
            title: req.body.title,
            description: req.body.description,
            author: req.body.author,
            likes: req.body.likes,
            rating: req.body.rating,
            category: req.body.category,
            tanggal_upload: req.body.tanggal_upload,
            url_thumbnail: req.body.url_thumbnail,
            url_video: req.body.url_video,
            url_unduh: result.secure_url,
          });
          video.save();
          res.json(video);
        } else if (req.body.type === "buku") {
          let buku = new Buku({
            title: req.body.title,
            description: req.body.description,
            author: req.body.author,
            tahun_terbit: req.body.tahun_terbit,
            rating: req.body.rating,
            star: req.body.star,
            img_url: req.body.img_url,
            category: req.body.category,
            book_url: result.secure_url,
            download_url: result.secure_url,
          });
          buku.save();
          res.json(buku);
        }
        // Tanggapan dengan hasil upload dari Cloudinary
        // res.json(result);
      }
    );

    // Kirim buffer sebagai readable stream ke Cloudinary
    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => console.log("Server Running"));
