import express from "express";
import cors from "cors";
import urlRoutes from "./routes/url.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
  origin: "https://takeme-kappa.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options('*', cors());

app.use("/api/url", urlRoutes);

export default app;
