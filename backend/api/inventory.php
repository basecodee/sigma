<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));

// Determine the action based on URL path
$action = isset($path_parts[2]) ? $path_parts[2] : 'items';

switch($action) {
    case 'categories':
        handleCategories($db, $method);
        break;
    case 'items':
        handleItems($db, $method);
        break;
    case 'movements':
        handleMovements($db, $method);
        break;
    case 'reports':
        handleReports($db, $method);
        break;
    default:
        handleItems($db, $method);
        break;
}

function handleCategories($db, $method) {
    switch($method) {
        case 'GET':
            try {
                $query = "SELECT c.*, 
                         COUNT(i.id) as item_count 
                         FROM inventory_categories c 
                         LEFT JOIN inventory_items i ON c.id = i.category_id 
                         GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
                         ORDER BY c.name ASC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode(['status' => 'success', 'data' => $result]);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
            
        case 'POST':
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                
                $query = "INSERT INTO inventory_categories (name, description) VALUES (:name, :description)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':name', $data['name']);
                $stmt->bindParam(':description', $data['description']);
                $stmt->execute();
                
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Category created successfully']);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
    }
}

function handleItems($db, $method) {
    switch($method) {
        case 'GET':
            try {
                $search = isset($_GET['search']) ? $_GET['search'] : '';
                $category = isset($_GET['category']) ? $_GET['category'] : '';
                $status = isset($_GET['status']) ? $_GET['status'] : '';
                
                $query = "SELECT i.*, c.name as category_name,
                         CASE 
                           WHEN i.stock_quantity = 0 THEN 'out_of_stock'
                           WHEN i.stock_quantity <= i.min_stock_level THEN 'low_stock'
                           ELSE 'available'
                         END as stock_status
                         FROM inventory_items i 
                         LEFT JOIN inventory_categories c ON i.category_id = c.id 
                         WHERE 1=1";
                
                $params = [];
                
                if (!empty($search)) {
                    $query .= " AND (i.name ILIKE :search OR i.sku ILIKE :search OR i.description ILIKE :search)";
                    $params[':search'] = '%' . $search . '%';
                }
                
                if (!empty($category)) {
                    $query .= " AND i.category_id = :category";
                    $params[':category'] = $category;
                }
                
                if (!empty($status)) {
                    if ($status === 'out_of_stock') {
                        $query .= " AND i.stock_quantity = 0";
                    } elseif ($status === 'low_stock') {
                        $query .= " AND i.stock_quantity > 0 AND i.stock_quantity <= i.min_stock_level";
                    } elseif ($status === 'available') {
                        $query .= " AND i.stock_quantity > i.min_stock_level";
                    }
                }
                
                $query .= " ORDER BY i.name ASC";
                
                $stmt = $db->prepare($query);
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
                $stmt->execute();
                
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Convert numeric values
                foreach($result as &$row) {
                    $row['price'] = (float)$row['price'];
                    $row['stock_quantity'] = (int)$row['stock_quantity'];
                    $row['min_stock_level'] = (int)$row['min_stock_level'];
                }
                
                http_response_code(200);
                echo json_encode(['status' => 'success', 'data' => $result]);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
            
        case 'POST':
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                
                $query = "INSERT INTO inventory_items (name, category_id, sku, description, price, stock_quantity, min_stock_level, status) 
                          VALUES (:name, :category_id, :sku, :description, :price, :stock_quantity, :min_stock_level, :status)";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':name', $data['name']);
                $stmt->bindParam(':category_id', $data['category_id']);
                $stmt->bindParam(':sku', $data['sku']);
                $stmt->bindParam(':description', $data['description']);
                $stmt->bindParam(':price', $data['price']);
                $stmt->bindParam(':stock_quantity', $data['stock_quantity']);
                $stmt->bindParam(':min_stock_level', $data['min_stock_level']);
                $stmt->bindParam(':status', $data['status']);
                $stmt->execute();
                
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Item created successfully']);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
            
        case 'PUT':
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                $id = isset($_GET['id']) ? $_GET['id'] : null;
                
                if(!$id) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'ID not provided']);
                    break;
                }
                
                $query = "UPDATE inventory_items SET 
                          name = :name, 
                          category_id = :category_id, 
                          sku = :sku, 
                          description = :description, 
                          price = :price, 
                          min_stock_level = :min_stock_level, 
                          status = :status,
                          updated_at = now()
                          WHERE id = :id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->bindParam(':name', $data['name']);
                $stmt->bindParam(':category_id', $data['category_id']);
                $stmt->bindParam(':sku', $data['sku']);
                $stmt->bindParam(':description', $data['description']);
                $stmt->bindParam(':price', $data['price']);
                $stmt->bindParam(':min_stock_level', $data['min_stock_level']);
                $stmt->bindParam(':status', $data['status']);
                $stmt->execute();
                
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Item updated successfully']);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
            
        case 'DELETE':
            try {
                $id = isset($_GET['id']) ? $_GET['id'] : null;
                
                if(!$id) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'ID not provided']);
                    break;
                }
                
                $query = "DELETE FROM inventory_items WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Item deleted successfully']);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
    }
}

function handleMovements($db, $method) {
    switch($method) {
        case 'GET':
            try {
                $item_id = isset($_GET['item_id']) ? $_GET['item_id'] : '';
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                
                $query = "SELECT sm.*, i.name as item_name, i.sku 
                         FROM stock_movements sm 
                         JOIN inventory_items i ON sm.item_id = i.id";
                
                if (!empty($item_id)) {
                    $query .= " WHERE sm.item_id = :item_id";
                }
                
                $query .= " ORDER BY sm.created_at DESC LIMIT :limit";
                
                $stmt = $db->prepare($query);
                if (!empty($item_id)) {
                    $stmt->bindParam(':item_id', $item_id);
                }
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
                
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach($result as &$row) {
                    $row['quantity'] = (int)$row['quantity'];
                }
                
                http_response_code(200);
                echo json_encode(['status' => 'success', 'data' => $result]);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
            
        case 'POST':
            try {
                $data = json_decode(file_get_contents("php://input"), true);
                
                $query = "INSERT INTO stock_movements (item_id, movement_type, quantity, reference_number, notes, created_by) 
                          VALUES (:item_id, :movement_type, :quantity, :reference_number, :notes, :created_by)";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':item_id', $data['item_id']);
                $stmt->bindParam(':movement_type', $data['movement_type']);
                $stmt->bindParam(':quantity', $data['quantity']);
                $stmt->bindParam(':reference_number', $data['reference_number']);
                $stmt->bindParam(':notes', $data['notes']);
                $stmt->bindParam(':created_by', $data['created_by']);
                $stmt->execute();
                
                http_response_code(201);
                echo json_encode(['status' => 'success', 'message' => 'Stock movement recorded successfully']);
            } catch(PDOException $exception) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
            }
            break;
    }
}

function handleReports($db, $method) {
    if ($method === 'GET') {
        try {
            $report_type = isset($_GET['type']) ? $_GET['type'] : 'stock_summary';
            
            switch($report_type) {
                case 'stock_summary':
                    $query = "SELECT 
                             c.name as category,
                             COUNT(i.id) as total_items,
                             SUM(i.stock_quantity) as total_stock,
                             SUM(CASE WHEN i.stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                             SUM(CASE WHEN i.stock_quantity > 0 AND i.stock_quantity <= i.min_stock_level THEN 1 ELSE 0 END) as low_stock,
                             SUM(i.stock_quantity * i.price) as total_value
                             FROM inventory_categories c
                             LEFT JOIN inventory_items i ON c.id = i.category_id
                             GROUP BY c.id, c.name
                             ORDER BY c.name";
                    break;
                    
                case 'low_stock':
                    $query = "SELECT i.*, c.name as category_name
                             FROM inventory_items i
                             LEFT JOIN inventory_categories c ON i.category_id = c.id
                             WHERE i.stock_quantity <= i.min_stock_level
                             ORDER BY i.stock_quantity ASC";
                    break;
                    
                case 'movements':
                    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;
                    $query = "SELECT sm.*, i.name as item_name, i.sku, c.name as category_name
                             FROM stock_movements sm
                             JOIN inventory_items i ON sm.item_id = i.id
                             LEFT JOIN inventory_categories c ON i.category_id = c.id
                             WHERE sm.created_at >= NOW() - INTERVAL '$days days'
                             ORDER BY sm.created_at DESC";
                    break;
                    
                default:
                    $query = "SELECT 'Invalid report type' as error";
            }
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(['status' => 'success', 'data' => $result]);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
        }
    }
}
?>