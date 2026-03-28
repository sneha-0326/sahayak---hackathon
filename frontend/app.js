// ── State ──────────────────────────────────────────────────────────────────
const state = {
  screen: 'dashboard',
  women: JSON.parse(localStorage.getItem('sahayak_women') || '[]'),
  selectedWoman: null,
  audioMode: false,
  questions: [
    "Does she experience continuous leaking of urine or stool?",
    "Did she have a prolonged or difficult labour (more than 12 hours)?",
    "Was she unable to control urine or stool after delivery?",
    "Does she feel wetness or dampness in her undergarments throughout the day?",
    "Has she avoided social gatherings due to smell or leakage?",
    "Did she deliver at home without skilled assistance?",
    "Has she experienced sores or skin irritation in the genital area?"
  ],
  currentQ: 0,
  answers: [],
  riskLevel: null,
  lastScreen: 'result'
};

function saveWomen() {
  localStorage.setItem('sahayak_women', JSON.stringify(state.women));
}

// ── Router ─────────────────────────────────────────────────────────────────
function navigate(screen, extra = {}) {
  Object.assign(state, extra);
  state.screen = screen;
  render();
}

// ── Risk Calculator ────────────────────────────────────────────────────────
function calcRisk(answers) {
  const score = answers.reduce((s, a) => {
    if (a === 'yes') return s + 2;
    if (a === 'sometimes') return s + 1;
    return s;
  }, 0);
  if (score >= 8) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

// ── Screens ────────────────────────────────────────────────────────────────
function screenDashboard() {
  return `
    <div class="dashboard-logo">
      <div class="logo-icon">🤰</div>
      <h1>Sahayak</h1>
      <p>ASHA Health Screening App</p>
    </div>
    <div class="dashboard-btns">
      <button class="btn btn-primary" onclick="navigate('add-woman')">➕ Add Woman</button>
      <button class="btn btn-secondary" onclick="navigate('women-list')">👩 View Women</button>
    </div>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">📋</div>
        <h4>Patient Records</h4>
        <p>Register and manage women's profiles with name, age and contact details</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔊</div>
        <h4>Dual Screening Modes</h4>
        <p>Audio mode reads questions aloud, or Self mode lets the woman read and answer on her own</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h4>Risk Assessment</h4>
        <p>Automatic risk scoring — Low, Moderate or High based on responses</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🏥</div>
        <h4>Hospital Finder</h4>
        <p>Locate nearby hospitals instantly for high-risk cases</p>
      </div>
    </div>
  `;
}

function screenWomenList() {
  const items = state.women.length
    ? state.women.map((w, i) => `
        <button class="woman-item" onclick="navigate('profile', {selectedWoman: ${i}})">
          <div class="woman-avatar">👩</div>
          <div class="woman-info">
            <strong>${w.name}</strong>
            <span>Age: ${w.age}</span>
          </div>
        </button>`).join('')
    : `<p class="empty-msg">No women registered yet.<br/>Tap "Add Woman" to get started.</p>`;

  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('dashboard')">←</button>
      <span class="screen-title">Women</span>
    </div>
    ${items}
  `;
}

function screenAddWoman() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('dashboard')">←</button>
      <span class="screen-title">Add Woman</span>
    </div>
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" id="f-name" placeholder="Enter name" />
    </div>
    <div class="form-group">
      <label>Age</label>
      <input type="number" id="f-age" placeholder="Enter age" min="10" max="80" />
    </div>
    <div class="form-group">
      <label>Phone Number</label>
      <input type="tel" id="f-phone" placeholder="Enter phone number" />
    </div>
    <div id="form-error" class="error-msg"></div>
    <button class="btn btn-primary" onclick="saveWoman()">💾 Save</button>
  `;
}

function saveWoman() {
  const name  = document.getElementById('f-name').value.trim();
  const age   = document.getElementById('f-age').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const err   = document.getElementById('form-error');

  if (!name || !age || !phone) {
    err.textContent = 'Please fill in all fields.';
    return;
  }
  state.women.push({ name, age, phone });
  saveWomen();
  navigate('women-list');
}

function screenProfile() {
  const w = state.women[state.selectedWoman];
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('women-list')">←</button>
      <span class="screen-title">Profile</span>
    </div>
    <div class="profile-avatar">
      <div class="avatar-circle">👩</div>
      <h2>${w.name}</h2>
    </div>
    <div class="detail-row"><span class="icon">🎂</span> Age: ${w.age}</div>
    <div class="detail-row"><span class="icon">📞</span> ${w.phone}</div>
    <br/>
    <button class="btn btn-primary" onclick="navigate('mode-select')">🏥 Start Visit</button>
  `;
}

function screenModeSelect() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('profile')">←</button>
      <span class="screen-title">Choose Mode</span>
    </div>
    <div class="mode-card" onclick="startScreening(true)">
      <div class="mode-icon">🔊</div>
      <h3>Audio Mode</h3>
      <p>Questions will be read aloud</p>
    </div>
    <div class="mode-card" onclick="startScreening(false)">
      <div class="mode-icon">👁️</div>
      <h3>Self Mode</h3>
      <p>Read questions on screen</p>
    </div>
  `;
}

function startScreening(audio) {
  state.audioMode = audio;
  state.currentQ = 0;
  state.answers = [];
  navigate('question');
  if (audio) speakQuestion();
}

function speakQuestion() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(state.questions[state.currentQ]);
  utt.lang = 'en-IN';
  window.speechSynthesis.speak(utt);
}

function screenQuestion() {
  const total = state.questions.length;
  const current = state.currentQ + 1;
  const pct = ((current - 1) / total) * 100;

  return `
    <div class="screen-header">
      <span class="screen-title">Screening</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>
    <div class="progress-label">Question ${current} of ${total}</div>
    <div class="question-text">${state.questions[state.currentQ]}</div>
    <div class="answer-btns">
      <button class="btn btn-yes" onclick="answer('yes')">✅ Yes</button>
      <button class="btn btn-sometimes" onclick="answer('sometimes')">🔄 Sometimes</button>
      <button class="btn btn-no" onclick="answer('no')">❌ No</button>
    </div>
  `;
}

function answer(val) {
  state.answers.push(val);
  if (state.currentQ + 1 < state.questions.length) {
    state.currentQ++;
    render();
    if (state.audioMode) speakQuestion();
  } else {
    state.riskLevel = calcRisk(state.answers);
    navigate('result');
  }
}

function screenResult() {
  const risk = state.riskLevel;
  const config = {
    low:      { cls: 'risk-low',      icon: '😊', label: 'Low Risk',      desc: 'No immediate concern detected. Continue regular check-ups.' },
    moderate: { cls: 'risk-moderate', icon: '⚠️', label: 'Moderate Risk', desc: 'Some symptoms noted. Please follow up with a health worker.' },
    high:     { cls: 'risk-high',     icon: '🚨', label: 'High Risk',     desc: 'Significant symptoms detected. Please visit a hospital immediately.' }
  }[risk];

  const hospitalBtn = risk === 'high'
    ? `<button class="btn btn-danger" onclick="navigate('map')">🏥 Find Hospital</button>`
    : '';

  return `
    <div class="screen-header">
      <span class="screen-title">Result</span>
    </div>
    <div class="result-badge">
      <div class="risk-circle ${config.cls}">
        <span class="risk-icon">${config.icon}</span>
        <span class="risk-label">${config.label}</span>
      </div>
    </div>
    <p class="result-desc">${config.desc}</p>
    ${hospitalBtn}
    <button class="btn btn-outline" onclick="navigate('dashboard')">🏠 Back to Home</button>
  `;
}

function screenMap() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('result')">←</button>
      <span class="screen-title">Nearby Hospitals</span>
    </div>
    <div id="map"></div>
    <div class="hospital-list" id="hospital-list">
      <p style="color:#888;font-size:14px;text-align:center;">Loading hospitals...</p>
    </div>
  `;
}

function initMap() {
  if (!document.getElementById('map')) return;

  if (!navigator.geolocation) {
    document.getElementById('map').innerHTML =
      '<p style="padding:20px;text-align:center;color:#888;">Location not supported by your browser.</p>';
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;

    // Load Leaflet dynamically
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => renderMap(lat, lng);
      document.head.appendChild(script);
    } else {
      renderMap(lat, lng);
    }
  }, () => {
    document.getElementById('map').innerHTML =
      '<p style="padding:20px;text-align:center;color:#c62828;">Please enable location access to see nearby hospitals.</p>';
  });
}

function renderMap(lat, lng) {
  const map = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup('📍 You are here').openPopup();

  // Fetch hospitals from backend
  fetch('/api/hospitals')
    .then(r => r.json())
    .then(hospitals => {
      const list = document.getElementById('hospital-list');
      if (!list) return;
      list.innerHTML = '';
      hospitals.forEach(h => {
        if (h.lat && h.lng) {
          L.marker([h.lat, h.lng])
            .addTo(map)
            .bindPopup(`🏥 ${h.name}`);
        }
        list.innerHTML += `
          <div class="hospital-item">
            <span class="icon">🏥</span>
            <span>${h.name}${h.distance ? ' — ' + h.distance : ''}</span>
          </div>`;
      });
    })
    .catch(() => {
      const list = document.getElementById('hospital-list');
      if (list) list.innerHTML = '<p style="color:#888;font-size:14px;text-align:center;">Could not load hospital data.</p>';
    });
}

// ── Render ─────────────────────────────────────────────────────────────────
const screens = {
  'dashboard':   screenDashboard,
  'women-list':  screenWomenList,
  'add-woman':   screenAddWoman,
  'profile':     screenProfile,
  'mode-select': screenModeSelect,
  'question':    screenQuestion,
  'result':      screenResult,
  'map':         screenMap
};

function render() {
  const app = document.getElementById('app');
  app.innerHTML = screens[state.screen]();
  if (state.screen === 'map') initMap();
}

render();
