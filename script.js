const startDateInput = document.getElementById('startDate');
const timerDiv = document.getElementById('timer');

function updateTimer() {
  const val = startDateInput.value;
  if (!val) { timerDiv.textContent = 'No date set'; return; }
  // Use midnight of the selected day to avoid timezone shifts
  const start = new Date(val + 'T00:00:00');
  const diff = Date.now() - start.getTime();
  if (diff < 0) { timerDiv.textContent = 'Starts in the future'; return; }

  const days = Math.floor(diff / 86400000);
  const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
  const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
  const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');

  timerDiv.textContent = `${days}d ${hours}:${mins}:${secs}`;
}

startDateInput.addEventListener('change', () => {
  localStorage.setItem('startDate', startDateInput.value);
  updateTimer();
});

// load saved
if (localStorage.getItem('startDate')) startDateInput.value = localStorage.getItem('startDate');

updateTimer();
setInterval(updateTimer, 1000);
