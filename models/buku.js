const mongoose = require("mongoose");
const bukuSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  author: {
    type: String,
  },
  tahun_terbit: {
    type: String,
  },
  rating: {
    type: String,
  },
  star: {
    type: String,
  },
  book_url: {
    type: String,
  },
  img_url: {
    type: String,
  },
  download_url: {
    type: String,
  },
  category: {
    type: String,
  },
});

module.exports = mongoose.model("Buku", bukuSchema);
