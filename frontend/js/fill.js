
const API_URL = 'http://localhost:3000/api/surveys';
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

const titleElem = document.getElementById('quiz-title');
const descriptionElem = document.getElementById('quiz-description');
const formElem = document.getElementById('quiz-form');
const submitBtn = document.getElementById('submit-btn');
const timeTracker = document.getElementById('time-tracker');

let startTime;

async function fetchSurvey() {
  try {
    const response = await fetch(`${API_URL}/${quizId}`);
    const survey = await response.json();
    renderSurvey(survey);
    startTimer();
  } catch (error) {
    console.error('Error loading questionnaire:', error);
  }
}

function startTimer() {
  startTime = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeTracker.textContent = `Time elapsed: ${elapsed} seconds`;
  }, 1000);
}

function renderSurvey(survey) {
  titleElem.textContent = survey.title;
  descriptionElem.textContent = survey.description;

  survey.questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'border p-4 rounded';

    questionDiv.innerHTML = `
      <p class="font-semibold">${index + 1}. ${question.text}</p>
      <div id="input-container-${index}" class="mt-2"></div>
    `;

    const inputContainer = questionDiv.querySelector(`#input-container-${index}`);

    switch (question.type) {
      case 'text':
        inputContainer.innerHTML = `
          <input type="text" name="question-${index}" class="border p-2 rounded w-full" required>
        `;
        break;

      case 'single-choice':
        question.options.forEach((option, optIndex) => {
          inputContainer.innerHTML += `
            <label class="block">
              <input type="radio" name="question-${index}" value="${option}" required>
              ${option}
            </label>
          `;
        });
        break;

      case 'multi-choice':
        question.options.forEach((option, optIndex) => {
          inputContainer.innerHTML += `
            <label class="block">
              <input type="checkbox" name="question-${index}" value="${option}">
              ${option}
            </label>
          `;
        });
        break;
    }

    formElem.appendChild(questionDiv);
  });
}


submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const formData = new FormData(formElem);
  const answers = [];

  for (let [key, value] of formData.entries()) {
    const index = key.split('-')[1];
    if (!answers[index]) answers[index] = [];
    answers[index].push(value);
  }

  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  const responsePayload = {
    quizId,
    answers,
    timeSpent: elapsedTime
  };

  try {
    const response = await fetch(`${API_URL}/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responsePayload),
    });

    if (response.ok) {
      alert('Quiz submitted successfully!');
      window.location.href = 'index.html';
    } else {
      alert('Error submitting quiz.');
    }
  } catch (error) {
    console.error('Error sending questionnaire:', error);
  }
});


fetchSurvey();
