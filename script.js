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

// Embedded photos gallery — replace or add filenames from assets/images
const embeddedPhotos = [
  'assets/images/06DA1D07-2E0D-4A26-852C-815A3750B5FB_1_105_c.jpeg'
];

const photoList = document.getElementById('photoList');

function renderEmbeddedPhotos() {
  if (!photoList) return;
  photoList.innerHTML = '';
  embeddedPhotos.forEach((dataUrl, i) => {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.style.display = 'block';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Embedded photo ${i + 1}`;
    img.style.width = '100%';
    img.style.height = '150px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';

    item.appendChild(img);
    photoList.appendChild(item);
  });
}

// Render embedded images on load
renderEmbeddedPhotos();
