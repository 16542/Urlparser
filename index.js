require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const urlParser = require("url");
// import body parser ;
const BodyParser = require("body-parser");

app.use(BodyParser.urlencoded({ extended: false }));

// import mongoose
const mongoose = require("mongoose");
const req = require("express/lib/request");

// connecting the project to Db;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// build URL Schema;

const { Schema } = mongoose;

const UrlSchema = new Schema({ url: String });

const Url = mongoose.model("Url", UrlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  const bodyUrl = req.body.url;
  dns.lookup(urlParser.parse(bodyUrl).hostname, (error, adress) => {
    if (!adress) {
      res.json({ error: "invalid url" });
    } else {
      const url = new Url({ url: bodyUrl });
      url.save((err, data) => {
        res.json({ original_url: data.url, short_url: data._id });
      });
    }
  });
});

// get the url by their ID ;
app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.url);
    }
  });
});

// post the url and post a new url in the DB ;

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
