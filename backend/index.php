<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Simple router
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

switch ($path) {
    case '/api/unitkerja':
        require_once 'api/unitkerja.php';
        break;
    case '/api/edc':
        require_once 'api/edc.php';
        break;
    case '/api/monthly':
        require_once 'api/monthly.php';
        break;
    case '/api/inventory':
    case '/api/inventory/categories':
    case '/api/inventory/items':
    case '/api/inventory/movements':
    case '/api/inventory/reports':
        require_once 'api/inventory.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Endpoint tidak ditemukan']);
        break;
}
?>