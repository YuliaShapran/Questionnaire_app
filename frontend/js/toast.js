
function showToast(message, type = 'success', duration = 5000) {
  const toastContainer = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.5s ease-in-out';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}
