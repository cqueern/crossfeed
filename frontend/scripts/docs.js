import serverless from 'serverless-http';
import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';

export const app = express();

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
  })
); // limit 1000 requests per 15 minutes

app.use(express.static(path.join(__dirname, '../docs/build')));
app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        baseUri: ["'none'"],
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'none'"]
      }
    },
    hsts: { maxAge: 31536000, preload: true },
    xFrameOptions: 'DENY'
  })
);
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../docs/build/index.html'));
});

export const handler = serverless(app, {
  binary: ['image/*', 'font/*']
});
