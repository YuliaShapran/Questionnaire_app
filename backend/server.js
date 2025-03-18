
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import surveyRoutes from './routes/surveyRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => res.send('API is working!'));


app.use('/api/surveys', surveyRoutes);


app.use((req, res) => {
  res.status(404).send('Route not found');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
