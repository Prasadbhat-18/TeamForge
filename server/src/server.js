import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';

// Fail fast if required env vars are missing
const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
