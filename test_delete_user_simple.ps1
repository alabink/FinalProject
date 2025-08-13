# Script PowerShell đơn giản để test API delete user
# Sử dụng: .\test_delete_user_simple.ps1 -AdminToken "your_token" -UserId "user_id"

param(
    [Parameter(Mandatory=$true)]
    [string]$AdminToken,
    
    [Parameter(Mandatory=$true)]
    [string]$UserId,
    
    [string]$BaseUrl = "http://localhost:5000"
)

Write-Host "=== Test API Delete User ===" -ForegroundColor Green

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $AdminToken"
}

try {
    # Xóa user
    $deleteBody = @{ userId = $UserId } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/delete-user" -Method POST -Headers $headers -Body $deleteBody
    
    Write-Host "✓ $($response.message)" -ForegroundColor Green
    
    if ($response.metadata.deletedCounts) {
        Write-Host "`nChi tiết dữ liệu đã xóa:" -ForegroundColor Yellow
        $response.metadata.deletedCounts | Get-Member -MemberType NoteProperty | ForEach-Object {
            $propertyName = $_.Name
            $propertyValue = $response.metadata.deletedCounts.$propertyName
            Write-Host "  - $propertyName`: $propertyValue" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "✗ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
}
