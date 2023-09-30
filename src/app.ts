import express, { Express, Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.use('/', routes);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
