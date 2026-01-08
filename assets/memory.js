const grid = document.getElementById("game");
const timeEl = document.getElementById("time");
const saveBtn = document.getElementById("saveBtn");
const msg = document.getElementById("msg");

let first = null;
let second = null;
let lock = false;
let matched = 0;

let timer = null;
let seconds = 0;
let started = false;

let moves = 0;
let pairsFound = 0;
const totalPairs = window.__PAIRS__;

function updateAccuracy() {
    const acc = moves === 0 ? 100 : Math.round((pairsFound / moves) * 100);
    document.getElementById("acc").textContent = acc;
    document.getElementById("moves").textContent = moves;
}

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        timeEl.textContent = `${m}:${s}`;
    }, 1000);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function createBoard() {
    const images = [];
    for (let i = 1; i <= totalPairs; i++) {
        images.push(i, i);
    }

    shuffle(images);

    images.forEach(id => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.id = id;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="assets/memory/img${id}.png">
                </div>
            </div>
        `;

        card.addEventListener("click", () => flip(card));
        grid.appendChild(card);
    });
}

function flip(card) {
    if (lock || card === first || card.classList.contains("matched")) return;

    if (!started) {
        started = true;
        startTimer();
    }

    card.classList.add("flipped");

    if (!first) {
        first = card;
        return;
    }

    second = card;
    lock = true;
    moves++;
    updateAccuracy();

    if (first.dataset.id === second.dataset.id) {
        // Correct match
        pairsFound++;
        updateAccuracy();

        first.classList.add("matched");
        second.classList.add("matched");
        matched += 2;

        resetTurn();

        if (matched === totalPairs * 2) {
            clearInterval(timer);
            saveBtn.disabled = false;
        }
    } else {
        // Wrong match
        setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            resetTurn();
        }, 600);
    }
}

function resetTurn() {
    [first, second] = [null, null];
    lock = false;
}

function loadLeaderboard() {
    fetch("load_memory_scores.php?level=" + window.__LEVEL__)
        .then(r => r.json())
        .then(data => {
            let html = "<table class='lb'><tr><th>#</th><th>Name</th><th>Time</th><th>Moves</th><th>Accuracy</th></tr>";

            if (data.length === 0) {
                html += "<tr><td colspan='5'>No scores yet</td></tr>";
            } else {
                data.slice(0, 10).forEach((row, i) => {
                    html += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${row.nickname}</td>
                            <td>${row.time}s</td>
                            <td>${row.moves}</td>
                            <td>${row.accuracy}%</td>
                        </tr>
                    `;
                });
            }

            html += "</table>";
            document.getElementById("leaderboard").innerHTML = html;
        });
}

saveBtn.onclick = () => {
    const nick = document.getElementById("nickname").value.trim();
    if (!nick) return;

    const accuracy = moves === 0 ? 100 : Math.round((pairsFound / moves) * 100);

    fetch("save_memory_score.php", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            nickname: nick,
            time: seconds,
            moves,
            accuracy,
            level: window.__LEVEL__
        })
    })
    .then(r => r.json())
    .then(res => {
        msg.textContent = res.success ? "Saved!" : "Error saving";
        saveBtn.disabled = true;
        loadLeaderboard();
    });
};

createBoard();
loadLeaderboard();
