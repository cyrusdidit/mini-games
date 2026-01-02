<?php
$levels = [
  "easy" => [2, 2],
  "medium" => [3, 4],
  "hard" => [4, 5],
];

$level = $_GET["level"] ?? "easy";
if (!isset($levels[$level])) $level = "easy";

[$rows, $cols] = $levels[$level];
$totalCards = $rows * $cols;
$pairs = $totalCards / 2;
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="assets/style.css">
  <title>Memory Cards</title>
</head>
<body>
<?php include __DIR__ . "/partials/header.php"; ?>

<main style="max-width:1000px;margin:20px auto;padding:0 12px;">
  <h1>Memory Cards</h1>

  <form method="GET" style="margin-bottom:12px;">
    <label>Difficulty:</label>
    <select name="level" onchange="this.form.submit()">
      <option value="easy" <?= $level==="easy"?"selected":"" ?>>Easy (2×2)</option>
      <option value="medium" <?= $level==="medium"?"selected":"" ?>>Medium (3×4)</option>
      <option value="hard" <?= $level==="hard"?"selected":"" ?>>Hard (4×5)</option>
    </select>
    <button type="button" onclick="window.location.reload()">Restart</button>
  </form>

  <div class="memory-info">
    Time: <span id="time">00:00</span>
  </div>

  <div 
    id="game" 
    class="memory-grid"
    style="--cols:<?= $cols ?>;"
  ></div>

  <div class="memory-save">
    <input id="nickname" placeholder="Nickname" maxlength="20">
    <button id="saveBtn" disabled>Save result</button>
    <span id="msg"></span>
  </div>

  <h2>Leaderboard (<?= htmlspecialchars($level) ?>)</h2>
  <div id="leaderboard">Loading...</div>
</main>

<script>
  window.__LEVEL__ = <?= json_encode($level) ?>;
  window.__PAIRS__ = <?= $pairs ?>;
</script>
<script src="assets/memory.js"></script>
</body>
</html>
