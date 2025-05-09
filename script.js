let loggedIn = false;
let videos = [];
let subscribers = [];
let currentUser = {
  username: '',
  profilePic: ''
};

let currentVideoIndex = null;

// Functie om te controleren of er al een ingelogde gebruiker is bij het laden van de pagina
window.onload = function() {
  checkLogin();
};

// Controleer bij het laden van de pagina of de gebruiker al is ingelogd
function checkLogin() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    loggedIn = true;
    document.getElementById('creatorProfilePic').src = currentUser.profilePic;
    document.getElementById('creatorProfilePic').style.display = 'block';
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('dashboardBtn').classList.remove('hidden');
    document.getElementById('homeBtn').classList.remove('hidden');
    showHome();
  }
}

function toggleLogin() {
  document.getElementById('loginSection').classList.toggle('hidden');
}

function login() {
  const username = document.getElementById('username').value;
  const fileInput = document.getElementById('profilePic');

  if (!username || fileInput.files.length === 0) {
    alert("Vul alle velden in en kies een profielfoto.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentUser.username = username;
    currentUser.profilePic = reader.result;
    document.getElementById('creatorProfilePic').src = reader.result;
    document.getElementById('creatorProfilePic').style.display = 'block';
    document.getElementById('editUsername').value = username;

    // Bewaar de gebruiker in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loggedIn = true;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('dashboardBtn').classList.remove('hidden');
    document.getElementById('homeBtn').classList.remove('hidden');
    showHome();
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function updateProfile() {
  currentUser.username = document.getElementById('editUsername').value;
  const picInput = document.getElementById('editProfilePic');
  if (picInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      currentUser.profilePic = reader.result;
      document.getElementById('creatorProfilePic').src = reader.result;
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    };
    reader.readAsDataURL(picInput.files[0]);
  }
}

function uploadVideo() {
  const title = document.getElementById('videoTitle').value;
  const videoFile = document.getElementById('videoFile').files[0];
  const thumbnailFile = document.getElementById('thumbnailFile').files[0];

  if (!title || !videoFile || !thumbnailFile) {
    alert("Vul alle velden in en kies bestanden.");
    return;
  }

  const readerThumb = new FileReader();
  readerThumb.onload = () => {
    const thumbURL = readerThumb.result;
    const videoURL = URL.createObjectURL(videoFile);

    const videoObj = {
      title,
      thumb: thumbURL,
      src: videoURL,
      views: 0,
      likes: 0,
      creator: currentUser.username,
      likedByUser: false,  // Track if the current user has liked this video
    };
    videos.push(videoObj);
    renderVideos();
    renderMyVideos();
  };
  readerThumb.readAsDataURL(thumbnailFile);
}

function renderVideos() {
  const container = document.getElementById('allVideos');
  container.innerHTML = '';
  videos.forEach((vid, index) => {
    const div = document.createElement('div');
    div.className = 'videoCard';
    div.innerHTML = `
      <h4>${vid.title}</h4>
      <img src="${vid.thumb}" onclick="watchVideo(${index})" />
      <p>👀 ${vid.views} | 👍 ${vid.likes}</p>
      <button class="btn-primary" onclick="subscribe('${vid.creator}', ${index})">Abonneer</button>
    `;
    container.appendChild(div);
  });
}

function renderMyVideos() {
  const container = document.getElementById('myVideos');
  container.innerHTML = '';
  videos.filter(v => v.creator === currentUser.username).forEach((vid) => {
    const div = document.createElement('div');
    div.className = 'videoCard';
    div.innerHTML = `
      <h4>${vid.title}</h4>
      <img src="${vid.thumb}" />
      <p>👀 ${vid.views} | 👍 ${vid.likes}</p>
    `;
    container.appendChild(div);
  });
}

function watchVideo(index) {
  const video = videos[index];
  currentVideoIndex = index;  // Track the currently watched video
  const videoContainer = document.getElementById('videoContainer');
  video.views++;  // Increase views
  videoContainer.innerHTML = `
    <h3>${video.title}</h3>
    <video controls>
      <source src="${video.src}" type="video/mp4" />
    </video>
  `;
  document.getElementById('videoPage').classList.remove('hidden');
  renderVideos();
  
  // Reset like and subscribe buttons to default state
  document.getElementById('likeBtn').classList.remove('liked');
  document.getElementById('subscribeBtn').classList.remove('subscribed');
  
  // Set initial like and subscribe button state
  if (video.likedByUser) {
    document.getElementById('likeBtn').classList.add('liked');
  }
}

function likeVideo() {
  const video = videos[currentVideoIndex];
  if (!video.likedByUser) {
    video.likes++;  // Increment likes
    video.likedByUser = true;  // Track that the user liked this video
    document.getElementById('likeBtn').classList.add('liked');
  }
}

function subscribe(creator, videoIndex) {
  // Check if user is already subscribed to this creator
  if (!subscribers.includes(creator)) {
    subscribers.push(creator);
    document.getElementById('subscriberCount').textContent = subscribers.length;
    document.getElementById('subscribeBtn').classList.add('subscribed');
    // Now, show more videos from this creator
    showHome(); // Show more videos of the creator who was subscribed to
  } else {
    alert("Je bent al geabonneerd op deze creator.");
  }
}

function goBack() {
  document.getElementById('videoPage').classList.add('hidden');
  showHome();
}

function showDashboard() {
  document.getElementById('creatorDashboard').classList.remove('hidden');
  document.getElementById('homePage').classList.add('hidden');
}

function showHome() {
  document.getElementById('creatorDashboard').classList.add('hidden');
  document.getElementById('homePage').classList.remove('hidden');
  renderVideos();
}
