<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id'])) {
        throw new Exception('Journal ID required');
    }

    $id = intval($input['id']);
    $title = $input['title'] ?? '';
    $abstract = $input['abstract'] ?? '';
    $authors = $input['authors'] ?? [];
    $email = $input['email'] ?? '';
    $contact = $input['contact'] ?? '';

    if (empty($title) || empty($abstract)) {
        throw new Exception('Title and abstract are required');
    }

    $authorsJson = json_encode($authors);

    $volume = $input['volume'] ?? '';

    $stmt = $pdo->prepare("
    UPDATE journals 
    SET title = ?, abstract = ?, authors = ?, email = ?, contact = ?, volume = ?, updated_at = NOW()
    WHERE id = ?
");

    $stmt->execute([
        $title,
        $abstract,
        $authorsJson,
        $email,
        $contact,
        $volume,  // TAMBAH
        $id
    ]);


    echo json_encode([
        'ok' => true,
        'message' => 'Journal updated successfully',
        'id' => $id
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage()
    ]);
}
