import express from "express";
import cors from "cors";
import ytRouter from "./routes/index.js";
import bodyParser from "body-parser";
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const port = 8000;
// init express
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(cors(corsOptions));
app.use("/", ytRouter);

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
