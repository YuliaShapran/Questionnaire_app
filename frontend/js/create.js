
const API_URL = 'https://questionnaire-app-n3a5.onrender.com/api/surveys';
const form = document.getElementById('survey-form');
const titleInput = document.getElementById('survey-title');
const descriptionInput = document.getElementById('survey-description');
const questionsContainer = document.getElementById('questions-container');
const addQuestionBtn = document.getElementById('add-question');


let questionIndex = 0;

function saveToLocalStorage() {
  const surveyData = {
    title: titleInput.value,
    description: descriptionInput.value,
    questions: [...questionsContainer.children].map((q) => ({
      text: q.querySelector('.question-text').value,
      type: q.querySelector('.question-type').value,
      options: [...q.querySelectorAll('.option-input')].map((input) => input.value).filter(Boolean),
      image: q.querySelector('.image-preview')?.src || null
    }))
  };
  localStorage.setItem('surveyData', JSON.stringify(surveyData));
}

function restoreFromLocalStorage() {
  const savedData = JSON.parse(localStorage.getItem('surveyData'));
  if (!savedData) return;

  titleInput.value = savedData.title || '';
  descriptionInput.value = savedData.description || '';

  savedData.questions.forEach((question) => addQuestion(question));
}

async function sendSurveyToAPI(surveyData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyData)
    });

    if (!response.ok) throw new Error('Failed to create survey');

    const result = await response.json();
    console.log('✅ Survey created:', result);
    alert('Survey created successfully!');
    localStorage.removeItem('surveyData');
    form.reset();
    questionsContainer.innerHTML = '';
  } catch (error) {
    console.error('❌ Error creating survey:', error);
    alert('Failed to create survey. Check the console for details.');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const surveyData = {
    title: titleInput.value,
    description: descriptionInput.value,
    questions: [...questionsContainer.children].map((q) => ({
      text: q.querySelector('.question-text').value,
      type: q.querySelector('.question-type').value,
      options: [...q.querySelectorAll('.option-input')].map((input) => input.value).filter(Boolean),
      image: q.querySelector('.image-preview')?.src || null
    }))
  };

  if (!surveyData.title || surveyData.questions.length === 0) {
    alert('Please add a title and at least one question.');
    return;
  }

  // Отправляем POST-запрос
  await sendSurveyToAPI(surveyData);
});

function addQuestion(question = {}) {
  questionIndex++;

  const questionDiv = document.createElement('div');
  questionDiv.className = 'border p-4 rounded bg-gray-100 draggable';
  questionDiv.setAttribute('draggable', 'true');
  questionDiv.dataset.index = questionIndex;

  questionDiv.innerHTML = `
    <label class="block font-semibold">Question:</label>
    <input type="text" class="question-text border p-2 rounded w-full mb-4" required value="${question.text || ''}" />

    <label class="block font-semibold">Type:</label>
    <select class="question-type border p-2 rounded w-full mb-4">
      <option value="text">Text</option>
      <option value="single-choice">Single Choice</option>
      <option value="multi-choice">Multiple Choice</option>
      <option value="image">Image Upload</option>
    </select>

    <div class="options-container ${question.type === 'text' || question.type === 'image' ? 'hidden' : ''}">
      <label class="block font-semibold">Options:</label>
      <button type="button" class="add-option bg-blue-300 px-2 py-1 rounded">➕ Add Option</button>
    </div>

    <div class="image-container ${question.type === 'image' ? '' : 'hidden'} mt-4">
      <label class="block font-semibold">Upload Image:</label>
      <input type="file" class="image-upload border p-2 rounded w-full" accept="image/*">
      <img class="image-preview mt-4 max-w-xs ${question.image ? '' : 'hidden'}" src="${question.image || ''}" alt="Preview" />
    </div>

    <button type="button" class="remove-question text-red-500 mt-4">Remove</button>
  `;

  const typeSelect = questionDiv.querySelector('.question-type');
  typeSelect.value = question.type || 'text';

  const optionsContainer = questionDiv.querySelector('.options-container');
  const imageContainer = questionDiv.querySelector('.image-container');
  const imageUpload = questionDiv.querySelector('.image-upload');
  const imagePreview = questionDiv.querySelector('.image-preview');

  if (question.options && question.options.length) {
    question.options.forEach((option) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'option-input border p-2 rounded w-full mt-2';
      input.value = option;
      optionsContainer.appendChild(input);
    });
  }

  typeSelect.addEventListener('change', () => {
    optionsContainer.classList.toggle('hidden', typeSelect.value === 'text' || typeSelect.value === 'image');
    imageContainer.classList.toggle('hidden', typeSelect.value !== 'image');
    saveToLocalStorage();
  });

  questionDiv.querySelector('.add-option').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input border p-2 rounded w-full mt-2';
    optionsContainer.appendChild(input);
    saveToLocalStorage();
  });

  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.classList.remove('hidden');
        saveToLocalStorage();
      };
      reader.readAsDataURL(file);
    }
  });

  questionDiv.querySelector('.remove-question').addEventListener('click', () => {
    questionDiv.remove();
    saveToLocalStorage();
  });

  setupDragAndDrop(questionDiv);
  questionsContainer.appendChild(questionDiv);

  saveToLocalStorage();
}

function setupDragAndDrop(element) {
  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', element.dataset.index);
    element.classList.add('opacity-50');
  });

  element.addEventListener('dragend', () => {
    element.classList.remove('opacity-50');
    saveToLocalStorage();
  });

  questionsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    const draggingElement = document.querySelector('.opacity-50');
    if (afterElement == null) {
      questionsContainer.appendChild(draggingElement);
    } else {
      questionsContainer.insertBefore(draggingElement, afterElement);
    }
    saveToLocalStorage();
  });
}

function getDragAfterElement(y) {
  const draggableElements = [...questionsContainer.querySelectorAll('.draggable:not(.opacity-50)')];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

restoreFromLocalStorage();
addQuestionBtn.addEventListener('click', () => addQuestion());