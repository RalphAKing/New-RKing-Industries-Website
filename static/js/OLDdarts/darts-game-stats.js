// darts-game-stats-modal.js

(function () {
    // Inject CSS for the modal with blur effect
    const style = document.createElement("style");
    style.innerHTML = `
#game-stats-modal {
    z-index: 1000;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(30,41,59,0.35);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: none;
    align-items: center;
    justify-content: center;
}
.game-stats-modal-content {
    background: var(--card-bg, #1e293b);
    border-radius: 16px;
    box-shadow: 0 4px 24px var(--glow-color, rgba(59,130,246,0.2));
    padding: 32px 24px 24px 24px;
    max-width: 900px;
    width: 95vw;
    margin: 40px auto;
    color: var(--text-color, #f8fafc);
    position: relative;
}
.close-btn {
    background: none;
    border: none;
    color: #f87171;
    font-size: 2em;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    top: 18px;
    right: 24px;
    transition: color 0.2s;
}
.close-btn:hover { color: #ef4444; }
.game-stats-flex {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
}
.game-stats-left {
    flex: 2 1 350px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}
.game-stats-right {
    flex: 1 1 260px;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
}
.card {
    background: var(--card-bg, #1e293b);
    border-radius: 12px;
    box-shadow: 0 2px 8px var(--glow-color, rgba(59,130,246,0.10));
    border: 1.5px solid var(--card-border, rgba(59,130,246,0.3));
    padding: 18px 16px;
}
.leg-section h4 {
    color: var(--primary-color, #2563eb);
    margin-bottom: 10px;
    font-size: 1.1em;
}
.stats-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 1em;
}
.stats-table th, .stats-table td {
    padding: 6px 10px;
    border-bottom: 1px solid var(--card-border, rgba(59,130,246,0.15));
    text-align: left;
}
.stats-table th {
    color: #60a5fa;
    font-weight: 700;
    background: none;
}
.stats-table tr:last-child td {
    border-bottom: none;
}
.verified-tag {
    font-weight: bold;
    font-size: 1.1em;
    padding: 6px 14px;
    border-radius: 8px;
    margin-bottom: 8px;
    display: inline-block;
}
.verified-tag.verified {
    background: linear-gradient(90deg, #22c55e 60%, #16a34a 100%);
    color: #fff;
}
.verified-tag.unverified {
    background: linear-gradient(90deg, #f87171 60%, #ef4444 100%);
    color: #fff;
}
.winner {
    font-size: 1.1em;
    margin-bottom: 10px;
}
.averages h5, .videos h5 {
    margin: 10px 0 6px 0;
    color: #60a5fa;
    font-size: 1em;
}
.averages ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.averages li {
    margin-bottom: 4px;
    font-size: 1em;
}
.averages span {
    color: #93c5fd;
}
.videos .video-embed {
    margin-bottom: 10px;
}
.video-title {
    font-size: 0.95em;
    color: #cbd5e1;
    margin-top: 2px;
}
.no-videos {
    color: #f87171;
    font-size: 0.98em;
    margin-bottom: 8px;
}
.stats-actions {
    margin-top: 16px;
    width: 100%;
}
.main-btn {
    width: 100%;
    background: var(--primary-color, #2563eb);
    color: var(--text-color, #f8fafc);
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    font-weight: 700;
    font-size: 1.1em;
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.2s, color 0.2s;
}
.main-btn:hover, .main-btn:focus {
    background: var(--accent-gradient, linear-gradient(45deg, #60a5fa, #3b82f6));
    color: #fff;
}
@media (max-width: 800px) {
    .game-stats-flex {
        flex-direction: column;
        gap: 18px;
    }
    .game-stats-right {
        min-width: 0;
        width: 100%;
    }
}
    `;
    document.head.appendChild(style);

    // Modal rendering function
    window.renderGameStats = function (data, username) {
        let modal = document.getElementById("game-stats-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "game-stats-modal";
            document.body.appendChild(modal);
        }
        modal.style.display = "flex";
        modal.innerHTML = `
    <div class="game-stats-modal-content">
        <button class="close-btn" aria-label="Close">&times;</button>
        <div class="game-stats-flex">
            <div class="game-stats-left">
                ${data.legs
                    .map(
                        (leg, i) => `
                    <div class="leg-section card">
                        <h4>Leg ${i + 1}</h4>
                        <table class="stats-table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Start</th>
                                    <th>Turn</th>
                                    <th>End</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${leg
                                    .map(
                                        (row) => `
                                    <tr>
                                        <td>${row.player}</td>
                                        <td>${row.start}</td>
                                        <td>${row.turn}</td>
                                        <td>${row.end}</td>
                                    </tr>
                                `
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                    </div>
                `
                    )
                    .join("")}
            </div>
            <div class="game-stats-right card">
                <div class="verified-tag ${
                    data.verified ? "verified" : "unverified"
                }">
                    ${data.verified ? "Verified" : "Unverified"}
                </div>
                <div class="winner">
                    <span>Winner:</span> <b>${data.winner}</b>
                </div>
                <div class="averages">
                    <h5>Averages</h5>
                    <ul>
                        ${Object.entries(data.averages)
                            .map(
                                ([p, avg]) =>
                                    `<li><span>${p}:</span> <b>${avg}</b></li>`
                            )
                            .join("")}
                    </ul>
                </div>
                <div class="videos">
                    <h5>Videos</h5>
                    ${
                        data.videos.length === 0
                            ? `<div class="no-videos">No videos</div>`
                            : ""
                    }
                    ${data.videos
                        .map(
                            (v) => `
                        <div class="video-embed">
                            <iframe width="200" height="113" src="${v.url}" frameborder="0" allowfullscreen></iframe>
                            <div class="video-title">${v.title}</div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
                <div class="stats-actions">
                    ${
                        data.is_player
                            ? `<button class="main-btn upload-btn">Upload Video</button>`
                            : `<button class="main-btn approve-btn">Submit for Approval</button>`
                    }
                </div>
            </div>
        </div>
    </div>
    `;
        modal.querySelector(".close-btn").onclick = () => {
            modal.style.display = "none";
            modal.innerHTML = "";
        };
    };
})();