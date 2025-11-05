import express from 'express';
import cors from 'cors';
import urlRoutes from './routes/url.routes';

const port = process.env.PORT || 4000;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      process.env.PRODUCTION_URL || "https://takeme-kappa.vercel.app",
      process.env.LOCAL_URL || "http://localhost:3000",
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.options('*', cors());

app.use('/api/url', urlRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
