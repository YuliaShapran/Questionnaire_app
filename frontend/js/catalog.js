
const API_URL = 'https://questionnaire-app-n3a5.onrender.com/api/surveys';
const quizContainer = document.getElementById('quiz-container');
const skeletonContainer = document.getElementById('skeleton-container');


const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let currentPage = 1;
const limit = 6;
let isLoading = false;
let hasMore = true;
let deleteSurveyId = null;


function openDeleteModal(surveyId) {
  deleteSurveyId = surveyId;
  deleteModal.classList.remove('hidden');
}


function closeDeleteModal() {
  deleteSurveyId = null;
  deleteModal.classList.add('hidden');
}


async function deleteSurvey() {
  if (!deleteSurveyId) return;

  try {
    const response = await fetch(`${API_URL}/${deleteSurveyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete survey');
    }

    showToast('🗑️ Survey deleted successfully!', 'success');
    quizContainer.innerHTML = ''; 
    currentPage = 1;
    fetchSurveys(currentPage); 
  } catch (error) {
    console.error('Error deleting survey:', error);
    showToast('Failed to delete survey.', 'error');
  } finally {
    closeDeleteModal();
  }
}


confirmDeleteBtn.addEventListener('click', deleteSurvey);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);


function showSkeletons(count = 3) {
  skeletonContainer.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const skeleton = `
      <div class="card skeleton">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-btn-container">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
    `;
    skeletonContainer.insertAdjacentHTML('beforeend', skeleton);
  }

  skeletonContainer.classList.remove('hidden');
}


function hideSkeletons() {
  skeletonContainer.classList.add('hidden');
}


async function fetchSurveys(page) {
  if (isLoading || !hasMore) return;
  isLoading = true;
  showSkeletons();

  try {
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
    const { surveys } = await response.json();

    if (surveys.length < limit) hasMore = false;
    renderSurveys(surveys);
  } catch (error) {
    console.error('Error loading surveys:', error);
    showToast('Failed to load surveys.', 'error');
  } finally {
    isLoading = false;
    hideSkeletons();
  }
}


function renderSurveys(surveys) {
  surveys.forEach((survey) => {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
      <h2>${survey.title}</h2>
      <p>${survey.description}</p>
      <div class="btn-container">
        <a href="fill.html?id=${survey._id}" class="btn btn-secondary">Fill Survey</a>
        <a href="stats.html?id=${survey._id}" class="btn btn-primary">View Stats</a>
        <button class="btn btn-danger delete-btn" data-id="${survey._id}">Delete</button>
      </div>
    `;

    card.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(survey._id));
    quizContainer.appendChild(card);
  });
}


function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    fetchSurveys(++currentPage);
  }
}


document.addEventListener('scroll', handleScroll);
fetchSurveys(currentPage);
