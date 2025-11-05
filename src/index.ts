import express from 'express';
import cors from 'cors';
import urlRoutes from './routes/url.routes';

const port = process.env.PORT || '4000';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/url', urlRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})