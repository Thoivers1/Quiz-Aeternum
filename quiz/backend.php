<?php

$data = json_decode(file_get_contents("php://input"), true);
$category = $data['category'] ?? 'General';
$difficulty = $data['difficulty'] ?? 'easy';

$api_key = "API KEY";
$prompt = <<<EOT
Generate a $difficulty multiple-choice trivia question about "$category".
There must be exactly one correct answer and three incorrect options.
Format your response as strict JSON with this structure:

{
  "question": "Your question?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option B"
}
EOT;

// OpenAI API call
$ch = curl_init("https://api.openai.com/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $api_key"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "gpt-4",
    "messages" => [
        ["role" => "user", "content" => $prompt]
    ] 
]));

$response = curl_exec($ch);

if (curl_errno($ch)) {
     echo json_encode(["question" => "Error calling OpenAI", "options" => [], "answer" => ""]);
     exit;
}

$data = json_decode($response, true);
$content = $data['choices'][0]['message']['content'] ?? '';

$jsonStart = strpos($content, '{');
$jsonContent = substr($content, $jsonStart);

$parsed = json_decode($jsonContent, true);

$question = $parsed['question'] ?? 'No question parsed';
$options = $parsed['options'] ?? [];
$answer = $parsed['answer'] ?? '';

// Return data to frontend
echo json_encode([
    "question" => $question,
    "options" => $options,
    "answer" => $answer
]);


