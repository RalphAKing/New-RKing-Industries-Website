(function () {
  if (window.__profile_modal_loaded) return;
  window.__profile_modal_loaded = true;

  // Modal HTML
  const modalHTML = `
  <div class="profile-modal-overlay" id="profile-modal-overlay" style="display:none;">
    <div class="profile-modal-popup" id="profile-modal-popup">
      <button class="profile-close-modal" id="profile-close-modal" aria-label="Close">&times;</button>
      <div class="profile-modal-tabs" id="profile-modal-tabs">
        <button class="profile-tab-btn active" data-tab="username">Change Username</button>
        <button class="profile-tab-btn" data-tab="email">Change Email</button>
        <button class="profile-tab-btn" data-tab="password">Change Password</button>
        <button class="profile-tab-btn" data-tab="sessions">Active Sessions</button>
      </div>
      <div class="profile-modal-mainarea">
        <div class="profile-modal-content">
          <div class="profile-tab-content" id="profile-tab-username">
            <h2 class="profile-modal-title">Change Username</h2>
            <form class="profile-modal-form" id="profile-form-username" autocomplete="on">
              <label>Username</label>
              <input type="text" id="profile-username" maxlength="32" required placeholder="Username" />
              <label>Current Password</label>
              <input type="password" id="profile-username-password" autocomplete="current-password" required placeholder="Current Password" />
              <button class="profile-update-btn" type="submit" id="profile-update-username">Change Username</button>
              <div id="profile-username-msg" class="profile-msg"></div>
            </form>
          </div>
          <div class="profile-tab-content" id="profile-tab-email" style="display:none;">
            <h2 class="profile-modal-title">Change Email</h2>
            <form class="profile-modal-form" id="profile-form-email" autocomplete="on">
              <label>Email</label>
              <input type="email" id="profile-email" required placeholder="Email" />
              <label>Current Password</label>
              <input type="password" id="profile-email-password" autocomplete="current-password" required placeholder="Current Password" />
              <button class="profile-update-btn" type="submit" id="profile-update-email">Change Email</button>
              <div id="profile-email-msg" class="profile-msg"></div>
            </form>
          </div>
          <div class="profile-tab-content" id="profile-tab-password" style="display:none;">
            <h2 class="profile-modal-title">Change Password</h2>
            <form class="profile-modal-form" id="profile-form-password" autocomplete="on">
              <label>Current Password</label>
              <input type="password" id="profile-old-password" autocomplete="current-password" required placeholder="Current Password" />
              <label>New Password</label>
              <input type="password" id="profile-new-password" autocomplete="new-password" required placeholder="New Password" />
              <label>Confirm New Password</label>
              <input type="password" id="profile-confirm-password" autocomplete="new-password" required placeholder="Confirm New Password" />
              <div id="profile-password-reqs" style="font-size:13px;color:#b6c3d6;margin-bottom:2px;"></div>
              <div id="profile-password-match" style="font-size:13px;margin-bottom:4px;"></div>
              <button class="profile-update-btn" type="submit" id="profile-update-password" disabled>Change Password</button>
              <div id="profile-password-msg" class="profile-msg"></div>
            </form>
          </div>
          <div class="profile-tab-content" id="profile-tab-sessions" style="display:none;">
            <h2 class="profile-modal-title">Active Sessions</h2>
            <div id="profile-sessions-list" style="font-size:15px;"></div>
            <div id="profile-sessions-msg" class="profile-msg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  // Modal CSS
  const modalCSS = `
.profile-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15,23,42,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  opacity: 1;
  transition: opacity 0.3s;
}
.profile-modal-popup {
  background: #181f2a;
  border-radius: 18px;
  box-shadow: 0 8px 40px 0 rgba(0,0,0,0.45);
  width: 99vw;
  max-width: 480px;
  max-height: 95vh;
  padding: 48px 36px 36px 36px;
  position: relative;
  border: none;
  animation: profile-popup-in 0.35s cubic-bezier(.4,2,.6,1) 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
}
@keyframes profile-popup-in {
  0% { transform: scale(0.92) translateY(30px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.profile-close-modal {
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
.profile-close-modal:hover {
  background: #2563eb;
  color: #fff;
}
.profile-modal-title {
  text-align: center;
  color: #60a5fa;
  margin-bottom: 24px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.profile-modal-tabs {
  display: flex;
  flex-direction: row;
  gap: 0;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #232b3a;
  border: 1.5px solid #334155;
}
.profile-tab-btn {
  flex: 1 1 0;
  padding: 14px 0;
  background: none;
  border: none;
  color: #b6c3d6;
  font-size: 1.08em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  outline: none;
}
.profile-tab-btn.active {
  background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
  color: #fff;
}
.profile-tab-btn:not(.active):hover {
  background: #1e293b;
  color: #60a5fa;
}
.profile-modal-mainarea {
  display: flex;
  flex-direction: row;
  gap: 0;
  min-height: 0;
}
.profile-modal-content {
  flex: 1 1 0;
  min-width: 0;
}
.profile-tab-content {
  display: block;
}
@media (max-width: 600px) {
  .profile-modal-popup {
    max-width: 99vw;
    max-height: 99vh;
    padding: 8px 1vw 8px 1vw;
    overflow-y: auto;
  }
  .profile-modal-tabs {
    font-size: 0.98em;
  }
}
.profile-modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
}
.profile-modal-form label {
  color: #b6c3d6;
  font-size: 15px;
  margin-bottom: 2px;
  margin-top: 10px;
  font-weight: 500;
}
.profile-modal-form input[type="text"],
.profile-modal-form input[type="email"],
.profile-modal-form input[type="password"] {
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
.profile-modal-form input:focus {
  border: 1.5px solid #2563eb;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.10);
}
.profile-update-btn {
  margin-top: 8px;
  padding: 12px 0;
  border-radius: 9px;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: filter 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(59,130,246,0.10);
  letter-spacing: 0.01em;
}
.profile-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.profile-update-btn:hover:enabled {
  filter: brightness(1.08);
  box-shadow: 0 4px 16px 0 rgba(59,130,246,0.18);
}
.profile-msg {
  min-height: 18px;
  font-size: 13px;
  color: #f87171;
  margin-bottom: 2px;
  margin-top: 0;
  text-align: left;
}
.profile-remove-session-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.profile-remove-session-form input[type="password"] {
  font-size: 15px;
  padding: 7px 10px;
  border-radius: 7px;
  border: 1.2px solid #334155;
  background: #232b3a;
  color: #f8fafc;
}
.profile-remove-session-form button {
  padding: 7px 0;
  border-radius: 7px;
  background: #f87171;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  margin-top: 2px;
}
.profile-remove-session-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  const modalOverlay = document.getElementById('profile-modal-overlay');
  const modalPopup = document.getElementById('profile-modal-popup');
  const closeModal = document.getElementById('profile-close-modal');
  const tabBtns = Array.from(document.querySelectorAll('.profile-tab-btn'));
  const tabContents = {
    username: document.getElementById('profile-tab-username'),
    email: document.getElementById('profile-tab-email'),
    password: document.getElementById('profile-tab-password'),
    sessions: document.getElementById('profile-tab-sessions'),
  };

  // Username
  const usernameInput = document.getElementById('profile-username');
  const usernamePasswordInput = document.getElementById('profile-username-password');
  const updateUsernameBtn = document.getElementById('profile-update-username');
  const usernameMsg = document.getElementById('profile-username-msg');
  const formUsername = document.getElementById('profile-form-username');

  // Email
  const emailInput = document.getElementById('profile-email');
  const emailPasswordInput = document.getElementById('profile-email-password');
  const updateEmailBtn = document.getElementById('profile-update-email');
  const emailMsg = document.getElementById('profile-email-msg');
  const formEmail = document.getElementById('profile-form-email');

  // Password
  const oldPasswordInput = document.getElementById('profile-old-password');
  const newPasswordInput = document.getElementById('profile-new-password');
  const confirmPasswordInput = document.getElementById('profile-confirm-password');
  const updatePasswordBtn = document.getElementById('profile-update-password');
  const passwordMsg = document.getElementById('profile-password-msg');
  const passwordReqs = document.getElementById('profile-password-reqs');
  const passwordMatch = document.getElementById('profile-password-match');
  const formPassword = document.getElementById('profile-form-password');

  // Sessions
  const sessionsList = document.getElementById('profile-sessions-list');
  const sessionsMsg = document.getElementById('profile-sessions-msg');

  // Tab switching
  tabBtns.forEach(btn => {
    btn.onclick = function () {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.keys(tabContents).forEach(key => {
        tabContents[key].style.display = (btn.dataset.tab === key) ? 'block' : 'none';
      });
      // Focus first input in tab
      setTimeout(() => {
        const firstInput = tabContents[btn.dataset.tab].querySelector('input');
        if (firstInput) firstInput.focus();
      }, 80);
    };
  });

  // Modal show/hide
  function showProfileModal(user) {
    if (user) {
      usernameInput.value = user.username || "";
      emailInput.value = user.email || "";
    }
    usernamePasswordInput.value = "";
    emailPasswordInput.value = "";
    oldPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    usernameMsg.textContent = "";
    emailMsg.textContent = "";
    passwordMsg.textContent = "";
    passwordReqs.innerHTML = "";
    passwordMatch.innerHTML = "";
    sessionsMsg.textContent = "";
    // Show first tab
    tabBtns.forEach(b => b.classList.remove('active'));
    tabBtns[0].classList.add('active');
    Object.keys(tabContents).forEach((key, i) => {
      tabContents[key].style.display = (i === 0) ? 'block' : 'none';
    });
    loadSessions();
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => usernameInput.focus(), 120);
  }
  function hideProfileModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  closeModal.onclick = hideProfileModal;
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) hideProfileModal();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.style.display === 'flex') hideProfileModal();
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

  // Password live check
  function updatePasswordState() {
    const pw = newPasswordInput.value;
    const confirm = confirmPasswordInput.value;
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
    updatePasswordBtn.disabled = !(reqsMet && match && oldPasswordInput.value.length > 0);
  }
  newPasswordInput.addEventListener('input', updatePasswordState);
  confirmPasswordInput.addEventListener('input', updatePasswordState);
  oldPasswordInput.addEventListener('input', updatePasswordState);

  // Username update
  formUsername.onsubmit = async function (e) {
    e.preventDefault();
    usernameMsg.textContent = "";
    const username = usernameInput.value.trim();
    const password = usernamePasswordInput.value;
    if (!username) {
      usernameMsg.textContent = "Username required";
      return;
    }
    if (!password) {
      usernameMsg.textContent = "Current password required";
      return;
    }
    updateUsernameBtn.disabled = true;
    try {
      const resp = await fetch("/api/profile/update", {
        method: "POST",
        body: new URLSearchParams({ field: "username", value: username, password }),
      });
      const data = await resp.json();
      if (data.ok) {
        usernameMsg.textContent = "Username updated!";
        usernameMsg.style.color = "#22c55e";
        setTimeout(() => { usernameMsg.textContent = ""; }, 2000);
      } else {
        usernameMsg.textContent = data.error || "Update failed";
        usernameMsg.style.color = "#f87171";
      }
    } catch (err) {
      usernameMsg.textContent = "Network error";
      usernameMsg.style.color = "#f87171";
    }
    updateUsernameBtn.disabled = false;
  };

  // Email update
  formEmail.onsubmit = async function (e) {
    e.preventDefault();
    emailMsg.textContent = "";
    const email = emailInput.value.trim();
    const password = emailPasswordInput.value;
    if (!email) {
      emailMsg.textContent = "Email required";
      return;
    }
    if (!password) {
      emailMsg.textContent = "Current password required";
      return;
    }
    updateEmailBtn.disabled = true;
    try {
      const resp = await fetch("/api/profile/update", {
        method: "POST",
        body: new URLSearchParams({ field: "email", value: email, password }),
      });
      const data = await resp.json();
      if (data.ok) {
        emailMsg.textContent = "Email updated!";
        emailMsg.style.color = "#22c55e";
        setTimeout(() => { emailMsg.textContent = ""; }, 2000);
        if (data.reverify) {
          // Get user id for verification
          fetch('/api/session').then(r => r.json()).then(sessionData => {
            if (sessionData.ok && typeof showAuthModal === "function") {
              window.lastSignupUserId = sessionData.user.id;
              showAuthModal('verify');
              setTimeout(() => {
                const msg = document.getElementById('auth-modal-message');
                if (msg) msg.textContent = "Please verify your new email address (check your inbox for a code).";
              }, 300);
            } else {
              emailMsg.textContent = "Please verify your new email address (check your inbox for a code).";
            }
          });
          hideProfileModal();
        }
      } else {
        emailMsg.textContent = data.error || "Update failed";
        emailMsg.style.color = "#f87171";
      }
    } catch (err) {
      emailMsg.textContent = "Network error";
      emailMsg.style.color = "#f87171";
    }
    updateEmailBtn.disabled = false;
  };

  // Password update
  formPassword.onsubmit = async function (e) {
    e.preventDefault();
    passwordMsg.textContent = "";
    const oldpw = oldPasswordInput.value;
    const newpw = newPasswordInput.value;
    const confirm = confirmPasswordInput.value;
    if (!oldpw || !newpw || !confirm) {
      passwordMsg.textContent = "All fields required";
      return;
    }
    if (newpw !== confirm) {
      passwordMsg.textContent = "Passwords do not match";
      return;
    }
    if (!checkPasswordReqs(newpw)) {
      passwordMsg.textContent = "Password requirements not met";
      return;
    }
    updatePasswordBtn.disabled = true;
    try {
      const resp = await fetch("/api/profile/update", {
        method: "POST",
        body: new URLSearchParams({ field: "password", old_password: oldpw, new_password: newpw }),
      });
      const data = await resp.json();
      if (data.ok) {
        passwordMsg.textContent = "Password updated!";
        passwordMsg.style.color = "#22c55e";
        oldPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
        passwordReqs.innerHTML = "";
        passwordMatch.innerHTML = "";
        setTimeout(() => { passwordMsg.textContent = ""; }, 2000);
      } else {
        passwordMsg.textContent = data.error || "Update failed";
        passwordMsg.style.color = "#f87171";
      }
    } catch (err) {
      passwordMsg.textContent = "Network error";
      passwordMsg.style.color = "#f87171";
    }
    updatePasswordBtn.disabled = false;
  };

  // Sessions
  async function loadSessions() {
    sessionsList.innerHTML = '<div style="color:#b6c3d6;">Loading...</div>';
    sessionsMsg.textContent = "";
    try {
      const resp = await fetch('/api/profile/sessions');
      const data = await resp.json();
      if (!data.ok) {
        sessionsList.innerHTML = '<div style="color:#f87171;">Could not load sessions</div>';
        return;
      }
      if (!data.sessions.length) {
        sessionsList.innerHTML = '<div style="color:#b6c3d6;">No active sessions</div>';
        return;
      }
      sessionsList.innerHTML = '';
      data.sessions.forEach(sess => {
        const div = document.createElement('div');
        div.style.marginBottom = "18px";
        div.style.padding = "12px";
        div.style.borderRadius = "10px";
        div.style.background = sess.current ? "#2563eb22" : "#232b3a";
        div.style.border = sess.current ? "2px solid #60a5fa" : "1px solid #334155";
        div.innerHTML = `
          <div><b>Device:</b> ${sess.device ? sess.device : "Unknown"}</div>
          <div><b>Location:</b> ${sess.location ? sess.location : "Unknown"}</div>
          <div><b>Started:</b> ${new Date(sess.created_at).toLocaleString()}</div>
          ${sess.expires_at ? `<div><b>Expires:</b> ${new Date(sess.expires_at).toLocaleString()}</div>` : ""}
          ${sess.current ? `<div style="color:#22c55e;font-weight:600;">Current Session</div>` :
            `<form class="profile-remove-session-form" data-session-id="${sess.id}">
              <input type="password" name="password" required placeholder="Current Password" autocomplete="current-password" />
              <button type="submit">Remove</button>
              <div class="profile-msg"></div>
            </form>`
          }
        `;
        sessionsList.appendChild(div);
      });
      // Attach remove handlers
      sessionsList.querySelectorAll('.profile-remove-session-form').forEach(form => {
        form.onsubmit = async function (e) {
          e.preventDefault();
          const sessionId = form.getAttribute('data-session-id');
          const pw = form.querySelector('input[name="password"]').value;
          const btn = form.querySelector('button');
          const msg = form.querySelector('.profile-msg');
          msg.textContent = "";
          if (!pw) {
            msg.textContent = "Password required";
            return;
          }
          btn.disabled = true;
          btn.textContent = "Removing...";
          try {
            const resp = await fetch('/api/profile/remove_session', {
              method: "POST",
              body: new URLSearchParams({ session_id: sessionId, password: pw }),
            });
            const data = await resp.json();
            if (data.ok) {
              form.innerHTML = '<span style="color:#22c55e;">Session removed</span>';
              setTimeout(loadSessions, 1000);
            } else {
              btn.disabled = false;
              btn.textContent = "Remove";
              msg.textContent = data.error || "Failed to remove session";
            }
          } catch (err) {
            btn.disabled = false;
            btn.textContent = "Remove";
            msg.textContent = "Network error";
          }
        };
      });
    } catch (err) {
      sessionsList.innerHTML = '<div style="color:#f87171;">Could not load sessions</div>';
    }
  }

  // Expose global function
  window.showProfileModal = showProfileModal;

  // Robustly attach handler to profile button if present
  document.addEventListener("DOMContentLoaded", function () {
    function attachProfileHandler() {
      const profileBtn = document.getElementById('profile-btn');
      if (profileBtn) {
        profileBtn.onclick = function (e) {
          e.preventDefault();
          fetch('/api/session').then(r => r.json()).then(data => {
            if (data.ok) showProfileModal(data.user);
            else showProfileModal();
          });
        };
      }
    }
    attachProfileHandler();
    setTimeout(attachProfileHandler, 500); // In case button is rendered late
  });
})();