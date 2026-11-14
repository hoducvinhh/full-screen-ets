# Video Fullscreen

Tiện ích Manifest V3 cho Google Chrome và Microsoft Edge, giúp đưa video HTML5 trên website hiện tại (kể cả trong iframe) vào chế độ toàn màn hình khi trình phát không có nút fullscreen.

## Tính năng

- Bật bằng biểu tượng extension trên thanh công cụ hoặc phím tắt `Alt+Shift+F`.
- Ưu tiên video đang phát; nếu có nhiều video đang phát thì chọn video có phần hiển thị lớn nhất.
- Nếu không có video nào đang phát, chọn video hiển thị lớn nhất.
- Nhấn lại biểu tượng hoặc phím tắt khi video đang fullscreen để thoát.
- Nếu một phần tử khác đang fullscreen, extension báo trạng thái thay vì thay thế phần tử đó.
- Hỗ trợ website trên mọi domain; extension chỉ truy cập trang và các iframe sau khi người dùng bấm biểu tượng hoặc phím tắt.
- Dùng Fullscreen API của trình duyệt và tạm fit video theo tỉ lệ gốc, không kéo giãn hoặc cắt hình. Style hiển thị được khôi phục khi thoát fullscreen, kể cả khi thoát bằng `Esc`.
- Không tải, thay thế, chuyển mã hay điều chỉnh nguồn, bitrate hoặc chất lượng video.
- Yêu cầu quyền `activeTab`, `scripting` và quyền truy cập host trên mọi website để có thể tìm video trong iframe khác domain. Mã chỉ được inject khi người dùng kích hoạt extension.

## Cài đặt trên Google Chrome

1. Tải hoặc clone repository này về máy.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và chọn thư mục dự án có chứa `manifest.json`.
5. Ghim **Video Fullscreen** lên thanh công cụ để truy cập nhanh.

## Cài đặt trên Microsoft Edge

1. Tải hoặc clone repository này về máy.
2. Mở `edge://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và chọn thư mục dự án có chứa `manifest.json`.
5. Ghim **Video Fullscreen** lên thanh công cụ nếu muốn dùng biểu tượng.

Sau khi thay đổi mã nguồn, nhấn **Reload** trên trang quản lý extension để nạp phiên bản mới.

## Cách sử dụng

1. Mở trang có video HTML5 tiêu chuẩn.
2. Nếu trang có nhiều video, phát video muốn xem để extension ưu tiên video đó.
3. Nhấn biểu tượng extension hoặc dùng `Alt+Shift+F`.
4. Dùng `Esc` hoặc nhấn lại biểu tượng/phím tắt để thoát fullscreen.

Biểu tượng hiển thị `ON` khi vào fullscreen, `OFF` khi thoát và `!` khi thao tác không thực hiện được. Di chuột lên biểu tượng để xem thông tin chi tiết.

### Đổi phím tắt

- Chrome: mở `chrome://extensions/shortcuts/`.
- Edge: mở `edge://extensions/shortcuts/`.

Tìm **Video Fullscreen** và gán tổ hợp phím phù hợp. Nếu tổ hợp mặc định đang được trình duyệt hoặc extension khác sử dụng, hãy chọn tổ hợp khác tại trang này.

## Chọn video và chất lượng

Extension ước lượng diện tích đang nhìn thấy bằng giao giữa hình chữ nhật của video và vùng hiển thị của cửa sổ trình duyệt. Video bị ẩn, đã bị gỡ khỏi trang hoặc không có diện tích hiển thị sẽ bị bỏ qua.

Fullscreen chỉ phóng lớn phần hiển thị của video. Extension không thể tạo thêm chi tiết vượt quá chất lượng website cung cấp và không thay đổi lựa chọn chất lượng của trình phát. Nếu nguồn vốn có độ phân giải thấp, hình ảnh có thể trông mềm hoặc vỡ hạt khi phóng lớn.

## Giới hạn đã biết

- Không hỗ trợ player vẽ hình bằng canvas hoặc player không để lộ phần tử `<video>`.
- Không vượt qua DRM, sandbox, chính sách bảo mật hoặc giới hạn Fullscreen API của website/trình duyệt.
- Các trang nội bộ của trình duyệt, trang cửa hàng extension và một số trang được bảo vệ không cho phép extension inject mã.
- Fullscreen có thể bị từ chối nếu trình duyệt hoặc website không cho phép. Khi thấy `!`, xem tooltip trên biểu tượng để biết trạng thái.

## Chạy kiểm thử

Các kiểm thử dùng Node.js tích hợp sẵn, không cần cài dependency:

```powershell
node --test tests\*.test.js
```

Test bao phủ thuật toán chọn video, video ẩn/không kích thước/ngoài một phần viewport, video bị gỡ, fullscreen/thoát fullscreen, lỗi user activation và đường kích hoạt từ biểu tượng extension.

## Cấu trúc dự án

```text
manifest.json             Cấu hình extension Manifest V3 và shortcut
background.js             Inject script và báo trạng thái trên biểu tượng
content.js                Yêu cầu/thoát fullscreen và khôi phục style
utils/video-selector.js   Chọn video HTML5 phù hợp trong trang
tests/                    Unit test cho lựa chọn video và hành vi fullscreen
```
