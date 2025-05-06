<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);
$category = $data['category'] ?? 'General';
$difficulty = $data['difficulty'] ?? 'easy';

$api_key = getenv("OPENAI_API_KEY");
$prompt = "Generate a $difficulty multiple-choice trivia question about \"$category\". There must be exactly one correct answer and three clearly incorrect options. The options should be labeled A-D. Format strictly as:\n\nQuestion: ...\nOptions:\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: A/B/C/D";

$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $api_key"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4",
    "messages" => [["role" => "user", "content" => $prompt]]
]));

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["question" => "Error calling OpenAI", "options" => [], "answer" => ""]);
    exit;
}

$data = json_decode($response, true);
$content = $data['choices'][0]['message']['content'] ?? '';

preg_match('/Question:\s*(.+)/i', $content, $qMatch);
preg_match_all('/[A-D]\)\s*(.+)/', $content, $optMatch);
preg_match('/Answer:\s*([A-D])/', $content, $aMatch);

$options = array_unique($optMatch[1] ?? []);
$options = array_values($options);
$answerLetter = $aMatch[1] ?? '';
$answer = $options[ord($answerLetter) - ord('A')] ?? '';

echo json_encode([
    "question" => $qMatch[1] ?? "No question parsed.",
    "options" => $options,
    "answer" => $answer
]);
