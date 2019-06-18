import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Wit, log } from "node-wit";
import axios from "axios";
const app = express();
//
// body data en+decoding
app.use(
  bodyParser.urlencoded({
    limit: "10000mb",
    extended: true
  })
);
app.use(bodyParser.json({ limit: "10000mb" }));
app.use(cors());
app.use((req, res, next) => {
  // version the media type and extend the language for api versionning
  res.setHeader("Accept", "application/vnd.upload.island.v1+json");
  // website we wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");
  // request methods we wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // request headers we wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Accept, Authorization, Content-Type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  // pass to next layer of middleware
  next();
});
app.get("/", (req, res) => {
  res.send(`Please feel free to use our api ${process.env.PORT}/api`);
});
app.get("/task/:question", async (req, res) => {
  try {
    console.log("====================================");
    console.log(req.params);
    console.log("====================================");
    let { question } = req.params;
    let countryName = "";
    const client = new Wit({
      accessToken: process.env.ACCESS_TOKEN
    });
    let data = await client.message(question, {});
    if (data.entities.location !== undefined) {
      countryName = data.entities.location[0].value;

      let config = {
        "X-RapidAPI-Key": process.env.API_KEY
      };
      let capital = await axios.get(
        `https://restcountries-v1.p.rapidapi.com/name/${countryName}`,
        {
          headers: config
        }
      );
      if (capital) {
        res.status(200).json(capital.data);
      } else {
        res.status(404).json({ message: "country not found" });
      }
    } else {
      res.status(404).json({ message: "country not found" });
    }
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
});
// About routes definition
// app.use("/api", api);

// Catching 404 error and forwarding to error handler
app.use((req, res, next) => {
  const err = new Error("Routes not found");
  err.status = 404;
  res.status(404).send({ err: err.message });
  console.log(`API ERROR: ${err.message} -- STATUS: ${404}`);
  // next(err);
});
// error handler
app.use((err, req, res) => {
  res.status(err.status || 500).json({ err: err.message });
});

export default app;
