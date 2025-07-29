// static/js/darts/darts-groups.js

(function () {
    // --- CSS Injection ---
    const style = document.createElement("style");
    style.innerHTML = `
.groups-root {
    width: 100%;
    height: 100%;
    min-width: 320px;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    font-family: inherit;
}
.groups-tabs {
    display: flex;
    border-bottom: 2px solid #334155;
    background: #1e293b;
}
.groups-tab {
    flex: 1;
    padding: 16px 0;
    text-align: center;
    color: #cbd5e1;
    font-size: 1.1rem;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, color 0.2s;
}
.groups-tab.active {
    background: #0f172a;
    color: #fbbf24;
    font-weight: bold;
    border-bottom: 3px solid #fbbf24;
}
.groups-content {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: transparent;
    padding: 0;
}
.groups-view-main {
    display: flex;
    flex: 1 1 0;
    gap: 24px;
    padding: 24px 0 0 0;
    height: 100%;
    min-height: 0;
}
.groups-list, .groups-members, .groups-games {
    background: rgba(30,41,59,0.98);
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(59,130,246,0.13);
    border: 1.5px solid rgba(59,130,246,0.3);
    padding: 18px 12px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: auto;
}
.groups-list {
    flex: 1 1 160px;
    max-width: 200px;
    gap: 8px;
}
.groups-members {
    flex: 2 1 0;
    gap: 8px;
}
.groups-games {
    flex: 1 1 180px;
    max-width: 240px;
    gap: 8px;
}
.group-item {
    padding: 10px 8px;
    border-radius: 8px;
    background: none;
    color: #60a5fa;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    border: none;
    text-align: left;
}
.group-item.active, .group-item:hover {
    background: #2563eb;
    color: #fff;
}
.member-item {
    padding: 8px 6px;
    border-radius: 7px;
    background: #1e293b;
    color: #cbd5e1;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
    border: none;
    text-align: left;
}
.member-item:hover {
    background: #2563eb;
    color: #fff;
}
.game-item {
    padding: 8px 6px;
    border-radius: 7px;
    background: #1e293b;
    color: #cbd5e1;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 2px;
    transition: background 0.15s, color 0.15s;
    border: none;
    text-align: left;
}
.game-item:hover {
    background: #2563eb;
    color: #fff;
}
.group-join-info {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 18px;
    background: #0f172a;
    border-radius: 10px;
    padding: 14px 18px;
    color: #cbd5e1;
    font-size: 1.08em;
}
.group-join-label {
    color: #60a5fa;
    font-weight: 600;
    margin-right: 6px;
}
.group-join-value {
    font-family: monospace;
    font-size: 1.1em;
    background: #1e293b;
    border-radius: 6px;
    padding: 2px 10px;
    margin-right: 8px;
}
.group-password {
    letter-spacing: 0.2em;
    font-size: 1.1em;
    background: #1e293b;
    border-radius: 6px;
    padding: 2px 10px;
    margin-right: 8px;
}
.show-password-btn {
    background: none;
    border: none;
    color: #60a5fa;
    font-size: 1em;
    cursor: pointer;
    margin-left: 4px;
    transition: color 0.15s;
}
.show-password-btn:hover { color: #fbbf24; }
.groups-form {
    max-width: 340px;
    margin: 40px auto 0 auto;
    background: #1e293b;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(59,130,246,0.13);
    border: 1.5px solid rgba(59,130,246,0.3);
    padding: 32px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}
.groups-form label {
    color: #60a5fa;
    font-weight: 600;
    margin-bottom: 4px;
}
.groups-form input {
    padding: 10px 8px;
    border-radius: 7px;
    border: 1.5px solid #334155;
    background: #0f172a;
    color: #f8fafc;
    font-size: 1.08em;
    margin-bottom: 8px;
    outline: none;
    transition: border 0.15s;
}
.groups-form input:focus {
    border: 1.5px solid #2563eb;
}
.groups-form button {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    font-weight: 700;
    font-size: 1.1em;
    cursor: pointer;
    transition: background 0.2s;
}
.groups-form button:hover {
    background: #1e40af;
}
.groups-form .error {
    color: #f87171;
    font-size: 0.98em;
    margin-top: -8px;
    margin-bottom: 8px;
}
@media (max-width: 900px) {
    .groups-view-main {
        flex-direction: column;
        gap: 12px;
        padding: 12px 0 0 0;
    }
    .groups-list, .groups-members, .groups-games {
        max-width: 100vw;
        min-width: 0;
    }
}
    `;
    document.head.appendChild(style);

    // --- State ---
    let groups = [];
    let currentGroup = null;
    let user = window.DARTS_USER;
    let members = [];
    let games = [];
    let showPassword = false;

    // --- API Helpers ---
    async function fetchGroups() {
        const res = await fetch(`/api/groups?user_id=${user.id}`);
        return await res.json();
    }

    async function joinGroup(code, password) {
        const form = new FormData();
        form.append("code", code);
        form.append("password", password);
        form.append("user_id", user.id);
        const res = await fetch("/api/groups/join", { method: "POST", body: form });
        if (!res.ok) throw new Error((await res.json()).detail || "Join failed");
        return await res.json();
    }

    async function createGroup(name, password) {
        const form = new FormData();
        form.append("name", name);
        form.append("password", password);
        form.append("user_id", user.id);
        const res = await fetch("/api/groups/create", { method: "POST", body: form });
        if (!res.ok) throw new Error((await res.json()).detail || "Create failed");
        return await res.json();
    }

    // --- UI Renderers ---
    function renderGroupsTab() {
        const root = document.getElementById("groups");
        root.innerHTML = `
        <div class="groups-root">
            <div class="groups-tabs">
                <div class="groups-tab" data-tab="view">View</div>
                <div class="groups-tab" data-tab="join">Join</div>
                <div class="groups-tab" data-tab="create">Create</div>
            </div>
            <div class="groups-content" id="groups-content"></div>
        </div>
        `;
        // Tab logic
        const tabs = root.querySelectorAll(".groups-tab");
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                renderGroupsContent(tab.dataset.tab);
            };
        });
        tabs[0].classList.add("active");
        renderGroupsContent("view");
    }

    function renderGroupsContent(tab) {
        const content = document.getElementById("groups-content");
        if (tab === "view") {
            renderViewTab(content);
        } else if (tab === "join") {
            renderJoinTab(content);
        } else if (tab === "create") {
            renderCreateTab(content);
        }
    }

    function renderViewTab(content) {
        if (!groups.length) {
            content.innerHTML = `<div class="placeholder" style="color:#f87171;text-align:center;margin-top:40px;">You are not in any groups yet.</div>`;
            return;
        }
        if (!currentGroup) currentGroup = groups[0];
        members = currentGroup.members;
        games = currentGroup.games;
        showPassword = false;

        content.innerHTML = `
        <div class="group-join-info">
            <span class="group-join-label">Join code:</span>
            <span class="group-join-value">${currentGroup.code}</span>
            <span class="group-join-label">Password:</span>
            <span class="group-password" id="group-password">${"*".repeat(currentGroup.password.length)}</span>
            <button class="show-password-btn" id="show-password-btn" aria-label="Show password">View</button>
        </div>
        <div class="groups-view-main">
            <div class="groups-list">
                <div style="font-weight:700;color:#60a5fa;margin-bottom:8px;">Your Groups</div>
                ${groups
                    .map(
                        g => `<button class="group-item${g.id === currentGroup.id ? " active" : ""}" data-id="${g.id}">${g.name}</button>`
                    )
                    .join("")}
            </div>
            <div class="groups-members">
                <div style="font-weight:700;color:#60a5fa;margin-bottom:8px;">Members</div>
                ${members
                    .map(
                        m => `<button class="member-item" data-id="${m.id}">${m.username}</button>`
                    )
                    .join("")}
            </div>
            <div class="groups-games">
                <div style="font-weight:700;color:#60a5fa;margin-bottom:8px;">Games</div>
                ${games.length
                    ? games
                          .map(
                              g => `<button class="game-item" data-id="${g.id}">${g.title} <span style="color:${g.verified ? "#22c55e" : "#f87171"};font-size:0.95em;">${g.verified ? "✔" : "✗"}</span></button>`
                          )
                          .join("")
                    : `<div style="color:#f87171;">No games yet.</div>`}
            </div>
        </div>
        <div id="groups-profile-modal" style="display:none"></div>
        `;

        // Group switching
        content.querySelectorAll(".group-item").forEach(btn => {
            btn.onclick = () => {
                const gid = Number(btn.dataset.id);
                currentGroup = groups.find(g => g.id === gid);
                renderViewTab(content);
            };
        });

        // Show/hide password
        content.querySelector("#show-password-btn").onclick = () => {
            showPassword = !showPassword;
            const pw = content.querySelector("#group-password");
            pw.textContent = showPassword
                ? currentGroup.password
                : "*".repeat(currentGroup.password.length);
            content.querySelector("#show-password-btn").textContent = showPassword ? "Hide" : "View";
        };

        // Member profile popup (robust, modal, does NOT interfere with main profile tab)
        content.querySelectorAll(".member-item").forEach(btn => {
            btn.onclick = () => {
                const userId = Number(btn.dataset.id);
                showProfileModal(userId);
            };
        });

        // Game stats popup: always works, even if scripts not loaded yet
        content.querySelectorAll(".game-item").forEach(btn => {
            btn.onclick = () => {
                showGameStatsModal(Number(btn.dataset.id), user.id);
            };
        });
    }

    function renderJoinTab(content) {
        content.innerHTML = `
        <form class="groups-form" id="join-form" autocomplete="off">
            <label for="join-code">Group Code</label>
            <input id="join-code" name="code" required maxlength="12" autocomplete="off" />
            <label for="join-password">Password</label>
            <input id="join-password" name="password" type="password" required maxlength="32" autocomplete="off" />
            <div class="error" id="join-error"></div>
            <button type="submit">Join Group</button>
        </form>
        `;
        content.querySelector("#join-form").onsubmit = async (e) => {
            e.preventDefault();
            const code = content.querySelector("#join-code").value.trim();
            const password = content.querySelector("#join-password").value;
            const errorDiv = content.querySelector("#join-error");
            errorDiv.textContent = "";
            try {
                const group = await joinGroup(code, password);
                if (!groups.find(g => g.id === group.id)) groups.push(group);
                currentGroup = group;
                renderGroupsTab();
                // Switch to view tab
                setTimeout(() => {
                    document.querySelector('.groups-tab[data-tab="view"]').click();
                }, 100);
            } catch (err) {
                errorDiv.textContent = err.message || "Failed to join group.";
            }
        };
    }

    function renderCreateTab(content) {
        content.innerHTML = `
        <form class="groups-form" id="create-form" autocomplete="off">
            <label for="create-name">Group Name</label>
            <input id="create-name" name="name" required maxlength="32" autocomplete="off" />
            <label for="create-password">Password</label>
            <input id="create-password" name="password" type="password" required maxlength="32" autocomplete="off" />
            <div class="error" id="create-error"></div>
            <button type="submit">Create Group</button>
        </form>
        `;
        content.querySelector("#create-form").onsubmit = async (e) => {
            e.preventDefault();
            const name = content.querySelector("#create-name").value.trim();
            const password = content.querySelector("#create-password").value;
            const errorDiv = content.querySelector("#create-error");
            errorDiv.textContent = "";
            try {
                const group = await createGroup(name, password);
                if (!groups.find(g => g.id === group.id)) groups.push(group);
                currentGroup = group;
                renderGroupsTab();
                // Switch to view tab
                setTimeout(() => {
                    document.querySelector('.groups-tab[data-tab="view"]').click();
                }, 100);
            } catch (err) {
                errorDiv.textContent = err.message || "Failed to create group.";
            }
        };
    }

    // --- Ensure profile/game scripts are loaded before calling any modal ---
    function ensureProfileAndGameScripts(cb) {
        if (window.renderProfile && window.renderGameStats) {
            cb();
            return;
        }
        if (!window._profileScriptsLoaded) {
            const s1 = document.createElement('script');
            s1.src = "static/js/darts/darts-profile.js";
            document.body.appendChild(s1);
            const s2 = document.createElement('script');
            s2.src = "static/js/darts/darts-game-stats.js";
            document.body.appendChild(s2);
            window._profileScriptsLoaded = true;
            s2.onload = cb;
        } else {
            setTimeout(() => ensureProfileAndGameScripts(cb), 100);
        }
    }

    // --- Profile Modal for Groups Tab ---
    function showProfileModal(userId) {
        let modal = document.getElementById("groups-profile-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "groups-profile-modal";
            document.body.appendChild(modal);
        }
        modal.style.display = "flex";
        modal.style.position = "fixed";
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.right = 0;
        modal.style.bottom = 0;
        modal.style.background = "rgba(30,41,59,0.35)";
        modal.style.backdropFilter = "blur(8px)";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.innerHTML = `
            <div style="background:#1e293b;border-radius:18px;box-shadow:0 4px 32px rgba(59,130,246,0.13);padding:32px 0;max-width:900px;width:95vw;max-height:98vh;overflow:auto;position:relative;">
                <button id="close-profile-modal" style="position:absolute;top:18px;right:24px;background:none;border:none;color:#f87171;font-size:2em;font-weight:bold;cursor:pointer;">&times;</button>
                <div id="groups-profile-modal-app"></div>
            </div>
        `;

        // Patch: temporarily override document.getElementById("app") so profile renders in our modal
        const prevGetElementById = document.getElementById;
        document.getElementById = function(id) {
            if (id === "app") return document.getElementById("groups-profile-modal-app");
            return prevGetElementById.call(document, id);
        };

        // Save and set DARTS_USER for the modal
        const prevUser = window.DARTS_USER;

        ensureProfileAndGameScripts(() => {
            fetch(`/api/profile/${userId}`)
                .then(res => res.json())
                .then(data => {
                    let username = "User";
                    if (data && data.games && data.games.length > 0) {
                        const match = data.games[0].title.match(/^([A-Za-z]+)/);
                        if (match) username = match[1];
                    }
                    window.DARTS_USER = { id: userId, username };
                    if (window.renderProfile) {
                        window.renderProfile();
                    } else if (window.onload) {
                        window.onload();
                    }
                });
            // Restore everything after a short delay (after render)
            setTimeout(() => {
                document.getElementById = prevGetElementById;
                window.DARTS_USER = prevUser;
            }, 500);
        });

        // Close
        modal.querySelector("#close-profile-modal").onclick = () => {
            modal.style.display = "none";
            modal.innerHTML = "";
        };
    }

    // --- Game Modal for Groups Tab and Profile Modals ---
    function showGameStatsModal(gameId, userId) {
        ensureProfileAndGameScripts(() => {
            let modal = document.getElementById("game-stats-modal");
            if (!modal) {
                modal = document.createElement("div");
                modal.id = "game-stats-modal";
                document.body.appendChild(modal);
            }
            modal.style.display = "flex";
            modal.style.position = "fixed";
            modal.style.top = 0;
            modal.style.left = 0;
            modal.style.right = 0;
            modal.style.bottom = 0;
            modal.style.background = "rgba(30,41,59,0.35)";
            modal.style.backdropFilter = "blur(8px)";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.innerHTML = "";

            fetch(`/api/game/${gameId}?user_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (window.renderGameStats) {
                        window.renderGameStats(data, (window.DARTS_USER && window.DARTS_USER.username) || "");
                    }
                });

            setTimeout(() => {
                modal.onclick = (e) => {
                    if (e.target.id === "game-stats-modal") {
                        modal.style.display = "none";
                        modal.innerHTML = "";
                    }
                };
                window.addEventListener("keydown", function escListener(e) {
                    if (e.key === "Escape") {
                        modal.style.display = "none";
                        modal.innerHTML = "";
                        window.removeEventListener("keydown", escListener);
                    }
                });
            }, 200);
        });
    }

    // --- Patch window.showGameStats globally so profile modals work everywhere ---
    window.showGameStats = showGameStatsModal;

    // --- Initial Load ---
    async function initGroupsTab() {
        groups = await fetchGroups();
        currentGroup = groups[0] || null;
        renderGroupsTab();
    }

    // --- Mount on tab show ---
    document.querySelector('.tab[data-tab="groups"]').addEventListener('click', () => {
        if (!window._groupsTabLoaded) {
            initGroupsTab();
            window._groupsTabLoaded = true;
        }
    });

    // If you want to load immediately (optional)
    // initGroupsTab();

})();