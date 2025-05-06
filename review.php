<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);
$wrongAnswers = $data['wrongAnswers'] ?? [];

//$api_key = getenv("OPENAI_API_KEY");

// Create a single prompt summarizing all wrong answers
$reviewPrompt = "For each of the following questions, explain why the selected answer is incorrect and why the correct one is right:\n\n";
foreach ($wrongAnswers as $item) {
    $reviewPrompt .= "Question: {$item['question']}\n";
    $reviewPrompt .= "Options: " . implode(", ", $item['options']) . "\n";
    $reviewPrompt .= "User's Answer: {$item['user']}\n";
    $reviewPrompt .= "Correct Answer: {$item['correct']}\n\n";
}


$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $api_key"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4",
    "messages" => [["role" => "user", "content" => $reviewPrompt]]
]));

$response = curl_exec($ch);

$data = json_decode($response, true);
$content = $data['choices'][0]['message']['content'] ?? 'No explanations found.';

$explanations = preg_split("/\n{2,}/", trim($content));

echo json_encode(["explanations" => $explanations]);
