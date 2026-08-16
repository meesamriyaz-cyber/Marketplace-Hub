import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { errorHandler } from "./middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import "dotenv/config";
const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
           method: req.method,
           url: req.url?.split("?")[0],
         };
       },
       res(res) {
         return {
           statusCode: res.statusCode,
         };
       },
     },
   }),
 );
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.use(errorHandler);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    logger.warn("MONGODB_URI not set. Running without database connection.");
    return;
  }
  try {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
    process.exit(1);
  }
};

connectDB();

const clientDist = join(__dirname, "..", "..", "app-marketplace", "dist", "public");
app.use(express.static(clientDist));

app.get("/{*path}", (req, res) => {
  res.sendFile(join(clientDist, "index.html"));
});

export default app;
