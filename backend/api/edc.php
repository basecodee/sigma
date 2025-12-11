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

switch($method) {
    case 'GET':
        try {
            $year = isset($_GET['year']) ? $_GET['year'] : date('Y');
            $query = "SELECT * FROM edc_cctv WHERE year = :year ORDER BY nama_lokasi ASC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':year', $year);
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert boolean values
            foreach($result as &$row) {
                $months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
                foreach($months as $month) {
                    $row[$month] = (bool)$row[$month];
                }
                $row['id'] = (int)$row['id'];
                $row['year'] = (int)$row['year'];
                $row['tagihan'] = (int)$row['tagihan'];
                $row['total'] = (int)$row['total'];
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
            
            $query = "INSERT INTO edc_cctv (nama_lokasi, year, jenis, tagihan, jan, feb, mar, apr, mei, jun, jul, agu, sep, okt, nov, des, total) 
                      VALUES (:nama_lokasi, :year, :jenis, :tagihan, :jan, :feb, :mar, :apr, :mei, :jun, :jul, :agu, :sep, :okt, :nov, :des, :total)";
            
            $stmt = $db->prepare($query);
            
            // Calculate total
            $months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
            $checkedMonths = 0;
            foreach($months as $month) {
                if(isset($data[$month]) && $data[$month]) {
                    $checkedMonths++;
                }
            }
            $total = $checkedMonths * $data['tagihan'];
            
            $stmt->bindParam(':nama_lokasi', $data['nama_lokasi']);
            $stmt->bindParam(':year', $data['year']);
            $stmt->bindParam(':jenis', $data['jenis']);
            $stmt->bindParam(':tagihan', $data['tagihan']);
            $stmt->bindParam(':total', $total);
            
            foreach($months as $month) {
                $value = isset($data[$month]) && $data[$month] ? 1 : 0;
                $stmt->bindParam(':' . $month, $value);
            }
            
            $stmt->execute();
            
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Data berhasil ditambahkan', 'id' => $db->lastInsertId()]);
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
                echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
                break;
            }
            
            // Get current data
            $query = "SELECT * FROM edc_cctv WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $currentData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(!$currentData) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Data tidak ditemukan']);
                break;
            }
            
            // Update data
            $months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
            $checkedMonths = 0;
            
            foreach($months as $month) {
                if(isset($data[$month])) {
                    $currentData[$month] = $data[$month] ? 1 : 0;
                }
                if($currentData[$month]) {
                    $checkedMonths++;
                }
            }
            
            $total = $checkedMonths * $currentData['tagihan'];
            
            $query = "UPDATE edc_cctv SET jan=:jan, feb=:feb, mar=:mar, apr=:apr, mei=:mei, jun=:jun, 
                      jul=:jul, agu=:agu, sep=:sep, okt=:okt, nov=:nov, des=:des, total=:total WHERE id=:id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':total', $total);
            
            foreach($months as $month) {
                $stmt->bindParam(':' . $month, $currentData[$month]);
            }
            
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Data berhasil diupdate']);
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
                echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
                break;
            }
            
            $query = "DELETE FROM edc_cctv WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Data berhasil dihapus']);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $exception->getMessage()]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
        break;
}
?>