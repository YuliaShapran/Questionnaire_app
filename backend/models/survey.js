import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  text: { type: String, required: true }, 
  options: [String], 
  image: { type: String }
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  responsesCount: { type: Number, default: 0 }
});

const Survey = mongoose.model('Survey', surveySchema);

export default Survey;
