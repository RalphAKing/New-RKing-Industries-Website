(function () {
  if (window.__auth_modal_loaded) return;
  window.__auth_modal_loaded = true;

  // Modal HTML
  const modalHTML = `
  <div class="auth-modal-overlay" id="auth-modal-overlay" style="display:none;">
    <div class="auth-modal-popup" id="auth-modal-popup">
      <button class="auth-close-modal" id="auth-close-modal" aria-label="Close">&times;</button>
      <div class="auth-modal-tabs" id="auth-modal-tabs">
        <button class="auth-modal-tab active" id="auth-tab-login">Login</button>
        <button class="auth-modal-tab" id="auth-tab-signup">Sign Up</button>
        <button class="auth-modal-tab" id="auth-tab-verify" style="display:none;">Verify</button>
      </div>
      <form class="auth-modal-form" id="auth-form-login" autocomplete="on">
        <input type="email" id="auth-login-email" required autocomplete="username" placeholder="Email" />
        <input type="password" id="auth-login-password" required autocomplete="current-password" placeholder="Password" />
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="checkbox" id="auth-stay-logged-in" style="width:16px;height:16px;margin:0;">
          <label for="auth-stay-logged-in" style="font-size:14px;color:#b6c3d6;cursor:pointer;">Stay logged in</label>
        </div>
        <button class="auth-submit-btn" type="submit">Login</button>
        <button class="auth-switch-link" type="button" id="auth-switch-to-signup">Don't have an account? Sign Up</button>
      </form>
      <form class="auth-modal-form" id="auth-form-signup" style="display:none;" autocomplete="on">
        <input type="text" id="auth-signup-username" required maxlength="32" placeholder="Username" />
        <input type="email" id="auth-signup-email" required autocomplete="username" placeholder="Email" />
        <input type="password" id="auth-signup-password" required autocomplete="new-password" placeholder="Password" />
        <input type="password" id="auth-signup-confirm" required autocomplete="new-password" placeholder="Confirm Password" />
        <div id="auth-password-reqs" style="font-size:13px;color:#b6c3d6;margin-bottom:2px;"></div>
        <div id="auth-password-match" style="font-size:13px;margin-bottom:4px;"></div>
        <button class="auth-submit-btn" type="submit" id="auth-signup-btn" disabled>Sign Up</button>
        <button class="auth-switch-link" type="button" id="auth-switch-to-login">Already have an account? Login</button>
        <button class="auth-switch-link" type="button" id="auth-switch-to-verify" style="margin-top:0;">Enter code</button>
      </form>
      <form class="auth-modal-form" id="auth-form-verify" style="display:none;" autocomplete="off">
        <div class="auth-verify-digits-row">
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
          <input type="text" maxlength="1" class="auth-verify-digit" inputmode="numeric" pattern="[0-9]*" />
        </div>
        <button class="auth-submit-btn" type="submit">Verify</button>
        <button class="auth-switch-link" type="button" id="auth-switch-to-login2">Back to Login</button>
      </form>
      <div id="auth-modal-message" style="margin-top:10px;font-size:14px;text-align:center;color:#f87171;"></div>
    </div>
  </div>
  `;

  // Modal CSS
  const modalCSS = `
  .auth-modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15,23,42,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 1;
    transition: opacity 0.3s;
  }
  .auth-modal-popup {
    background: #181f2a;
    border-radius: 18px;
    box-shadow: 0 8px 40px 0 rgba(0,0,0,0.45);
    width: 98vw;
    max-width: 440px;
    padding: 48px 36px 36px 36px;
    position: relative;
    border: none;
    animation: auth-popup-in 0.35s cubic-bezier(.4,2,.6,1) 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
  }
  @media (min-width: 700px) {
    .auth-modal-popup {
      max-width: 520px;
    }
  }
  @keyframes auth-popup-in {
    0% { transform: scale(0.92) translateY(30px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  .auth-close-modal {
    position: absolute;
    top: 14px; right: 14px;
    width: 32px; height: 32px;
    background: rgba(30,41,59,0.7);
    border-radius: 50%;
    border: none;
    color: #f8fafc;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
    z-index: 2;
    box-shadow: 0 2px 8px 0 rgba(30,41,59,0.10);
  }
  .auth-close-modal:hover {
    background: #2563eb;
    color: #fff;
  }
  .auth-modal-tabs {
    display: flex;
    margin-bottom: 22px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #334155;
    background: #232b3a;
  }
  .auth-modal-tab {
    flex: 1;
    padding: 13px 0;
    text-align: center;
    font-weight: 600;
    font-size: 17px;
    cursor: pointer;
    background: none;
    border: none;
    color: #b6c3d6;
    transition: background 0.2s, color 0.2s;
    letter-spacing: 0.01em;
  }
  .auth-modal-tab.active {
    background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
    color: #fff;
    box-shadow: 0 2px 8px 0 rgba(59,130,246,0.10);
  }
  .auth-modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0;
  }
  .auth-modal-form input[type="text"],
  .auth-modal-form input[type="email"],
  .auth-modal-form input[type="password"] {
    padding: 13px 15px;
    border-radius: 9px;
    border: 1.5px solid #334155;
    background: #232b3a;
    color: #f8fafc;
    font-size: 16px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    margin-bottom: 0;
    box-shadow: 0 1px 2px 0 rgba(30,41,59,0.04);
  }
  .auth-modal-form input:focus {
    border: 1.5px solid #2563eb;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.10);
  }
  .auth-submit-btn {
    margin-top: 6px;
    padding: 13px 0;
    border-radius: 9px;
    font-size: 17px;
    font-weight: 700;
    background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: filter 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px 0 rgba(59,130,246,0.10);
    letter-spacing: 0.01em;
  }
  .auth-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .auth-submit-btn:hover:enabled {
    filter: brightness(1.08);
    box-shadow: 0 4px 16px 0 rgba(59,130,246,0.18);
  }
  .auth-switch-link {
    margin-top: 2px;
    font-size: 14px;
    color: #60a5fa;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    align-self: flex-end;
    transition: color 0.2s;
    padding: 0;
  }
  .auth-switch-link:hover {
    color: #2563eb;
  }
  .auth-modal-form .auth-verify-digits-row {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
    margin-bottom: 18px;
  }
  @media (max-width: 420px) {
    .auth-modal-form .auth-verify-digits-row {
      flex-wrap: wrap;
      gap: 4px;
    }
  }
  .auth-verify-digit {
    border: 1.5px solid #334155;
    border-radius: 10px;
    background: #232b3a;
    color: #f8fafc;
    font-size: 28px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
    width: 40px;
    height: 52px;
    text-align: center;
    margin: 0;
    box-shadow: 0 1px 2px 0 rgba(30,41,59,0.04);
    letter-spacing: 0.1em;
  }
  .auth-verify-digit:focus {
    border: 2px solid #2563eb;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.10);
  }
  @media (max-width: 600px) {
    .auth-modal-popup { max-width: 99vw; padding: 10px 1vw 10px 1vw; }
    .auth-verify-digit { width: 28px; height: 38px; font-size: 16px; }
  }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.innerHTML = modalCSS;
  document.head.appendChild(style);

  // Inject HTML
  const div = document.createElement('div');
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);

  // Modal logic
  const modalOverlay = document.getElementById('auth-modal-overlay');
  const modalPopup = document.getElementById('auth-modal-popup');
  const closeModal = document.getElementById('auth-close-modal');
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const tabVerify = document.getElementById('auth-tab-verify');
  const formLogin = document.getElementById('auth-form-login');
  const formSignup = document.getElementById('auth-form-signup');
  const formVerify = document.getElementById('auth-form-verify');
  const switchToSignup = document.getElementById('auth-switch-to-signup');
  const switchToLogin = document.getElementById('auth-switch-to-login');
  const switchToLogin2 = document.getElementById('auth-switch-to-login2');
  const switchToVerify = document.getElementById('auth-switch-to-verify');
  const passwordReqs = document.getElementById('auth-password-reqs');
  const passwordMatch = document.getElementById('auth-password-match');
  const signupBtn = document.getElementById('auth-signup-btn');
  const messageBox = document.getElementById('auth-modal-message');
  let lastSignupUserId = null;

  function showModal(tab) {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    showTab(tab);
    setTimeout(() => {
      const input = modalPopup.querySelector('form:not([style*="display: none"]) input');
      if (input) input.focus();
    }, 120);
  }
  function hideModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
    clearMessage();
  }
  function showTab(tab) {
    [tabLogin, tabSignup, tabVerify].forEach(t => t.classList.remove('active'));
    [formLogin, formSignup, formVerify].forEach(f => f.style.display = 'none');
    if (tab === 'login') {
      tabLogin.classList.add('active');
      formLogin.style.display = '';
    } else if (tab === 'signup') {
      tabSignup.classList.add('active');
      formSignup.style.display = '';
    } else if (tab === 'verify') {
      tabVerify.classList.add('active');
      formVerify.style.display = '';
    }
    if (tab === 'verify') {
      tabVerify.style.display = '';
    } else {
      tabVerify.style.display = 'none';
    }
    clearMessage();
  }
  function clearMessage() {
    messageBox.textContent = '';
    messageBox.style.color = '#f87171';
  }
  function showMessage(msg, color='#f87171') {
    messageBox.textContent = msg;
    messageBox.style.color = color;
  }

  closeModal.onclick = hideModal;
  tabLogin.onclick = () => showTab('login');
  tabSignup.onclick = () => showTab('signup');
  tabVerify.onclick = () => showTab('verify');
  switchToSignup.onclick = () => showTab('signup');
  switchToLogin.onclick = () => showTab('login');
  switchToLogin2.onclick = () => showTab('login');
  if (switchToVerify) switchToVerify.onclick = () => showTab('verify');
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) hideModal();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.style.display === 'flex') hideModal();
  });

  // Password requirements
  function checkPasswordReqs(pw) {
    let met = 0;
    let html = '';
    if (pw.length >= 8) { met++; html += '<span style="color:#22c55e;">&#10003; 8+ chars</span> '; }
    else html += '<span style="color:#f87171;">&#10007; 8+ chars</span> ';
    if (/[A-Z]/.test(pw)) { met++; html += '<span style="color:#22c55e;">&#10003; uppercase</span> '; }
    else html += '<span style="color:#f87171;">&#10007; uppercase</span> ';
    if (/[a-z]/.test(pw)) { met++; html += '<span style="color:#22c55e;">&#10003; lowercase</span> '; }
    else html += '<span style="color:#f87171;">&#10007; lowercase</span> ';
    if (/\d/.test(pw)) { met++; html += '<span style="color:#22c55e;">&#10003; number</span> '; }
    else html += '<span style="color:#f87171;">&#10007; number</span> ';
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) { met++; html += '<span style="color:#22c55e;">&#10003; special</span>'; }
    else html += '<span style="color:#f87171;">&#10007; special</span>';
    passwordReqs.innerHTML = html;
    return met === 5;
  }

  // Signup password live check
  const signupPassword = document.getElementById('auth-signup-password');
  const signupConfirm = document.getElementById('auth-signup-confirm');
  function updateSignupState() {
    const pw = signupPassword.value;
    const confirm = signupConfirm.value;
    const reqsMet = checkPasswordReqs(pw);
    let match = false;
    if (!pw && !confirm) {
      passwordMatch.innerHTML = '';
    } else if (pw === confirm && pw.length > 0) {
      passwordMatch.innerHTML = '<span style="color:#22c55e;">&#10003; Passwords match</span>';
      match = true;
    } else {
      passwordMatch.innerHTML = '<span style="color:#f87171;">&#10007; Passwords do not match</span>';
    }
    signupBtn.disabled = !(reqsMet && match);
  }
  signupPassword.addEventListener('input', updateSignupState);
  signupConfirm.addEventListener('input', updateSignupState);

  // Signup form
  formSignup.onsubmit = async (e) => {
    e.preventDefault();
    signupBtn.disabled = true;
    clearMessage();
    const username = document.getElementById('auth-signup-username').value.trim();
    const email = document.getElementById('auth-signup-email').value.trim();
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    if (!username || !email || !password || !confirm) {
      showMessage("All fields required");
      signupBtn.disabled = false;
      return;
    }
    if (password !== confirm) {
      showMessage("Passwords do not match");
      signupBtn.disabled = false;
      return;
    }
    if (!checkPasswordReqs(password)) {
      showMessage("Password requirements not met");
      signupBtn.disabled = false;
      return;
    }
    try {
        const resp = await fetch("/api/signup", {
        method: "POST",
        body: new URLSearchParams({ username, email, password }),
        });
        const data = await resp.json();
        if (data.ok) {
        window.lastSignupUserId = data.user_id; // <-- Set here!
        showTab('verify');
        showMessage("Check your email for a 6-digit code", "#22c55e");
        } else {
        showMessage(data.error || "Signup failed");
        }
    } catch (err) {
        showMessage("Network error");
    }
    signupBtn.disabled = false;
  };

  // Login form
  formLogin.onsubmit = async (e) => {
    e.preventDefault();
    clearMessage();
    const email = document.getElementById('auth-login-email').value.trim();
    const password = document.getElementById('auth-login-password').value;
    const stay_logged_in = document.getElementById('auth-stay-logged-in').checked;
    try {
      const resp = await fetch("/api/login", {
        method: "POST",
        body: new URLSearchParams({ email, password, stay_logged_in }),
      });
      const data = await resp.json();
      if (data.ok) {
        showMessage("Login successful!", "#22c55e");
        setTimeout(hideModal, 800);
        window.location.reload();
      } else if (data.error === "Account not verified") {
        lastSignupUserId = data.user_id;
        showTab('verify');
        showMessage("Please verify your account", "#fbbf24");
      } else {
        showMessage(data.error || "Login failed");
      }
    } catch (err) {
      showMessage("Network error");
    }
  };

  // Verification form
  formVerify.onsubmit = async (e) => {
    e.preventDefault();
    clearMessage();
    const digits = Array.from(formVerify.querySelectorAll('.auth-verify-digit')).map(i => i.value).join('');
    if (digits.length !== 6) {
      showMessage("Enter all 6 digits");
      return;
    }
    // Use window.lastSignupUserId if set, else fallback
    const userId = window.lastSignupUserId;
    if (!userId) {
      showMessage("No signup in progress");
      return;
    }
    try {
      const resp = await fetch("/api/verify", {
        method: "POST",
        body: new URLSearchParams({ user_id: userId, code: digits }),
      });
      const data = await resp.json();
      if (data.ok) {
        showMessage("Account verified! You can now log in.", "#22c55e");
        setTimeout(() => showTab('login'), 1200);
        window.lastSignupUserId = null; // Clear after use
      } else {
        showMessage(data.error || "Verification failed");
      }
    } catch (err) {
      showMessage("Network error");
    }
  };

  // 6-digit code input UX
  const verifyDigits = formVerify.querySelectorAll('.auth-verify-digit');
  verifyDigits.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      // Only allow numbers
      input.value = input.value.replace(/[^0-9]/g, '');
      if (input.value.length === 1 && idx < 5) verifyDigits[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === "Backspace" && !input.value && idx > 0) verifyDigits[idx - 1].focus();
      if (e.key >= "0" && e.key <= "9" && input.value && idx < 5) {
        // If already filled, move to next
        setTimeout(() => verifyDigits[idx + 1].focus(), 0);
      }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      for (let i = 0; i < 6; i++) {
        verifyDigits[i].value = paste[i] || '';
      }
      // Focus the next empty or last box
      for (let i = 0; i < 6; i++) {
        if (!verifyDigits[i].value) {
          verifyDigits[i].focus();
          return;
        }
      }
      verifyDigits[5].focus();
    });
  });

  // Expose global function
  window.showAuthModal = showModal;
})();