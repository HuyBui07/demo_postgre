import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes';
import { types } from 'pg';

// Load environment variables
dotenv.config();

// --- BEGIN DATE PARSER CONFIGURATION ---
// PostgreSQL OID for DATE type is 1082
const DATE_OID = 1082;
types.setTypeParser(DATE_OID, (val: string) => {
  // The value from PostgreSQL for a DATE type is already 'YYYY-MM-DD'
  return val;
});
// --- END DATE PARSER CONFIGURATION ---

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to catch JSON parsing errors specifically
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // @ts-ignore 'status' and 'body' are not on the generic Error type but are common for these errors.
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    console.error('Malformed JSON in request body:', err.message);
    return res.status(400).json({
      error: 'Malformed JSON in request body',
      details: err.message
    });
  }
  next(err);
});

// Routes
app.use('/api', todoRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Global Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`Error on ${req.method} ${req.originalUrl}:`, err.stack);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Something went wrong on the server!' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});