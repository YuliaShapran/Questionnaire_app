
const themeToggleBtn = document.getElementById('theme-toggle');

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = 'Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggleBtn.textContent = 'Dark Mode';
  }

  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  setTheme(currentTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  themeToggleBtn.addEventListener('click', toggleTheme);
});
