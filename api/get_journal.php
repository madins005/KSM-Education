<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    echo json_encode(['ok' => false, 'message' => 'id required']); 
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT j.*, 
               u.url as file_url, 
               c.url as cover_url 
        FROM journals j
        LEFT JOIN uploads u ON u.id = j.file_upload_id
        LEFT JOIN uploads c ON c.id = j.cover_upload_id
        WHERE j.id = ? 
        LIMIT 1
    ");
    
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if (!$row) { 
        http_response_code(404);
        echo json_encode(['ok' => false, 'message' => 'Journal not found']); 
        exit; 
    }

    // ✅ FIX: Use 'result' instead of 'journal'
    echo json_encode(['ok' => true, 'result' => $row]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
