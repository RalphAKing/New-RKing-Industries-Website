// darts-profile.js

(function () {
    // Inject modern CSS for the profile box
    const style = document.createElement("style");
    style.innerHTML = `
:root {
    --primary: #2563eb;
    --secondary: #1e40af;
    --text: #f8fafc;
    --card-bg: rgba(30,41,59,0.98);
    --card-border: rgba(59,130,246,0.3);
    --glow: rgba(59,130,246,0.13);
    --verified: linear-gradient(90deg, #22c55e 60%, #16a34a 100%);
    --unverified: linear-gradient(90deg, #f87171 60%, #ef4444 100%);
}
.profile-root {
    width: 100%;
    height: 100%;
    min-width: 320px;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
}
.profile-main {
    display: flex;
    gap: 32px;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    max-width: 900px;
    max-height: 700px;
    box-sizing: border-box;
    align-items: stretch;
    background: var(--card-bg);
    border-radius: 18px;
    box-shadow: 0 4px 32px var(--glow);
    border: 1.5px solid var(--card-border);
    padding: 40px 0;
}
.profile-stats {
    flex: 1 1 0;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 32px;
    height: 100%;
    justify-content: center;
}
.stats-card {
    background: var(--card-bg);
    border-radius: 14px;
    box-shadow: 0 2px 12px var(--glow);
    border: 1.5px solid var(--card-border);
    padding: 20px 18px 16px 18px;
    margin-bottom: 0;
    transition: box-shadow 0.2s;
    width: 100%;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.stats-card h3 {
    color: var(--primary);
    margin-bottom: 10px;
    font-size: 1.15em;
    letter-spacing: 0.5px;
}
.stats-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 1.05em;
}
.stats-label {
    color: #93c5fd;
    font-weight: 500;
}
.stats-value {
    font-weight: 700;
    color: var(--text);
}
.profile-history {
    flex: 2 1 0;
    min-width: 260px;
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    justify-content: flex-start;
}
.profile-history h3 {
    color: var(--primary);
    margin-bottom: 18px;
    font-size: 1.15em;
    letter-spacing: 0.5px;
}
.games-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1 1 0;
}
.game-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg);
    border-radius: 14px;
    box-shadow: 0 2px 12px var(--glow);
    border: 1.5px solid var(--card-border);
    padding: 22px 28px;
    font-size: 1.1em;
    font-weight: 500;
    cursor: pointer;
    transition: box-shadow 0.18s, border 0.18s, background 0.18s;
    outline: none;
    position: relative;
    min-height: 64px;
    user-select: none;
}
.game-card:hover, .game-card:focus {
    box-shadow: 0 4px 24px var(--glow);
    border: 2px solid var(--primary);
    background: linear-gradient(90deg, #1e293b 80%, #2563eb 100%);
}
.game-title {
    color: #60a5fa;
    font-size: 1.1em;
    font-weight: 700;
    letter-spacing: 0.2px;
    flex: 1 1 auto;
    text-align: left;
}
.game-badge {
    font-size: 0.98em;
    font-weight: 600;
    border-radius: 7px;
    padding: 6px 16px;
    margin-left: 18px;
    display: inline-block;
    animation: popIn 0.5s;
    box-shadow: 0 1px 4px var(--glow);
}
@keyframes popIn {
    0% { transform: scale(0.7); opacity: 0; }
    80% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); }
}
.game-badge.verified {
    background: var(--verified);
    color: #fff;
}
.game-badge.unverified {
    background: var(--unverified);
    color: #fff;
}
.no-games {
    color: #f87171;
    text-align: center;
    font-size: 1.08em;
    margin: 18px 0 0 0;
    background: var(--card-bg);
    border-radius: 14px;
    padding: 32px 0;
    box-shadow: 0 2px 12px var(--glow);
    border: 1.5px solid var(--card-border);
}
@media (max-width: 900px) {
    .profile-main {
        flex-direction: column;
        gap: 18px;
        max-width: 98vw;
        max-height: 98vh;
        padding: 18px 0;
    }
    .profile-stats, .profile-history {
        min-width: 0;
        width: 100%;
        padding: 0 4vw;
        height: auto;
    }
    .stats-card {
        flex: unset;
    }
}
@media (max-width: 600px) {
    .profile-main {
        padding: 0;
    }
    .profile-stats, .profile-history {
        padding: 0 2vw;
    }
    .game-card {
        padding: 16px 10px;
        font-size: 1em;
    }
    .stats-card {
        padding: 14px 8px 10px 8px;
    }
}
    `;
    document.head.appendChild(style);
})();

let currentUser = window.DARTS_USER;
let profileData = null;

async function fetchProfile(userId) {
    const res = await fetch(`/api/profile/${userId}`);
    return await res.json();
}

function percent(won, played) {
    if (!played) return "0";
    return Math.round((won / played) * 100);
}

function renderProfile() {
    const { unranked, ranked, games } = profileData;
    const app = document.getElementById("app");
    app.innerHTML = `
    <div class="profile-root">
        <div class="profile-main">
            <div class="profile-stats">
                <div class="stats-card">
                    <h3>Unranked</h3>
                    <div class="stats-row">
                        <span class="stats-label">Average turn</span>
                        <span class="stats-value">${unranked?.average_turn ?? "-"}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Games played</span>
                        <span class="stats-value">${unranked?.games_played ?? 0}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Games won</span>
                        <span class="stats-value">${unranked?.games_won ?? 0}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Win %</span>
                        <span class="stats-value">${percent(unranked?.games_won, unranked?.games_played)}%</span>
                    </div>
                </div>
                <div class="stats-card">
                    <h3>Ranked</h3>
                    <div class="stats-row">
                        <span class="stats-label">Average turn</span>
                        <span class="stats-value">${ranked?.average_turn ?? "-"}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Games played</span>
                        <span class="stats-value">${ranked?.games_played ?? 0}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Games won</span>
                        <span class="stats-value">${ranked?.games_won ?? 0}</span>
                    </div>
                    <div class="stats-row">
                        <span class="stats-label">Win %</span>
                        <span class="stats-value">${percent(ranked?.games_won, ranked?.games_played)}%</span>
                    </div>
                </div>
            </div>
            <div class="profile-history">
                <h3>Games played</h3>
                <ul class="games-list">
                    ${
                        games && games.length
                            ? games
                                  .map(
                                      (g) => `
                        <li>
                            <div class="game-card" tabindex="0" role="button" data-id="${g.id}" aria-label="View stats for ${g.title}">
                                <span class="game-title">${g.title}</span>
                                <span class="game-badge ${g.verified ? "verified" : "unverified"}">
                                    ${g.verified ? "Verified" : "Unverified"}
                                </span>
                            </div>
                        </li>
                    `
                                  )
                                  .join("")
                            : `<li class="no-games">No games played yet.</li>`
                    }
                </ul>
            </div>
        </div>
        <div id="game-stats-modal" style="display:none"></div>
    </div>
    `;
    document.querySelectorAll(".game-card").forEach((card) => {
        card.onclick = () => {
            window.showGameStats(card.dataset.id, currentUser.id);
        };
        card.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        };
    });
}

window.showGameStats = async function (gameId, userId) {
    const res = await fetch(`/api/game/${gameId}?user_id=${userId}`);
    const data = await res.json();
    window.renderGameStats(data, currentUser.username);
};

window.onload = async function () {
    profileData = await fetchProfile(currentUser.id);
    renderProfile();
};