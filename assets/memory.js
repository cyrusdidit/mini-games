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
  for (let i = 1; i <= window.__PAIRS__; i++) {
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

  if (first.dataset.id === second.dataset.id) {
    first.classList.add("matched");
    second.classList.add("matched");
    matched += 2;
    resetTurn();

    if (matched === window.__PAIRS__ * 2) {
      clearInterval(timer);
      saveBtn.disabled = false;
    }
  } else {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      resetTurn();
    }, 700);
  }
}

function resetTurn() {
  [first, second] = [null, null];
  lock = false;
}

function loadLeaderboard() {
  fetch("memory/leaderboard.json")
    .then(r => r.json())
    .then(data => {
      const list = data[window.__LEVEL__] || [];
      document.getElementById("leaderboard").innerHTML =
        list.map(s =>
          `<div>${s.nickname} – ${s.time}</div>`
        ).join("") || "No scores yet";
    });
}

saveBtn.onclick = () => {
  const nick = document.getElementById("nickname").value.trim();
  if (!nick) return;

  fetch("memory/save_score.php", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      nickname: nick,
      seconds,
      time: timeEl.textContent,
      level: window.__LEVEL__
    })
  })
  .then(r => r.json())
  .then(res => {
    msg.textContent = res.message;
    loadLeaderboard();
    saveBtn.disabled = true;
  });
};

createBoard();
loadLeaderboard();
