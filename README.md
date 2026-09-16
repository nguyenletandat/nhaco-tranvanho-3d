# Nhà Cổ Trần Văn Hổ — 3D

🔗 **Demo:** https://nguyenletandat.github.io/nhaco-tranvanho-3d/ ·
[Bản đồ 3D](https://nguyenletandat.github.io/nhaco-tranvanho-3d/map.html)

Trang web tĩnh giới thiệu Nhà cổ ông Trần Văn Hổ (di tích kiến trúc nghệ thuật
cấp Quốc gia, số 18 đường Bạch Đằng, phường Phú Cường, TP. Thủ Dầu Một, tỉnh
Bình Dương), gồm hai trang:

- **`index.html`** — trang kể chuyện: hero, mô hình 3D tương tác (`<model-viewer>`),
  câu chuyện lịch sử, dòng thời gian, thư viện ảnh, so sánh xưa/nay, vị trí.
- **`map.html`** — bản đồ 3D tương tác: viewport MapLibre GL với khối nhà đùn
  3D từ mặt bằng CAD, sidebar lọc lớp theo hạng mục, danh sách điểm tham quan,
  và nút "Bắt đầu tham quan" bay lần lượt qua các điểm mốc. Bố cục lấy cảm hứng
  từ [gxu-campus-3d](https://wcqqq1214.github.io/gxu-campus-3d/) (bản đồ 3D
  campus Đại học Quảng Tây), dựng bằng MapLibre GL JS thay vì WebGL tự viết.

HTML + CSS + JavaScript thuần — không framework, không backend. Chỉ cần một
static file server bất kỳ (hoặc GitHub Pages) là chạy được.

## Cấu trúc

```
├── index.html          # trang kể chuyện (hero/timeline/gallery/model-viewer)
├── map.html            # bản đồ 3D tương tác (MapLibre GL, kiểu gxu-campus-3d)
├── style.css           # giao diện dùng chung (tông màu ấm: nâu đất / vàng đồng / be)
├── map.css             # giao diện riêng cho map.html (sidebar tối, viewport bản đồ)
├── script.js           # AOS init, timeline, hotspot, lightbox, slider so sánh, share (index.html)
├── map.js              # khởi tạo MapLibre, lọc lớp, danh sách/marker điểm tham quan, tour tự động
├── floorplan.geojson   # khối nhà + phòng (WGS84, dùng cho fill-extrusion trên map.html)
├── landmarks.geojson   # 8 điểm tham quan (toạ độ + mô tả) hiển thị trên map.html
├── 3DNhaCo.glb         # mô hình 3D hiển thị qua <model-viewer> trên index.html
└── assets/             # ảnh hero/story/gallery/compare
```

Thư viện dùng qua CDN (không cần cài đặt): [`@google/model-viewer`](https://modelviewer.dev/)
và [AOS](https://michalsnik.github.io/aos/) cho `index.html`;
[MapLibre GL JS](https://maplibre.org/) + nền [OpenFreeMap](https://openfreemap.org/)
(không cần API key) cho `map.html`.

## Chạy thử cục bộ

Cần serve qua HTTP (mở trực tiếp bằng `file://` sẽ bị chặn fetch mô hình 3D
do CORS). Dùng bất kỳ static server nào, ví dụ:

```bash
# Python
python -m http.server 8080

# hoặc Node
npx serve .
```

Rồi mở `http://localhost:8080`.

## Đã cập nhật (2026-08-27)

- **Ảnh thật**: hero, 3 ảnh câu chuyện, và 14 ảnh thư viện (8 vị trí gốc +
  6 ảnh nội thất bổ sung: bàn thờ, hoành phi, không gian thờ cúng, phản gỗ
  gian tiếp khách, buồng ngủ, không gian sinh hoạt) đã được thay bằng ảnh
  thật lấy từ bộ ảnh sinh viên thu thập, đã resize + nén (JPG, cạnh dài tối đa
  2000px). `gallery-8.jpg` là bản vẽ phục dựng mặt bằng khuôn viên (render lại
  từ PDF).
- **Mô hình 3D**: `3DNhaCo.glb` đã được dựng lại từ file quét
  `NHA ONG TRAN VAN HO.obj` (SketchUp, ~11,6 triệu đỉnh, ~1,26 GB). File gốc
  không kèm `.mtl`/texture nên mô hình mới **không có ảnh texture thật** — các
  mặt được tô màu theo hướng pháp tuyến (mái = màu ngói đất nung, tường = màu
  gỗ, sân = màu be, cây xanh = màu lá) để dễ đọc hình khối hơn màu xám trơn.
  File gốc chứa cả một dãy nhiều căn nhà lân cận; đã xác định và cắt riêng
  đúng khuôn viên nhà ông Trần Văn Hổ (cổng + nhà + sân vườn), rồi giảm từ
  ~10,5 triệu xuống còn ~800 nghìn mặt để tải được trên web/mobile.
  Toạ độ 3 hotspot mẫu cũng đã ước lượng lại cho khớp mô hình mới.

## Việc còn cần làm

Các mục còn lại đều có comment `TODO` ngay tại chỗ trong `index.html`:

- **Slider so sánh Xưa/Nay** (`assets/compare-old.jpg` / `compare-new.jpg`):
  đã dùng ảnh thật (`compare-old_goc-a_01`, `compare-new_goc-a_01`), nhưng
  **hai ảnh không cùng góc chụp** (ảnh xưa chụp từ cổng ngoài đường, ảnh nay
  chụp từ trong sân) nên hiệu ứng "kéo để so sánh" chưa thật sự chuẩn — vẫn
  hiển thị được vì cả hai đều là ảnh thật của công trình. Nếu muốn hiệu ứng
  so sánh chuẩn (cùng một khung hình theo thời gian), cần chụp lại ảnh "nay"
  đúng cùng góc với ảnh "xưa" rồi thay 2 file JPG đó.
- **Văn bản lịch sử**: 3 đoạn trong mục "Câu chuyện lịch sử" và 3/5 mốc trong
  `TIMELINE_DATA` (đầu `script.js`, đánh dấu `19xx`/`20xx`) vẫn là placeholder
  — cần điền tư liệu lịch sử thật đã xác minh.
- **Nội dung chú thích hotspot**: toạ độ đã đúng vị trí (cổng/mái/sân), nhưng
  nội dung text trong mỗi `<div class="hotspot-annotation">` vẫn là
  placeholder — cần viết mô tả lịch sử/kiến trúc thật cho từng điểm. Toạ độ
  cũng chỉ ước lượng bằng mắt, có thể cần tinh chỉnh thêm vài chục cm khi mở
  thử trên site.
- **Vị trí**: khối `<iframe>` Google Maps đang nhúng theo địa chỉ text (chưa
  phải toạ độ khảo sát chính xác). Thay bằng toạ độ chính xác khi có, và điền
  giờ mở cửa thật (đang là placeholder).
- **Footer**: tên đơn vị quản lý di tích và thông tin liên hệ đang là
  placeholder trong `index.html` (mục `.footer__org`).
- **Meta chia sẻ**: `og:image` chưa có ảnh — thêm khi có ảnh đại diện chính thức.
- **`map.html` — toạ độ điểm tham quan**: `landmarks.geojson` và
  `floorplan.geojson` dùng anchor cấp độ đường phố (Nominatim không phân giải
  được chính xác "số 18 Bạch Đằng") cộng suy luận từ mặt bằng CAD nội bộ —
  KHÔNG phải toạ độ khảo sát GPS thực địa, và góc xoay công trình = 0° chỉ là
  giả định. Cần thay bằng toạ độ đo thực địa hoặc đối chiếu ảnh vệ tinh trước
  khi dùng cho mục đích khác ngoài minh hoạ. Nội dung mô tả của "Cổng chính" /
  "Sân trong" trong `landmarks.geojson` cũng là placeholder vị trí ước lượng.

## Ghi chú kỹ thuật

- Nút chia sẻ Facebook/Zalo dùng `window.location.href` của trang đang mở —
  hoạt động đúng ngay khi deploy lên domain thật, không cần cấu hình thêm.
- Slider so sánh ảnh xưa/nay và lightbox thư viện ảnh là code tự viết (không
  phụ thuộc thư viện ngoài) trong `script.js`.
- `3DNhaCo.glb` (~20 MB) được commit thẳng vào Git — vẫn trong giới hạn bình
  thường của GitHub (không cần Git LFS ở kích thước này), nhưng nếu sau này
  thay bằng model nặng hơn nhiều (>100 MB) thì cần cân nhắc Git LFS.
