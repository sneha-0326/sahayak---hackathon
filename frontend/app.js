// ── State ──────────────────────────────────────────────────────────────────
const QUESTIONS = {
  'en-IN': [
    "When not urinating, do you experience continuously dripping urine through the birth canal that you cannot stop?",
    "Does this continuously dripping urine occur both all day and all night?",
    "Do you leak urine all the time, wetting your clothing both day and night?",
    "Do you experience sudden leakage of large amounts of urine?",
    "Does this urine leakage occur when you are NOT coughing or sneezing?",
    "Does this urine leakage occur without feeling a sudden urge to urinate?",
    "Does urine leak when you are asleep?",
    "Do you leak urine for no obvious reason?",
    "When not having a bowel movement, do you experience feces passing through the birth canal?",
    "Do you have problems with leakage of feces from the anus that you cannot control?",
    "Did you have a very long or difficult labor (more than 12 hours) during your last delivery?",
    "Did you deliver your baby at home without a trained birth attendant?",
    "Were you below 18 years of age at the time of your first delivery?",
    "Have you ever had a stillbirth (baby born without signs of life)?",
    "Have you ever had a C-section or delivery with forceps?",
    "Do you lose urine during coughing, sneezing, or physical exertion?",
    "Do you experience a strong sudden urge to urinate and leak before reaching the toilet?",
    "Have you avoided social gatherings because of smell or wetness?",
    "Do you use extra cloths or pads to manage constant wetness or leakage?",
    "Do you feel burning, soreness, or irritation in your private area that does not go away?"
  ],
  'hi-IN': [
    "जब आप पेशाब नहीं कर रही हों, तो क्या जन्म नलिका से पेशाब लगातार टपकता रहता है जिसे आप रोक नहीं सकतीं?",
    "क्या यह लगातार टपकना दिन और रात दोनों समय होता है?",
    "क्या पेशाब इतना लीक होता है कि दिन-रात कपड़े गीले रहते हैं?",
    "क्या कभी अचानक बड़ी मात्रा में पेशाब निकल जाता है?",
    "क्या यह रिसाव खांसने या छींकने के बिना होता है?",
    "क्या पेशाब करने की इच्छा महसूस हुए बिना रिसाव होता है?",
    "क्या सोते समय पेशाब लीक होता है?",
    "क्या बिना किसी कारण के पेशाब लीक होता है?",
    "क्या शौच न करते समय भी जन्म नलिका से मल निकलता है?",
    "क्या गुदा से मल का रिसाव होता है जिसे आप नियंत्रित नहीं कर सकतीं?",
    "क्या आपकी पिछली डिलीवरी में बहुत लंबी या कठिन प्रसव पीड़ा (12 घंटे से अधिक) हुई थी?",
    "क्या आपने घर पर बिना प्रशिक्षित दाई के बच्चे को जन्म दिया?",
    "क्या पहली डिलीवरी के समय आपकी उम्र 18 साल से कम थी?",
    "क्या आपका कभी मृत शिशु (stillbirth) हुआ है?",
    "क्या आपकी कभी सिजेरियन या फोर्सेप्स डिलीवरी हुई है?",
    "क्या खांसने, छींकने या शारीरिक मेहनत के दौरान पेशाब निकल जाता है?",
    "क्या अचानक तेज पेशाब की इच्छा होती है और शौचालय पहुंचने से पहले रिसाव हो जाता है?",
    "क्या आपने गंध या गीलेपन के कारण सामाजिक समारोहों में जाना बंद कर दिया है?",
    "क्या आप लगातार गीलेपन को संभालने के लिए अतिरिक्त कपड़े या पैड उपयोग करती हैं?",
    "क्या आपके निजी अंगों में जलन, दर्द या जलन होती है जो ठीक नहीं होती?"
  ]
};

const ANSWERS = {
  'en-IN': { yes: 'Yes, I face this', sometimes: 'Sometimes this happens', no: "No, I don't face this", notsure: "I'm not sure" },
  'hi-IN': { yes: 'हाँ, मुझे यह होता है', sometimes: 'कभी-कभी होता है', no: 'नहीं, मुझे यह नहीं होता', notsure: 'मुझे पता नहीं' }
};

const LANGUAGES = [
  { code: 'en-IN', label: 'English', name: 'English' },
  { code: 'hi-IN', label: 'हिंदी', name: 'Hindi' }
];

const state = {
  screen: 'landing',
  currentUser: JSON.parse(localStorage.getItem('sahayak_user') || 'null'),
  women: [],
  selectedWoman: null,
  audioMode: false,
  selectedLang: 'hi-IN',
  questions: [],
  currentQ: 0,
  answers: [],
  riskLevel: null,
  lastScreen: 'result',
  vitals: {}
};

function goHome() {
  const role = state.currentUser?.role;
  navigate(role === 'woman' ? 'woman-dashboard' : 'dashboard');
}

function saveWomen() {
  // no-op — data is now stored in MongoDB
}

async function loadWomen() {
  try {
    const ashaId = state.currentUser?.id;
    const res = await fetch(`http://localhost:3000/patients?ashaId=${ashaId}`);
    state.women = await res.json();
  } catch (e) {
    state.women = [];
  }
}

function saveUser(user) {
  state.currentUser = user;
  localStorage.setItem('sahayak_user', JSON.stringify(user));
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem('sahayak_user');
  navigate('landing');
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
    if (a === 'notsure') return s + 1;
    return s;
  }, 0);
  if (score >= 8) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

// ── Screens ────────────────────────────────────────────────────────────────
function screenLanding() {
  return `
    <div class="landing-hero">
      <div class="landing-logo">🤰</div>
      <h1 class="landing-title">Sahayak</h1>
      <p class="landing-tagline">Empowering ASHA Workers · Protecting Women's Health</p>
    </div>

    <div class="landing-features">
      <div class="landing-feature-item">
        <span>🏥</span>
        <div>
          <strong>Early Detection</strong>
          <p>Screen for obstetric fistula with culturally sensitive questions</p>
        </div>
      </div>
      <div class="landing-feature-item">
        <span>🔊</span>
        <div>
          <strong>Audio & Self Mode</strong>
          <p>Works for all literacy levels in Hindi & English</p>
        </div>
      </div>
      <div class="landing-feature-item">
        <span>📍</span>
        <div>
          <strong>Find Nearby Hospitals</strong>
          <p>Instantly locate hospitals based on patient location</p>
        </div>
      </div>
      <div class="landing-feature-item">
        <span>🔒</span>
        <div>
          <strong>Private & Secure</strong>
          <p>All answers are confidential and securely stored</p>
        </div>
      </div>
    </div>

    <div class="landing-divider">Login as</div>
    <button class="btn btn-primary" onclick="navigate('login', {loginRole:'asha'})">👩‍⚕️ ASHA Worker</button>
    <button class="btn btn-secondary" style="margin-top:12px;" onclick="navigate('login', {loginRole:'woman'})">👩 Woman / Patient</button>
    <p style="text-align:center;margin-top:16px;font-size:14px;color:#888;">New here? <a href="#" onclick="navigate('signup')" style="color:#2e7d32;font-weight:600;">Create Account</a></p>
  `;
}

function screenLogin() {
  const role = state.loginRole || 'asha';
  const title = role === 'asha' ? 'ASHA Worker Login' : 'Woman Login';
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('landing')">←</button>
      <span class="screen-title">${title}</span>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="l-email" placeholder="Enter email" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="l-password" placeholder="Enter password" />
    </div>
    <div id="login-error" class="error-msg"></div>
    <button class="btn btn-primary" onclick="doLogin('${role}')">Login</button>
    <p style="text-align:center;margin-top:16px;font-size:14px;color:#888;">No account? <a href="#" onclick="navigate('signup')" style="color:#2e7d32;font-weight:600;">Sign Up</a></p>
  `;
}

async function doLogin(role) {
  const email = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-password').value.trim();
  const err = document.getElementById('login-error');

  if (!email || !password) { err.textContent = 'Please fill in all fields.'; return; }

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.message; return; }
    if (data.user.role !== role) { err.textContent = `This account is not registered as ${role === 'asha' ? 'an ASHA Worker' : 'a Woman'}.`; return; }
    saveUser(data.user);
    navigate(role === 'asha' ? 'dashboard' : 'woman-dashboard');
  } catch (e) {
    err.textContent = 'Could not connect to server. Please try again.';
  }
}

function screenSignup() {
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('landing')">←</button>
      <span class="screen-title">Sign Up</span>
    </div>
    <div class="form-group">
      <label>Register as</label>
      <div style="display:flex;gap:12px;margin-bottom:4px;">
        <button id="role-asha" class="role-btn role-btn-active" onclick="setSignupRole('asha')">👩‍⚕️ ASHA Worker</button>
        <button id="role-woman" class="role-btn" onclick="setSignupRole('woman')">👩 Woman</button>
      </div>
      <input type="hidden" id="s-role" value="asha" />
    </div>
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" id="s-name" placeholder="Enter your name" />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="s-email" placeholder="Enter email" />
    </div>
    <div class="form-group">
      <label>Phone Number</label>
      <input type="tel" id="s-phone" placeholder="Enter phone number" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="s-password" placeholder="Create password" />
    </div>
    <div class="form-group">
      <label>Confirm Password</label>
      <input type="password" id="s-confirm" placeholder="Confirm password" />
    </div>
    <div id="signup-error" class="error-msg"></div>
    <button class="btn btn-primary" onclick="doSignup()">Create Account</button>
  `;
}

function setSignupRole(role) {
  document.getElementById('s-role').value = role;
  document.getElementById('role-asha').className = 'role-btn' + (role === 'asha' ? ' role-btn-active' : '');
  document.getElementById('role-woman').className = 'role-btn' + (role === 'woman' ? ' role-btn-active' : '');
}

async function doSignup() {
  const name     = document.getElementById('s-name').value.trim();
  const email    = document.getElementById('s-email').value.trim();
  const phone    = document.getElementById('s-phone').value.trim();
  const password = document.getElementById('s-password').value.trim();
  const confirm  = document.getElementById('s-confirm').value.trim();
  const role     = document.getElementById('s-role').value;
  const err      = document.getElementById('signup-error');

  if (!name || !email || !phone || !password || !confirm) { err.textContent = 'Please fill in all fields.'; return; }
  if (password !== confirm) { err.textContent = 'Passwords do not match.'; return; }
  if (password.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.message; return; }
    saveUser(data.user);
    navigate(role === 'asha' ? 'dashboard' : 'woman-dashboard');
  } catch (e) {
    err.textContent = 'Could not connect to server. Please try again.';
  }
}

function screenWomanDashboard() {
  const user = state.currentUser;
  return `
    <div class="landing-hero" style="padding:16px 0 20px;">
      <div class="landing-logo">👋</div>
      <h2 style="font-size:22px;color:#1b5e20;font-weight:700;">Welcome, ${user?.name || 'User'}</h2>
      <p style="font-size:13px;color:#388e3c;">Ready for your health check?</p>
    </div>
    <div class="comfort-card">
      <div class="comfort-icon">💛</div>
      <h3>About This Screening</h3>
      <p>Answer a few simple questions about your health. Your answers are completely private and will help identify if you need medical support.</p>
    </div>
    <button class="btn btn-primary" onclick="navigate('add-woman')">📋 Update My Details</button>
    <button class="btn btn-secondary" style="margin-top:12px;" onclick="startWomanScreening()">▶️ Start Screening</button>
    <button class="btn btn-outline" style="margin-top:20px;" onclick="logout()">🚪 Logout</button>
  `;
}


async function startWomanScreening() {
  const user = state.currentUser;
  try {
    const res = await fetch(`http://localhost:3000/patients/${user.id}`);
    if (!res.ok) {
      alert('Please add your details first before starting the screening.');
      navigate('add-woman');
      return;
    }
    const patient = await res.json();
    if (!patient.age || !patient.district || !patient.city) {
      alert('Please complete your details first.');
      navigate('add-woman');
      return;
    }
    state.women = [patient];
    state.selectedWoman = 0;
    navigate('lang-select');
  } catch (e) {
    alert('Could not connect to server. Please try again.');
  }
}
function screenDashboard() {
  return `
    <div class="dashboard-logo">
      <div class="logo-icon">🤰</div>
      <h1>Sahayak</h1>
      <p>ASHA Health Screening App</p>
    </div>
    <div class="dashboard-btns">
      <button class="btn btn-primary" onclick="navigate('add-woman')">➕ Add Woman</button>
      <button class="btn btn-secondary" onclick="loadAndShowWomenList()">👩 View Women</button>
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
    <button class="btn btn-outline" style="margin-top:20px;" onclick="logout()">🚪 Logout</button>
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
      <button class="back-btn" onclick="goHome()">←</button>
      <span class="screen-title">Women</span>
    </div>
    ${items}
  `;
}

async function loadAndShowWomenList() {
  await loadWomen();
  navigate('women-list');
}

function screenAddWoman() {
  const isWoman = state.currentUser?.role === 'woman';
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="${isWoman ? "navigate('woman-dashboard')" : "goHome()"}">←</button>
      <span class="screen-title">Add ${isWoman ? 'My' : 'Woman\'s'} Details</span>
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

async function saveWoman() {
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

  try {
    const userId = state.currentUser?.role === 'woman' ? state.currentUser?.id : null;
    const ashaId = state.currentUser?.role === 'asha' ? state.currentUser?.id : null;
    const res = await fetch('http://localhost:3000/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ashaId, name, age, phone, state: state_, district, city })
    });
    if (!res.ok) { err.textContent = 'Could not save. Try again.'; return; }
    await loadWomen();
    if (state.currentUser?.role === 'woman') {
      navigate('woman-dashboard');
    } else {
      navigate('women-list');
    }
  } catch (e) {
    err.textContent = 'Could not connect to server.';
  }
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
  const isWoman = state.currentUser?.role === 'woman';
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="${isWoman ? "navigate('woman-dashboard')" : "navigate('profile')"}">←</button>
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
  navigate('comfort-intro');
}

function screenComfortIntro() {
  const isHindi = state.selectedLang === 'hi-IN';
  const title = isHindi ? 'आप अकेली नहीं हैं 💛' : 'You Are Not Alone 💛';
  const msg = isHindi
    ? 'प्रसव के बाद कई महिलाओं को ये समस्याएं होती हैं। यह सामान्य है और इसका इलाज संभव है। आपके जवाब पूरी तरह निजी हैं — कोई नहीं देखेगा।'
    : 'Many women face these problems after delivery. It is normal and treatable. Your answers are completely private — no one else will see them.';
  const btn = isHindi ? 'शुरू करें →' : 'Start →';

  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('mode-select')">←</button>
      <span class="screen-title">${isHindi ? 'जानकारी' : 'Before We Begin'}</span>
    </div>
    <div class="comfort-card">
      <div class="comfort-icon">🤝</div>
      <h3>${title}</h3>
      <p>${msg}</p>
    </div>
    <button class="btn btn-primary" onclick="beginQuestions()">${btn}</button>
  `;
}

function beginQuestions() {
  navigate('question');
  if (state.audioMode) speakQuestion();
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
      <button class="back-btn" onclick="goBackQuestion()">←</button>
      <span class="screen-title">Question ${current} of ${total}</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>
    <div class="question-text">${state.questions[state.currentQ]}</div>
    <div class="answer-btns">
      <button class="btn btn-yes" onclick="answer('yes')">✅ ${ans.yes}</button>
      <button class="btn btn-sometimes" onclick="answer('sometimes')">🔄 ${ans.sometimes}</button>
      <button class="btn btn-no" onclick="answer('no')">❌ ${ans.no}</button>
      <button class="btn btn-notsure" onclick="answer('notsure')">🤔 ${ans.notsure}</button>
    </div>
  `;
}

function goBackQuestion() {
  if (state.currentQ > 0) {
    state.currentQ--;
    state.answers.pop();
    render();
    if (state.audioMode) speakQuestion();
  } else {
    navigate('comfort-intro');
  }
}

function answer(val) {
  state.answers.push(val);
  if (state.currentQ + 1 < state.questions.length) {
    state.currentQ++;
    render();
    if (state.audioMode) speakQuestion();
  } else {
    navigate('vitals');
  }
}

async function calculateRiskAndNavigate() {
  // default fallback first
  state.riskLevel = calcRisk(state.answers);

  try {
    const payload = { ...state.vitals, answers: state.answers };
    const res = await fetch('http://localhost:3000/predict-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.risk) {
      state.riskLevel = data.risk === 'medium' ? 'moderate' : data.risk;
    }
  } catch (e) {
    console.warn('ML service unreachable, using local scoring');
  }

  const mode = state.audioMode ? 'voice' : 'text';
  const backendRisk = state.riskLevel === 'moderate' ? 'medium' : state.riskLevel;
  fetch('http://localhost:3000/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: state.answers, mode, risk: backendRisk })
  }).catch(() => {});

  navigate('result');
}

function screenVitals() {
  const w = state.women[state.selectedWoman];
  return `
    <div class="screen-header">
      <button class="back-btn" onclick="navigate('question')">←</button>
      <span class="screen-title">Medical Vitals</span>
    </div>
    <p style="color:#555;font-size:14px;margin-bottom:20px;text-align:center;">Enter her current health readings for ML-based risk prediction</p>
    <div class="form-group">
      <label>Age</label>
      <input type="number" id="v-age" placeholder="e.g. 25" value="${w?.age || ''}" min="10" max="80" />
    </div>
    <div class="form-group">
      <label>Systolic Blood Pressure (mmHg)</label>
      <input type="number" id="v-sbp" placeholder="e.g. 120" min="70" max="200" />
    </div>
    <div class="form-group">
      <label>Diastolic Blood Pressure (mmHg)</label>
      <input type="number" id="v-dbp" placeholder="e.g. 80" min="40" max="130" />
    </div>
    <div class="form-group">
      <label>Blood Sugar (mmol/L)</label>
      <input type="number" id="v-bs" placeholder="e.g. 7.5" step="0.1" min="1" max="30" />
    </div>
    <div class="form-group">
      <label>Body Temperature (°F)</label>
      <input type="number" id="v-temp" placeholder="e.g. 98.6" step="0.1" min="95" max="105" />
    </div>
    <div class="form-group">
      <label>Heart Rate (bpm)</label>
      <input type="number" id="v-hr" placeholder="e.g. 76" min="40" max="200" />
    </div>
    <div id="vitals-error" class="error-msg"></div>
    <button class="btn btn-primary" onclick="submitVitals()">🧠 Predict Risk</button>
  `;
}

async function submitVitals() {
  const age       = document.getElementById('v-age').value.trim();
  const sbp       = document.getElementById('v-sbp').value.trim();
  const dbp       = document.getElementById('v-dbp').value.trim();
  const bs        = document.getElementById('v-bs').value.trim();
  const temp      = document.getElementById('v-temp').value.trim();
  const hr        = document.getElementById('v-hr').value.trim();
  const err       = document.getElementById('vitals-error');

  if (!age || !sbp || !dbp || !bs || !temp || !hr) {
    err.textContent = 'Please fill in all fields.';
    return;
  }

  err.textContent = '';
  state.vitals = { age, systolicBP: sbp, diastolicBP: dbp, bloodSugar: bs, bodyTemp: temp, heartRate: hr };

  await calculateRiskAndNavigate();
}

function screenResult() {
  const risk = state.riskLevel || 'low';
  const config = {
    low:      { cls: 'risk-low',      icon: '😊', label: 'Low Risk',      desc: 'No immediate concern detected. Continue regular check-ups.' },
    moderate: { cls: 'risk-moderate', icon: '⚠️', label: 'Moderate Risk', desc: 'Some symptoms noted. Please follow up with a health worker.' },
    high:     { cls: 'risk-high',     icon: '🚨', label: 'High Risk',     desc: 'Some symptoms were found. Please visit a nearby hospital for a check-up.' }
  }[risk] || { cls: 'risk-low', icon: '😊', label: 'Low Risk', desc: 'No immediate concern detected. Continue regular check-ups.' };

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
    <div class="reassurance-box">
      💛 This is just a health check. Many women face these issues. Help is available and treatment is possible.
    </div>
    <button class="btn btn-outline" onclick="goHome()">🏠 Back to Home</button>
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
  'landing':         screenLanding,
  'login':           screenLogin,
  'signup':          screenSignup,
  'dashboard':       screenDashboard,
  'woman-dashboard': screenWomanDashboard,
  'women-list':      screenWomenList,
  'add-woman':       screenAddWoman,
  'profile':         screenProfile,
  'lang-select':     screenLangSelect,
  'mode-select':     screenModeSelect,
  'comfort-intro':   screenComfortIntro,
  'question':        screenQuestion,
  'vitals':          screenVitals,
  'result':          screenResult,
  'map':             screenMap
};

function render() {
  // If user is logged in, skip landing
  if (state.screen === 'landing' && state.currentUser) {
    state.screen = state.currentUser.role === 'asha' ? 'dashboard' : 'woman-dashboard';
  }
  const app = document.getElementById('app');
  app.innerHTML = screens[state.screen]();
  if (state.screen === 'map') initMap();
}

render();
