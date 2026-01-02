<?php
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) exit;

$file = __DIR__ . "/leaderboard.json";
$board = json_decode(file_get_contents($file), true);

$level = $data["level"];
$board[$level][] = [
  "nickname" => htmlspecialchars($data["nickname"]),
  "time" => $data["time"],
  "seconds" => (int)$data["seconds"],
  "created_at" => date("c")
];

usort($board[$level], fn($a,$b) => $a["seconds"] <=> $b["seconds"]);
$board[$level] = array_slice($board[$level], 0, 10);

file_put_contents($file, json_encode($board, JSON_PRETTY_PRINT));

echo json_encode(["message"=>"Score saved!"]);
