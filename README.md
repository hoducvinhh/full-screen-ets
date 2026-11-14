# Video & Comic Fullscreen

Tiện ích Manifest V3 cho Google Chrome và Microsoft Edge, giúp đưa video HTML5 vào fullscreen hoặc đọc truyện tranh dạng ảnh trên website hiện tại.

## Tính năng

- Bấm biểu tượng extension để chọn fullscreen video, fullscreen một trang truyện hoặc đọc truyện cuộn dọc.
- `Alt+Shift+F` tiếp tục bật/tắt fullscreen video trực tiếp.
- Ưu tiên video đang phát; nếu có nhiều video đang phát thì chọn video có phần hiển thị lớn nhất.
- Nếu không có video nào đang phát, chọn video hiển thị lớn nhất.
- Dùng `Alt+Shift+F` hoặc `Esc` khi video đang fullscreen để thoát; biểu tượng extension luôn mở menu chọn chế độ.
- Nếu một phần tử khác đang fullscreen, extension báo trạng thái thay vì thay thế phần tử đó.
- Tìm ảnh `<img>` lớn trong khung đọc truyện trước, sau đó mới tìm ảnh lớn trên trang; ưu tiên nguồn ảnh đang được website chọn (`currentSrc`).
- Fullscreen ảnh có nút và phím mũi tên để chuyển trang; chế độ đọc xếp ảnh theo chiều dọc để cuộn liên tục. Dùng `Esc` hoặc nút **Đóng** để thoát.
- Không nén, chỉnh màu, sharpen hoặc thêm filter vào ảnh. Ảnh được fit trong màn hình theo tỉ lệ gốc; ảnh nhỏ có thể mềm khi được phóng lớn vì không thể tạo thêm chi tiết.
- Hỗ trợ website trên mọi domain; extension chỉ truy cập trang và các iframe sau khi người dùng bấm biểu tượng hoặc phím tắt.
- Dùng Fullscreen API của trình duyệt và tạm fit video theo tỉ lệ gốc, không kéo giãn hoặc cắt hình. Style hiển thị được khôi phục khi thoát fullscreen, kể cả khi thoát bằng `Esc`.
- Không tải, thay thế, chuyển mã hay điều chỉnh nguồn, bitrate hoặc chất lượng video.
- Yêu cầu quyền `activeTab`, `scripting` và quyền truy cập host trên mọi website để có thể tìm video trong iframe khác domain. Mã chỉ được inject khi người dùng kích hoạt extension.

## Cài đặt trên Google Chrome

1. Tải hoặc clone repository này về máy.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và chọn thư mục dự án có chứa `manifest.json`.
5. Ghim **Video & Comic Fullscreen** lên thanh công cụ để truy cập nhanh.

## Cài đặt trên Microsoft Edge

1. Tải hoặc clone repository này về máy.
2. Mở `edge://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và chọn thư mục dự án có chứa `manifest.json`.
5. Ghim **Video & Comic Fullscreen** lên thanh công cụ nếu muốn dùng biểu tượng.

Sau khi thay đổi mã nguồn, nhấn **Reload** trên trang quản lý extension để nạp phiên bản mới.

## Cách sử dụng

1. Mở trang có video HTML5 hoặc chương truyện dạng ảnh.
2. Bấm biểu tượng extension để mở menu và chọn chế độ mong muốn.
3. Với video, có thể dùng `Alt+Shift+F` để vào/thoát trực tiếp.
4. Với truyện, chọn **Fullscreen ảnh** để chuyển trang bằng nút hoặc phím mũi tên; chọn **Đọc truyện cuộn dọc** để xem các ảnh theo thứ tự.
5. Dùng `Esc` hoặc nút **Đóng** để thoát viewer.

Với video, biểu tượng hiển thị `ON` khi vào fullscreen, `OFF` khi thoát và `!` khi thao tác không thực hiện được. Di chuột lên biểu tượng để xem thông tin chi tiết.

### Đổi phím tắt

- Chrome: mở `chrome://extensions/shortcuts/`.
- Edge: mở `edge://extensions/shortcuts/`.

Tìm **Video & Comic Fullscreen** và gán tổ hợp phím phù hợp. Nếu tổ hợp mặc định đang được trình duyệt hoặc extension khác sử dụng, hãy chọn tổ hợp khác tại trang này.

Lệnh `Fullscreen the video on this page` có thể gán lại từ trang shortcuts. Biểu tượng extension luôn mở menu chọn chế độ.

## Chọn video và chất lượng

Extension ước lượng diện tích đang nhìn thấy bằng giao giữa hình chữ nhật của video và vùng hiển thị của cửa sổ trình duyệt. Video bị ẩn, đã bị gỡ khỏi trang hoặc không có diện tích hiển thị sẽ bị bỏ qua.

Fullscreen chỉ phóng lớn phần hiển thị của video. Extension không thể tạo thêm chi tiết vượt quá chất lượng website cung cấp và không thay đổi lựa chọn chất lượng của trình phát. Nếu nguồn vốn có độ phân giải thấp, hình ảnh có thể trông mềm hoặc vỡ hạt khi phóng lớn.

## Đọc truyện và chất lượng ảnh

Selector loại ảnh ẩn, ảnh chưa tải hoặc ảnh nhỏ thường dùng làm icon/thumbnail; ưu tiên ảnh nằm trong phần tử có tên/class gợi ý khu vực reader, comic, manga hoặc chapter. Nếu không nhận diện được khung đọc, selector dùng các ảnh lớn còn lại theo thứ tự tài liệu (các frame được ghép theo thứ tự frame). Nếu website đặt nhãn/DOM khác thường, có thể bỏ sót hoặc chọn nhầm ảnh.

Viewer dùng URL ảnh gốc và không vẽ lại pixel bằng filter, sharpen hay chỉnh màu. Chế độ fit màn hình có thể upscale ảnh nguồn nhỏ; khi đó ảnh trông mềm hơn dù dữ liệu ảnh không bị thay đổi. Một số website có thể chặn việc tải lại URL ảnh trong viewer, đặc biệt với ảnh tạm thời từ iframe. Canvas, ảnh nền CSS và nội dung không dùng phần tử `<img>` không được hỗ trợ.

## Giới hạn đã biết

- Không hỗ trợ player vẽ hình bằng canvas hoặc player không để lộ phần tử `<video>`.
- Truyện chỉ được nhận diện từ phần tử `<img>` đủ lớn; không hỗ trợ canvas, ảnh nền CSS, hoặc một số trang dùng DOM ẩn/ảo hóa.
- Không vượt qua DRM, sandbox, chính sách bảo mật hoặc giới hạn Fullscreen API của website/trình duyệt.
- Các trang nội bộ của trình duyệt, trang cửa hàng extension và một số trang được bảo vệ không cho phép extension inject mã.
- Fullscreen có thể bị từ chối nếu trình duyệt hoặc website không cho phép. Khi thấy `!`, xem tooltip trên biểu tượng để biết trạng thái.

## Chạy kiểm thử

Các kiểm thử dùng Node.js tích hợp sẵn, không cần cài dependency:

```powershell
node --test tests\*.test.js
```

Test bao phủ thuật toán chọn video/ảnh, lọc ảnh ẩn hoặc nhỏ, ưu tiên reader, fullscreen ảnh, chuyển trang, chế độ cuộn dọc, thoát bằng `Esc`, lỗi user activation và shortcut video.

## Cấu trúc dự án

```text
manifest.json                 Cấu hình extension Manifest V3 và shortcut
background.js                 Inject script, thu thập ảnh và điều phối menu
comic-viewer.js               Menu chọn chế độ, fullscreen ảnh và reader dọc
content.js                    Kích hoạt fullscreen video
utils/image-selector.js       Tìm ảnh truyện phù hợp trong trang
utils/video-fullscreen.js     Dùng chung logic fullscreen video
utils/video-selector.js       Chọn video HTML5 phù hợp trong trang
tests/                        Unit test cho selector và các chế độ đọc
```
