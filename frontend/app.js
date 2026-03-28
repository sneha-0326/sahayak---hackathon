// ── State ──────────────────────────────────────────────────────────────────
const QUESTIONS = {
  'en-IN': [
    "Does she experience continuous leaking of urine or stool?",
    "Did she have a prolonged or difficult labour (more than 12 hours)?",
    "Was she unable to control urine or stool after delivery?",
    "Does she feel wetness or dampness in her undergarments throughout the day?",
    "Has she avoided social gatherings due to smell or leakage?",
    "Did she deliver at home without skilled assistance?",
    "Has she experienced sores or skin irritation in the genital area?"
  ],
  'hi-IN': [
    "क्या उसे पेशाब या मल का लगातार रिसाव होता है?",
    "क्या उसकी प्रसव पीड़ा लंबी या कठिन थी (12 घंटे से अधिक)?",
    "क्या वह प्रसव के बाद पेशाब या मल को नियंत्रित नहीं कर पाई?",
    "क्या उसे पूरे दिन अंडरगारमेंट में नमी या गीलापन महसूस होता है?",
    "क्या उसने गंध या रिसाव के कारण सामाजिक समारोहों से परहेज किया है?",
    "क्या उसने बिना कुशल सहायता के घर पर प्रसव किया?",
    "क्या उसे जननांग क्षेत्र में घाव या त्वचा में जलन हुई है?"
  ]
};

const ANSWERS = {
  'en-IN': { yes: 'Yes', sometimes: 'Sometimes', no: 'No' },
  'hi-IN': { yes: 'हाँ', sometimes: 'कभी-कभी', no: 'नहीं' }
};

const LANGUAGES = [
  { code: 'en-IN', label: 'English', name: 'English' },
  { code: 'hi-IN', label: 'हिंदी', name: 'Hindi' }
];

const state = {
  screen: 'dashboard',
  women: JSON.parse(localStorage.getItem('sahayak_women') || '[]'),
  selectedWoman: null,
  audioMode: false,
  selectedLang: 'hi-IN',
  questions: [],
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
    <div class="form-group">
      <label>State</label>
      <input type="text" id="f-state" placeholder="Enter state" />
    </div>
    <div class="form-group">
      <label>District</label>
      <input type="text" id="f-district" placeholder="Enter district" />
    </div>
    <div class="form-group">
      <label>City / Village</label>
      <input type="text" id="f-city" placeholder="Enter city or village" />
    </div>
    <div id="form-error" class="error-msg"></div>
    <button class="btn btn-primary" onclick="saveWoman()">💾 Save</button>
  `;
}

function saveWoman() {
  const name     = document.getElementById('f-name').value.trim();
  const age      = document.getElementById('f-age').value.trim();
  const phone    = document.getElementById('f-phone').value.trim();
  const state_   = document.getElementById('f-state').value.trim();
  const district = document.getElementById('f-district').value.trim();
  const city     = document.getElementById('f-city').value.trim();
  const err      = document.getElementById('form-error');

  if (!name || !age || !phone || !state_ || !district || !city) {
    err.textContent = 'Please fill in all fields.';
    return;
  }
  state.women.push({ name, age, phone, state: state_, district, city });
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
    <div class="detail-row"><span class="icon">🏛️</span> ${w.state || '—'}</div>
    <div class="detail-row"><span class="icon">📍</span> ${w.district || '—'}, ${w.city || '—'}</div>
    <br/>
    <button class="btn btn-primary" onclick="navigate('lang-select')">🏥 Start Visit</button>
  `;
}

function screenLangSelect() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('profile')">←</button>
      <span class="screen-title">Select Language</span>
    </div>
    <p style="color:#555;font-size:14px;margin-bottom:20px;text-align:center;">Choose the language for questions</p>
    <div class="lang-grid">
      ${LANGUAGES.map(l => `
        <button class="lang-btn ${state.selectedLang === l.code ? 'lang-btn-active' : ''}"
          onclick="selectLang('${l.code}')">
          <span class="lang-native">${l.label}</span>
          <span class="lang-name">${l.name}</span>
        </button>`).join('')}
    </div>
    <button class="btn btn-primary" style="margin-top:24px;" onclick="navigate('mode-select')">Next →</button>
  `;
}

function selectLang(code) {
  state.selectedLang = code;
  render();
}

function screenModeSelect() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('lang-select')">←</button>
      <span class="screen-title">Choose Mode</span>
    </div>
    <div class="mode-card" onclick="startScreening(true)">
      <div class="mode-icon">🔊</div>
      <h3>Audio Mode</h3>
      <p>Questions will be read aloud in selected language</p>
    </div>
    <div class="mode-card" onclick="startScreening(false)">
      <div class="mode-icon">👁️</div>
      <h3>Self Mode</h3>
      <p>Read questions on screen in selected language</p>
    </div>
  `;
}

function startScreening(audio) {
  state.audioMode = audio;
  state.currentQ = 0;
  state.answers = [];
  state.questions = QUESTIONS[state.selectedLang] || QUESTIONS['en-IN'];
  navigate('question');
  if (audio) speakQuestion();
}

function speakQuestion() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(state.questions[state.currentQ]);
  utt.lang = state.selectedLang;
  window.speechSynthesis.speak(utt);
}

function screenQuestion() {
  const total = state.questions.length;
  const current = state.currentQ + 1;
  const pct = ((current - 1) / total) * 100;
  const ans = ANSWERS[state.selectedLang] || ANSWERS['en-IN'];

  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('mode-select')">←</button>
      <span class="screen-title">Screening</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>
    <div class="progress-label">Question ${current} of ${total}</div>
    <div class="question-text">${state.questions[state.currentQ]}</div>
    <div class="answer-btns">
      <button class="btn btn-yes" onclick="answer('yes')">✅ ${ans.yes}</button>
      <button class="btn btn-sometimes" onclick="answer('sometimes')">🔄 ${ans.sometimes}</button>
      <button class="btn btn-no" onclick="answer('no')">❌ ${ans.no}</button>
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
    calculateRiskAndNavigate();
  }
}

async function calculateRiskAndNavigate() {
  try {
    const res = await fetch('http://localhost:3000/sync/calculate-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: state.answers })
    });
    const { risk } = await res.json();
    // backend returns "low"/"medium"/"high", map "medium" to "moderate" for UI
    state.riskLevel = risk === 'medium' ? 'moderate' : risk;
  } catch (e) {
    // fallback to local scoring if backend unreachable
    state.riskLevel = calcRisk(state.answers);
  }

  // save screening to DB
  const mode = state.audioMode ? 'voice' : 'text';
  const backendRisk = state.riskLevel === 'moderate' ? 'medium' : state.riskLevel;
  fetch('http://localhost:3000/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: state.answers, mode, risk: backendRisk })
  }).catch(() => {}); // fire and forget

  navigate('result');
}

function screenResult() {
  const risk = state.riskLevel;
  const config = {
    low:      { cls: 'risk-low',      icon: '😊', label: 'Low Risk',      desc: 'No immediate concern detected. Continue regular check-ups.' },
    moderate: { cls: 'risk-moderate', icon: '⚠️', label: 'Moderate Risk', desc: 'Some symptoms noted. Please follow up with a health worker.' },
    high:     { cls: 'risk-high',     icon: '🚨', label: 'High Risk',     desc: 'Significant symptoms detected. Please visit a hospital immediately.' }
  }[risk];

  const hospitalBtn = (risk === 'high' || risk === 'moderate')
    ? `<button class="btn btn-danger" onclick="navigate('map')">🏥 Find Hospital</button>`
    : '';

  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('mode-select')">←</button>
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
    <div id="map-container"></div>
  `;
}

function initMap() {
  if (!document.getElementById('map-container')) return;
  if (typeof showHospitalMap === 'function') {
    const w = state.women[state.selectedWoman];
    showHospitalMap('map-container', w?.district || '', w?.city || '', w?.state || '');
  } else {
    document.getElementById('map-container').innerHTML =
      '<p style="padding:20px;text-align:center;color:#888;">Map component not loaded.</p>';
  }
}

// ── Render ─────────────────────────────────────────────────────────────────
const screens = {
  'dashboard':   screenDashboard,
  'women-list':  screenWomenList,
  'add-woman':   screenAddWoman,
  'profile':     screenProfile,
  'lang-select': screenLangSelect,
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
