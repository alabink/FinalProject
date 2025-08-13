# Script PowerShell để kiểm tra trạng thái hệ thống sau khi xóa user
# Sử dụng: .\check_system_status.ps1 -AdminToken "your_token"

param(
    [Parameter(Mandatory=$true)]
    [string]$AdminToken,
    
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "=== Kiểm tra trạng thái hệ thống ===" -ForegroundColor Green

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $AdminToken"
}

try {
    # Lấy thống kê admin
    Write-Host "`n📊 Thống kê hệ thống:" -ForegroundColor Cyan
    $statsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin-stats?period=week" -Method GET -Headers $headers
    
    $stats = $statsResponse.metadata
    Write-Host "  - Tổng số users: $($stats.totalUsers)" -ForegroundColor White
    Write-Host "  - Đơn hàng mới: $($stats.newOrders)" -ForegroundColor White
    Write-Host "  - Đơn hàng đang xử lý: $($stats.processingOrders)" -ForegroundColor White
    Write-Host "  - Đơn hàng đã giao: $($stats.completedOrders)" -ForegroundColor White
    Write-Host "  - Doanh thu hôm nay: $($stats.todayRevenue.ToString('N0')) VNĐ" -ForegroundColor White
    Write-Host "  - Tổng doanh thu tuần: $($stats.periodTotalRevenue.ToString('N0')) VNĐ" -ForegroundColor White
    
    # Lấy danh sách users
    Write-Host "`n👥 Danh sách users:" -ForegroundColor Cyan
    $usersResponse = Invoke-RestMethod -Uri "$BaseUrl/api/users" -Method GET -Headers $headers
    $users = $usersResponse.metadata
    
    if ($users.Count -gt 0) {
        $users | ForEach-Object { 
            $status = if ($_.isBlocked) { "🔒 Bị khóa" } else { "✅ Hoạt động" }
            $role = if ($_.isAdmin) { "👑 Admin" } else { "👤 User" }
            Write-Host "  - $($_.fullName) ($($_.email)) - $status - $role" -ForegroundColor White
        }
    } else {
        Write-Host "  Không có users nào" -ForegroundColor Yellow
    }
    
    # Lấy danh sách đơn hàng gần đây
    Write-Host "`n📦 Đơn hàng gần đây:" -ForegroundColor Cyan
    if ($stats.recentOrders.Count -gt 0) {
        $stats.recentOrders | ForEach-Object {
            $statusColor = switch ($_.status) {
                "Chờ xử lý" { "Yellow" }
                "Đã xác nhận" { "Blue" }
                "Đang giao" { "Cyan" }
                "Đã giao" { "Green" }
                "Đã hủy" { "Red" }
                default { "White" }
            }
            Write-Host "  - $($_.order): $($_.customer) - $($_.product) - $($_.amount.ToString('N0')) VNĐ" -ForegroundColor $statusColor
            Write-Host "    Trạng thái: $($_.status)" -ForegroundColor $statusColor
        }
    } else {
        Write-Host "  Không có đơn hàng nào" -ForegroundColor Yellow
    }
    
    # Kiểm tra sức khỏe hệ thống
    Write-Host "`n🔍 Kiểm tra sức khỏe hệ thống:" -ForegroundColor Cyan
    
    # Kiểm tra database connection
    try {
        $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET -TimeoutSec 5
        Write-Host "  - Database: ✅ Kết nối tốt" -ForegroundColor Green
    } catch {
        Write-Host "  - Database: ❌ Không thể kết nối" -ForegroundColor Red
    }
    
    # Kiểm tra API endpoints
    $endpoints = @(
        @{ Name = "Users API"; Path = "/api/users" },
        @{ Name = "Products API"; Path = "/api/products" },
        @{ Name = "Orders API"; Path = "/api/payments" },
        @{ Name = "Categories API"; Path = "/api/categories" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $testResponse = Invoke-RestMethod -Uri "$BaseUrl$($endpoint.Path)" -Method GET -Headers $headers -TimeoutSec 3
            Write-Host "  - $($endpoint.Name): ✅ Hoạt động" -ForegroundColor Green
        } catch {
            Write-Host "  - $($endpoint.Name): ❌ Lỗi" -ForegroundColor Red
        }
    }
    
    Write-Host "`n=== Kiểm tra hoàn thành ===" -ForegroundColor Green
    
} catch {
    Write-Host "`n✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
