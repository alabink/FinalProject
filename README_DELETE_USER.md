# API Delete User - Hướng dẫn sử dụng

## Tổng quan
API này cho phép admin xóa user và tất cả dữ liệu liên quan một cách toàn diện. Khi xóa user, hệ thống sẽ tự động xóa:

- ✅ Tất cả đơn hàng của user
- ✅ Giỏ hàng của user  
- ✅ Bình luận của user
- ✅ Tương tác người dùng với sản phẩm
- ✅ Đánh giá sản phẩm của user
- ✅ API keys của user
- ✅ Mã OTP của user
- ✅ Thông tin user

## Endpoint
```
POST /api/delete-user
```

## Headers
```
Content-Type: application/json
Authorization: Bearer {admin_token}
```

## Body
```json
{
    "userId": "user_id_here"
}
```

## Response thành công
```json
{
    "message": "Đã xóa tài khoản và tất cả dữ liệu liên quan thành công",
    "metadata": {
        "deleted": true,
        "deletedCounts": {
            "orders": 5,
            "cart": 2,
            "comments": 3,
            "interactions": 10,
            "productPreviews": 2,
            "apiKeys": 1,
            "otp": 1
        },
        "message": "Đã xóa 5 đơn hàng, 2 giỏ hàng, 3 bình luận, 10 tương tác, 2 đánh giá sản phẩm, 1 API keys, 1 mã OTP"
    }
}
```

## Cách sử dụng

### 1. Sử dụng PowerShell script
```powershell
# Script đơn giản
.\test_delete_user_simple.ps1 -AdminToken "your_admin_token" -UserId "user_id_to_delete"

# Script chi tiết với kiểm tra
.\test_delete_user.ps1 -AdminToken "your_admin_token" -UserId "user_id_to_delete"
```

### 2. Sử dụng cURL
```bash
curl -X POST "http://localhost:5000/api/delete-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{"userId": "user_id_here"}'
```

### 3. Sử dụng Postman
- Method: POST
- URL: `http://localhost:5000/api/delete-user`
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer your_admin_token`
- Body (raw JSON):
  ```json
  {
      "userId": "user_id_here"
  }
  ```

## Lưu ý quan trọng

### ⚠️ Bảo mật
- Chỉ admin mới có quyền sử dụng API này
- Không thể xóa tài khoản admin
- Token phải còn hiệu lực

### 🔄 Tự động cập nhật
- Dashboard admin sẽ tự động cập nhật thống kê sau khi xóa user
- Số lượng users, đơn hàng sẽ được cập nhật real-time
- Không cần refresh thủ công

### 🗑️ Dữ liệu bị xóa
Tất cả dữ liệu liên quan đến user sẽ bị xóa vĩnh viễn:
- **Đơn hàng**: Lịch sử mua hàng, thanh toán
- **Giỏ hàng**: Sản phẩm trong giỏ hàng
- **Bình luận**: Đánh giá, nhận xét về sản phẩm
- **Tương tác**: Lịch sử xem, click, yêu thích sản phẩm
- **Đánh giá**: Review chi tiết sản phẩm
- **API keys**: Khóa API của user
- **OTP**: Mã xác thực

### 📊 Dashboard Admin
Sau khi xóa user:
- Tổng số users sẽ giảm
- Thống kê đơn hàng sẽ được cập nhật
- Biểu đồ doanh thu sẽ phản ánh chính xác
- Danh sách đơn hàng gần đây sẽ được lọc

## Xử lý lỗi

### Lỗi thường gặp
1. **401 Unauthorized**: Token không hợp lệ hoặc hết hạn
2. **403 Forbidden**: Không có quyền admin
3. **400 Bad Request**: 
   - Thiếu userId
   - User không tồn tại
   - Không thể xóa tài khoản admin
4. **500 Internal Server Error**: Lỗi server

### Kiểm tra trạng thái
```powershell
# Kiểm tra xem user đã bị xóa chưa
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId" -Method GET -Headers $headers
```

## Ví dụ thực tế

### Bước 1: Lấy admin token
```powershell
# Đăng nhập admin và lấy token
$loginBody = @{
    email = "admin@example.com"
    password = "admin_password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/login" -Method POST -Body $loginBody -ContentType "application/json"
$adminToken = $loginResponse.metadata.token
```

### Bước 2: Xóa user
```powershell
# Xóa user với ID cụ thể
.\test_delete_user_simple.ps1 -AdminToken $adminToken -UserId "64f8a1b2c3d4e5f6a7b8c9d0"
```

### Bước 3: Kiểm tra kết quả
- Dashboard admin sẽ hiển thị số users giảm
- Thống kê đơn hàng sẽ được cập nhật
- Tất cả dữ liệu liên quan đã bị xóa

## Kết luận
API delete user đã được implement hoàn chỉnh với khả năng xóa toàn bộ dữ liệu liên quan đến user. Dashboard admin sẽ tự động cập nhật để phản ánh chính xác trạng thái hệ thống sau khi xóa user.
