const API_URL = 'https://questionnaire-app-n3a5.onrender.com/api/surveys';
const quizContainer = document.getElementById('quiz-container');

let currentPage = 1;
let isLoading = false; 
let hasMoreSurveys = true; 


async function fetchSurveys() {
  if (isLoading || !hasMoreSurveys) return; 

  isLoading = true; 

  try {
    const response = await fetch(`${API_URL}?page=${currentPage}`);
    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.statusText}`);

    const { surveys } = await response.json();

    if (surveys.length === 0) {
      hasMoreSurveys = false; 
    } else {
      displaySurveys(surveys);
      currentPage++; 
    }
  } catch (error) {
    console.error('Ошибка при загрузке опросов:', error);
  } finally {
    isLoading = false; 
  }
}


function displaySurveys(surveys) {
  surveys.forEach((survey) => {
    const surveyCard = document.createElement('div');
    surveyCard.className = 'card p-4 bg-white shadow rounded-lg';
    surveyCard.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${survey.title}</h3>
      <p class="mb-4">${survey.description}</p>
      <div class="flex gap-4">
        <button onclick="fillSurvey('${survey._id}')" class="btn btn-primary">Fill Survey</button>
        <button onclick="viewStats('${survey._id}')" class="btn btn-secondary">View Stats</button>
        <button onclick="confirmDelete('${survey._id}')" class="btn btn-danger">Delete</button>
      </div>
    `;


    quizContainer.appendChild(surveyCard);
  });
}


function fillSurvey(id) {
  window.location.href = `/survey.html?id=${id}`;
}


function viewStats(id) {
  window.location.href = `/stats.html?id=${id}`;
}


async function confirmDelete(id) {
  const deleteModal = document.getElementById('delete-modal');
  const confirmButton = document.getElementById('confirm-delete');
  const cancelButton = document.getElementById('cancel-delete');

  deleteModal.classList.remove('hidden');

  cancelButton.addEventListener('click', () => deleteModal.classList.add('hidden'));

  confirmButton.onclick = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Не удалось удалить опрос');

      deleteModal.classList.add('hidden');
      alert('Опрос удалён');
      resetSurveys(); 
    } catch (error) {
      console.error('Ошибка при удалении опроса:', error);
      alert('Не удалось удалить опрос.');
    }
  };
}


function resetSurveys() {
  quizContainer.innerHTML = '';
  currentPage = 1;
  hasMoreSurveys = true;
  fetchSurveys();
}


function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    fetchSurveys(); 
  }
}


document.addEventListener('DOMContentLoaded', () => {
  fetchSurveys(); 
  window.addEventListener('scroll', handleScroll); 
});
