
const API_URL = 'http://localhost:3000/api/surveys';
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get('id');

const quizTitle = document.getElementById('quiz-title');
const averageTimeElem = document.getElementById('average-time');
const submissionsChartElem = document.getElementById('submissions-chart');
const questionChartsContainer = document.getElementById('question-charts');


const charts = [];


async function fetchStatistics() {
  try {
    const response = await fetch(`${API_URL}/${quizId}/stats`);
    const stats = await response.json();
    renderStatistics(stats);
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

function clearCharts() {
  charts.forEach(chart => chart.destroy());
  charts.length = 0;
}


function renderStatistics(stats) {
  clearCharts();

  quizTitle.textContent = stats.title;
  averageTimeElem.textContent = `Average completion time: ${stats.averageTime} seconds`;

  renderSubmissionsChart(stats.submissions);
  questionChartsContainer.innerHTML = '';

  stats.questions.forEach((question, index) => {
    createQuestionChart(question, index);
  });
}

function renderSubmissionsChart(submissions) {
  if (submissionsChartElem.chart) {
    submissionsChartElem.chart.destroy();
  }

  const chart = new Chart(submissionsChartElem.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Day', 'Week', 'Month'],
      datasets: [{
        label: 'Submissions',
        data: [submissions.day, submissions.week, submissions.month],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
      }]
    },
    options: {
      responsive: true, 
      maintainAspectRatio: true, 
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  submissionsChartElem.chart = chart; 
  charts.push(chart);
}

function createQuestionChart(question, index) {
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-item';
  chartContainer.innerHTML = `
    <h3 class="text-lg font-semibold mb-4">${question.text}</h3>
    <div class="chart-wrapper">
      <canvas id="question-chart-${index}"></canvas>
    </div>
  `;
  questionChartsContainer.appendChild(chartContainer);

  const ctx = document.getElementById(`question-chart-${index}`);
  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: question.options.map(o => o.text),
      datasets: [{
        label: 'Responses',
        data: question.options.map(o => o.count),
        backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
        legend: { position: 'right' }
      }
    }
  });

  charts.push(chart);
}

fetchStatistics();
