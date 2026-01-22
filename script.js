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

// Embedded photos gallery — update with your actual image filenames in assets/images
const embeddedPhotos = [
  'assets/images/IMG_0151.JPG',
  'assets/images/IMG_0974.JPG',
  'assets/images/IMG_106.jpeg',
  'assets/images/IMG_3580.jpeg',
  'assets/images/IMG_3739.jpeg',
  'assets/images/IMG_3777.jpeg',
  'assets/images/IMG_3784.JPG',
  'assets/images/IMG_1096.jpeg'
];

const photoList = document.getElementById('photoList');

// Rotating gallery: show a few thumbnails at a time
const VISIBLE = 3;           // how many thumbnails visible at once
let startIndex = 0;

function showSlice() {
  if (!photoList) return;
  photoList.innerHTML = '';
  if (!embeddedPhotos.length) return;
  for (let i = 0; i < VISIBLE; i++) {
    const idx = (startIndex + i) % embeddedPhotos.length;
    const src = embeddedPhotos[idx];
    const item = document.createElement('div');
    item.className = 'gallery-item';

    // small staggered rotation for collage look
    const rot = (i - 1) * 3 + (Math.random()*2-1); // -4..+4 deg approx
    item.style.transform = `rotate(${rot}deg)`;

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.className = 'gallery-img';

    img.onerror = () => { item.remove(); console.warn('Failed to load image:', src); };

    item.appendChild(img);
    photoList.appendChild(item);
  }
  startIndex = (startIndex + 1) % embeddedPhotos.length;
}

// start immediately and then rotate
showSlice();
setInterval(showSlice, 3000);

// Also allow users to add local files via the input (keeps previous behavior)
const photosInput = document.getElementById('photos');
if (photosInput) {
  photosInput.addEventListener('change', e => {
    // If user selects files, show them instead of embedded ones
    if (!photoList) return;
    photoList.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      const item = document.createElement('div');
      item.setAttribute('role', 'listitem');
      reader.onload = ev => {
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.alt = file.name;
        img.style.width = '100%';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        item.appendChild(img);
      };
      reader.readAsDataURL(file);
      photoList.appendChild(item);
    });
  });
}

// Embedded videos (place your mp4/webm files in assets/videos and update the list)
const embeddedVideos = [
  'assets/videos/2e8c6585b1624a41b406a511f18d4de0.MOV',
  'assets/videos/b3f4cb6cae3841bdb7b7c28cbe1bef1e.MOV',
  'assets/videos/c6adac85e9c249bb90e78fd95712ffae.MOV',
  'assets/videos/4f723346a80a4b7fa75b6e039e98aa0d.MOV',
  'assets/videos/43c2849fdeb34ff4b43f5cf5e50aa6c9.MOV',
  'assets/videos/19939b62e16f4a0f9fd9fafdd4234bf1.mov',
  'assets/videos/16d7268da1894e87851f959850843353.mov',
  'assets/videos/227750ab73704f22b5b5ba0cb1ee9c77.MOV'
];

// --- Single-player video gallery with thumbnails (only one large video visible) ---
(function(){
  const videoList = document.getElementById('videoList');
  if (!videoList) return;

  // pause and clear any previously rendered video elements created by older code
  if (window.renderedVideos && Array.isArray(window.renderedVideos)) {
    window.renderedVideos.forEach(v=>{ try{ v.pause(); }catch(e){} });
  }

  videoList.innerHTML = '';
  const mainWrap = document.createElement('div');
  mainWrap.className = 'video-main';
  const mainV = document.createElement('video');
  mainV.id = 'mainVideo';
  mainV.controls = true;
  mainV.preload = 'metadata';
  mainV.className = 'gallery-video';
  mainV.playsInline = true;
  mainWrap.appendChild(mainV);

  const thumbs = document.createElement('div');
  thumbs.id = 'videoThumbs';
  thumbs.className = 'video-thumbs';

  videoList.appendChild(mainWrap);
  videoList.appendChild(thumbs);

  // build thumbnails
  embeddedVideos.forEach((src, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb-btn';
    btn.dataset.src = src;
    btn.dataset.index = idx;

    const tv = document.createElement('video');
    tv.src = src;
    tv.muted = true;
    tv.preload = 'metadata';
    tv.className = 'thumb-video';
    tv.playsInline = true;

    // ensure small size by CSS; don't autoplay these thumbnails
    btn.appendChild(tv);

    btn.addEventListener('click', () => {
      // set main src and play
      if (mainV.src !== src) mainV.src = src;
      mainV.play().catch(()=>{});
      // mark active
      Array.from(thumbs.children).forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      window._currentThumb = idx;
    });

    thumbs.appendChild(btn);
  });

  // sequence: when main ends, advance to next thumbnail
  function playNext(){
    const children = Array.from(thumbs.children);
    if (!children.length) return;
    let next = (typeof window._currentThumb === 'number') ? (window._currentThumb + 1) % children.length : 0;
    const btn = children[next];
    if (btn) btn.click();
  }

  mainV.addEventListener('ended', playNext);

  // start with first video loaded but not autoplayed (user gesture may be needed)
  if (embeddedVideos.length) {
    mainV.src = embeddedVideos[0];
    // mark first thumb active
    if (thumbs.children[0]) thumbs.children[0].classList.add('active');
    window._currentThumb = 0;
  }

  // expose for debugging/cleanup
  window._mainVideo = mainV;
  window._videoThumbs = thumbs;
})();
