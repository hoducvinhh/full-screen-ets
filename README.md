# Video Fullscreen

Tiện ích Manifest V3 cho Google Chrome và Microsoft Edge. Tiện ích đưa video HTML5 trên tab hiện tại vào chế độ toàn màn hình khi trình phát của trang không có nút fullscreen.

## Tính năng

- Bật bằng cách nhấn biểu tượng extension trên thanh công cụ hoặc dùng phím tắt `Alt+Shift+F`.
- Ưu tiên video đang phát; nếu có nhiều video đang phát thì chọn video có phần hiển thị lớn nhất.
- Nếu không có video nào đang phát, chọn video có phần hiển thị lớn nhất.
- Nhấn biểu tượng hoặc phím tắt lần nữa khi video đang fullscreen để thoát fullscreen.
- Dùng Fullscreen API của trình duyệt. Khi fullscreen, video được fit trong màn hình theo tỉ lệ gốc, không kéo giãn hoặc cắt hình. Style hiển thị tạm thời được khôi phục khi thoát fullscreen.
- Không tải, thay thế, chuyển mã hay điều chỉnh nguồn, bitrate hoặc chất lượng video.
- Chỉ yêu cầu quyền `activeTab` và `scripting`; không yêu cầu quyền truy cập rộng lên mọi website.

## Cài đặt trên Google Chrome

1. Tải hoặc clone repository này về máy.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode** ở góc trên bên phải.
4. Chọn **Load unpacked**.
5. Chọn thư mục dự án có chứa `manifest.json`.
6. Mở menu Extensions trên thanh công cụ và ghim **Video Fullscreen** để truy cập nhanh.

## Cài đặt trên Microsoft Edge

1. Tải hoặc clone repository này về máy.
2. Mở `edge://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked**.
5. Chọn thư mục dự án có chứa `manifest.json`.
6. Ghim **Video Fullscreen** lên thanh công cụ nếu muốn dùng nút extension.

Đây là extension dùng chung Manifest V3 cho Chrome và Edge. Sau khi thay đổi mã nguồn, nhấn nút **Reload** trên trang quản lý extension để nạp phiên bản mới.

## Cách sử dụng

1. Mở trang có video HTML5 tiêu chuẩn.
2. Để có kết quả dễ dự đoán khi trang có nhiều video, phát video muốn xem.
3. Nhấn biểu tượng extension hoặc dùng `Alt+Shift+F`.
4. Dùng `Esc` hoặc nhấn lại biểu tượng/phím tắt để thoát fullscreen.

Ký hiệu trên biểu tượng extension cho biết kết quả: `ON` khi vào fullscreen, `OFF` khi thoát và `!` khi thao tác không thực hiện được. Di chuột lên biểu tượng để xem thông tin chi tiết.

### Đổi phím tắt

- Chrome: mở `chrome://extensions/shortcuts/`.
- Edge: mở `edge://extensions/shortcuts/`.

Tìm **Video Fullscreen** và gán tổ hợp phím phù hợp. Trình duyệt hoặc extension khác có thể đang sử dụng tổ hợp mặc định; trong trường hợp đó hãy chọn tổ hợp khác tại trang này.

## Chọn video và giữ chất lượng

Extension ước lượng diện tích đang nhìn thấy bằng giao giữa hình chữ nhật của video và vùng hiển thị của cửa sổ trình duyệt. Video bị ẩn, đã bị gỡ khỏi trang hoặc không có diện tích hiển thị sẽ bị bỏ qua.

Fullscreen chỉ phóng lớn phần hiển thị của video. Extension không thể tạo thêm chi tiết vượt quá độ phân giải/chất lượng mà website cung cấp, cũng không thay đổi lựa chọn chất lượng của trình phát. Nếu nguồn vốn có độ phân giải thấp, hình ảnh có thể trông mềm hoặc vỡ hạt khi phóng lớn.

## Giới hạn đã biết

- Chỉ tìm video HTML5 trong tài liệu chính của tab hiện tại. Video nằm trong iframe không được dò tìm trong phiên bản MVP.
- Không hỗ trợ player vẽ hình bằng canvas, player không để lộ phần tử `<video>`, hoặc những giao diện không dùng video HTML5 tiêu chuẩn.
- Không vượt qua DRM, sandbox, chính sách bảo mật hoặc giới hạn Fullscreen API của website/trình duyệt.
- Các trang nội bộ của trình duyệt (ví dụ trang quản lý extension), trang cửa hàng extension và một số trang được bảo vệ không cho phép extension inject mã.
- Khi một phần tử khác trên trang đang fullscreen, extension báo trạng thái đó thay vì thay thế phần tử.
- Fullscreen có thể bị từ chối nếu trình duyệt hoặc website không cho phép. Khi thấy `!`, xem tooltip trên biểu tượng; thử lại bằng thao tác trực tiếp trên tab video nếu trình duyệt báo thiếu user activation.

## Chạy kiểm thử

Các kiểm thử dùng Node.js tích hợp sẵn, không cần cài dependency cho extension:

```powershell
node --test tests\*.test.js
```

Test bao phủ thuật toán chọn video, video ẩn/không kích thước/ngoài một phần viewport, video bị gỡ, fullscreen/thoát fullscreen, lỗi user activation và đường kích hoạt từ biểu tượng extension.

## Cấu trúc dự án

```text
manifest.json             Cấu hình extension Manifest V3 và shortcut
background.js             Điều phối thao tác từ toolbar, inject script và báo trạng thái
content.js                Yêu cầu/thoát fullscreen và khôi phục style
utils/video-selector.js   Chọn video HTML5 phù hợp trong trang
tests/                    Unit test cho lựa chọn video và hành vi fullscreen
```
