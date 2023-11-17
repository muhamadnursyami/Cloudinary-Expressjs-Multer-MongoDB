const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Videos = require("./models/video");
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
        let video = new Videos({
          name: req.body.name,
          url_video: result.secure_url,
          cloudinary_id: result.public_id,
        });

        video.save();
        // res.json({ url: result.secure_url });
        res.json(result);
      })
      .end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  // Upload file to Cloudinary
  cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Cloudinary upload failed" });
      }

      // You can do something with the Cloudinary result, e.g., save the URL to a database
      const publicUrl = result.secure_url;
      res.json({ url: publicUrl });
    })
    .end(file.buffer);
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
