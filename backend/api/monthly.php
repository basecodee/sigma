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
            
            $months = [
                'jan' => 'Januari',
                'feb' => 'Februari', 
                'mar' => 'Maret',
                'apr' => 'April',
                'mei' => 'Mei',
                'jun' => 'Juni',
                'jul' => 'Juli',
                'agu' => 'Agustus',
                'sep' => 'September',
                'okt' => 'Oktober',
                'nov' => 'November',
                'des' => 'Desember'
            ];
            
            $monthlyData = [];
            
            foreach($months as $monthKey => $monthName) {
                // Get Unit Kerja total for this month
                $query = "SELECT SUM(CASE WHEN $monthKey = 1 THEN tarif ELSE 0 END) as total FROM unit_kerja WHERE year = :year";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':year', $year);
                $stmt->execute();
                $unitKerjaTotal = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
                
                // Get EDC total for this month
                $query = "SELECT SUM(CASE WHEN $monthKey = 1 THEN tagihan ELSE 0 END) as total FROM edc_cctv WHERE year = :year";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':year', $year);
                $stmt->execute();
                $edcTotal = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
                
                $monthlyData[] = [
                    'month' => $monthKey,
                    'month_name' => $monthName,
                    'year' => (int)$year,
                    'unit_kerja_total' => (int)$unitKerjaTotal,
                    'edc_total' => (int)$edcTotal,
                    'total_pendapatan' => (int)($unitKerjaTotal + $edcTotal)
                ];
            }
            
            // Calculate yearly total
            $yearlyTotal = array_sum(array_column($monthlyData, 'total_pendapatan'));
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success', 
                'data' => $monthlyData,
                'year' => (int)$year,
                'yearly_total' => $yearlyTotal
            ]);
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