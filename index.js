const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Videos = require("./models/video");
const Buku = require("./models/buku");
require("dotenv").config();
const cors = require("cors");
// Connect DB
mongoose
  .connect(process.env.MONGOO_URI)
  .then(() => console.log("Mongo DB is Connected"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));
// multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDDINARY_API_KEY,
  api_secret: process.env.CLOUDDINARY_API_SECRET,
});

// Middlerware
app.use(express.json());
app.use(cors());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          return res.status(500).json({ error: "Cloudinary upload failed" });
        }
        if (req.body.type === "video") {
          let video = new Videos({
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
      })
      .end(req.file.buffer);
    // res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.post("/upload", upload.single("file"), (req, res) => {
//   const file = req.file;

//   // Upload file to Cloudinary
//   cloudinary.uploader
//     .upload_stream({ resource_type: "auto" }, (error, result) => {
//       if (error) {
//         return res.status(500).json({ error: "Cloudinary upload failed" });
//       }

//       // You can do something with the Cloudinary result, e.g., save the URL to a database
//       const publicUrl = result.secure_url;
//       res.json({ url: publicUrl });
//     })
//     .end(file.buffer);
// });

app.listen(5000, () => console.log("Server Running"));
