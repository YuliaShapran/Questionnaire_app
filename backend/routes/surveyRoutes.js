
import express from 'express';
const router = express.Router();
import Survey from '../models/survey.js';


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 6; 
    const skip = (page - 1) * limit;

    const surveys = await Survey.find().skip(skip).limit(limit);
    const total = await Survey.countDocuments();

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      surveys,
    });

    console.log(`Sent ${surveys.length} surveys (Page: ${page})`);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Error fetching surveys' });
  }
});


router.post('/', async (req, res) => {
  try {
    const newSurvey = new Survey(req.body);
    await newSurvey.save();
    console.log('Survey created:', newSurvey);
    res.status(201).json(newSurvey);
  } catch (error) {
    console.error('Error saving survey:', error);
    res.status(400).json({ error: 'Failed to create survey' });
  }
});


router.post('/all', async (req, res) => {
	try {
	  console.log(req.body.length);
		for (let i = 0; i < req.body.length; i++) {
			console.log(req.body[i]);
			const newSurvey = new Survey(req.body[i]);
			await newSurvey.save();
		}
		 console.log("finished");
		res.status(201);
		console.log("finished 1");
  } catch (error) {
    res.status(400).json({ message: 'Error creating questionnaire' });
	}
	console.log("finished 2 ");
});


router.post('/:id/submit', async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;

    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Questionnaire not found' });

    survey.responsesCount += 1;
    await survey.save();

    console.log('Responses received:', answers);
    console.log('Filling time:', timeSpent);

    res.status(200).json({ message: 'Answers saved!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving answers' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Questionnaire not found' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: 'Error loading the questionnaire' });
  }
});


router.get('/:id/stats', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Questionnaire not found' });


    const averageTime = Math.floor(Math.random() * 300) + 60;


    const submissions = {
      day: Math.floor(Math.random() * 10),
      week: Math.floor(Math.random() * 50),
      month: Math.floor(Math.random() * 200)
    };


    const questions = survey.questions.map(q => ({
      text: q.text,
      options: q.options.map(option => ({
        text: option,
        count: Math.floor(Math.random() * 50)
      }))
    }));

    res.status(200).json({
      title: survey.title,
      averageTime,
      submissions,
      questions
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedSurvey = await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSurvey);
  } catch (error) {
    res.status(500).json({ message: 'Error updating the questionnaire' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSurvey = await Survey.findByIdAndDelete(id);

    if (!deletedSurvey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    res.status(200).json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
