# Cấu trúc dự án GPS Map

## 1. Cây thư mục

```text
GPS-Map/
├── src/
│   ├── index.html   # Khung trang, các vùng giao diện và điểm móc DOM
│   ├── styles.css   # Màu sắc, bố cục, trạng thái, thẻ chi tiết, HUD dẫn đường & responsive
│   ├── ui.js        # Điều khiển giao diện, ngôn ngữ, Puck, Bottom Sheet & HUD dẫn đường
│   └── app.js       # Bản đồ, GPS, tìm kiếm, lộ trình OSRM, camera theo dõi & dẫn đường
└── docs/
    └── PROJECT_STRUCTURE.md
```

Hiện tại không có thư mục hoặc file mã nguồn nào khác trong thư mục dự án. Ứng dụng tải MapLibre GL JS/CSS từ CDN; bản đồ nền dùng CARTO, dịch vụ địa điểm/tuyến đường dùng Nominatim, Photon và OSRM, còn tên/địa chỉ thiếu bản dịch được xử lý qua MyMemory.

## 2. Các file chính

### `index.html`

**Các khối chính:**
- HUD tốc độ/GPS (`.top-left-hud`).
- Banner chỉ hướng rẽ trên cùng (`#nav-top-banner`) và bước kế tiếp (`#nav-next-sub`).
- Cụm điều khiển nổi bên phải (`.right-controls`) và la bàn (`#btn-north`).
- HUD dẫn đường: tốc độ (`#nav-speed-pill`), thông tin chuyến đi/ETA (`#nav-bottom-hud`), nút kết thúc (`#btn-end-trip`) và nút quay lại vị trí (`#btn-recenter`).
- Công tắc GPS dạng pill (`#gps-toggle-switch`) và chấm trạng thái (`#gps-dot`).
- Bottom Sheet kiểu Apple Maps (`.bottom-sheet`):
  - `.sheet-header`: Thanh nắm và ô tìm kiếm; kéo vùng trống để điều chỉnh chiều cao, chạm nhanh hai lần để thu gọn.
  - `.sheet-scroll-body`: Danh sách gợi ý, chi tiết địa điểm, danh mục quanh đây và lịch sử; cuộn riêng, ưu tiên cuộn khi danh sách chưa ở đầu.
  - `#place-detail-card`: Thẻ chi tiết địa điểm gồm tiêu đề, phụ đề, huy hiệu đã lưu, nút đóng `(X)`, nút hành động chính "Đi đường • ETA" (`#btn-place-route`), nút Lưu (`#btn-place-save`), nút Chia sẻ tọa độ (`#btn-place-share`), và khối Details hiển thị Địa chỉ, Tọa độ chuẩn hóa, Khoảng cách.
  - `#vehicle-mode-bar`: Bộ chọn phương tiện (Xe máy / Ô tô) trong thẻ chi tiết.
  - `#search-wrapper`: Thanh tìm kiếm và popover gợi ý; khi sheet thu gọn popover mở lên phía trên, khi sheet mở chỉ hiện kết quả bên dưới ô nhập.
  - `#nearby-section`: Danh mục tìm quanh đây (quán ăn, cà phê, trạm xăng, siêu thị, nhà thuốc).
  - `#recent-places-section`: Danh sách địa điểm gần đây / đã lưu kèm nút "Xóa".
  - `.meta-bar`: Trạng thái và sai số GPS.
- Vùng bản đồ (`#map`).

**Trạng thái và hàm:** Không chứa trạng thái ứng dụng hay hàm xử lý; các `id` là điểm móc để `ui.js` và `app.js` kết nối sự kiện/cập nhật giao diện.

### `styles.css`

**Các khối chính:**
- Biến màu Sáng/Tối (`:root`, `body.light-mode`).
- Định dạng Bottom Sheet cao tự do từ 84px đến 50vh trên điện thoại hoặc 75vh từ 768px; header cố định và nội dung cuộn riêng.
- Công tắc GPS matte với trạng thái bật/tắt xanh/đỏ và hiệu ứng trượt núm.
- Danh mục tìm quanh đây (`.nearby-section`, `.nearby-chip`) và địa điểm gần đây (`.recent-places-section`) chuyển vào popover khi sheet thu gọn, trở lại nội dung sheet khi được kéo mở.
- Thẻ chi tiết địa điểm (`.place-detail-card`): nút hành động chính nhấn mờ (`.btn-action-primary`), nút phụ Lưu/Chia sẻ (`.btn-action-sub`), khối Details bo góc (`.place-details-box`).
- Danh sách địa điểm gần đây (`.recent-places-section`, `.recent-item`).
- Banner rẽ (`.turn-banner`) với các cấp cảnh báo (`.warning-early`, `.warning-imminent`, `.arrived`).
- HUD dẫn đường matte; `body.navigating` ẩn Bottom Sheet và HUD GPS/tốc độ cũ, đồng thời bố trí banner, tốc độ, thông tin chuyến đi và nút recenter.
- Media query responsive cho màn hình di động nhỏ (`max-width: 420px`, `max-width: 360px`).

### `ui.js`

**Các khối chính:**
- Từ điển VI/EN đầy đủ (thao tác rẽ, nhãn chi tiết địa điểm, huy hiệu lưu, thời gian ước tính, đơn vị khoảng cách).
- Tham chiếu DOM đầy đủ cho Place Detail Card và Recent Places.
- SVG icons (Puck, biểu tượng rẽ, icon lưu bookmark outline/filled, icon đồng hồ gần đây, icon chia sẻ).
- API mở/đóng/cập nhật thẻ chi tiết địa điểm:
  - `showPlaceDetail(placeData)`: Hiển thị tên, phụ đề, địa chỉ, tọa độ định dạng, cự ly và trạng thái đã lưu.
  - `updatePlaceDetailText({ name, subtitle, address })`: Cập nhật nội dung địa điểm sau khi đổi ngôn ngữ mà không làm mất ETA.
  - `updatePlaceDetailEta({ durationSec, distanceMeters })`: Cập nhật thời gian ước tính (ETA) và cự ly đường bộ lên nút Đi đường và khối Details.
  - `setPlaceSaved(isSaved)`: Cập nhật huy hiệu "Đã lưu" và icon nút Lưu.
  - `closePlaceDetail()`: Đóng thẻ chi tiết và khôi phục khu vực địa điểm gần đây.
  - `renderRecentPlaces(items, onSelect, onClear)`: Hiển thị danh sách địa điểm đã đi/đã lưu kèm icon phân biệt; mục đang dịch hoặc thiếu bản dịch không thể chọn.
  - `bindPlaceDetailEvents(handlers)`: Kết nối sự kiện nút Đóng, Đi đường, Lưu, Chia sẻ, Xóa lịch sử.
  - `formatCoordinates(coord)`: Định dạng tọa độ trực quan (ví dụ: `10.7769° N, 106.7009° E`).
- `setSheetHeight(height)` / `bindSheetDrag()`: Đặt chiều cao tự do; xử lý Pointer Events cho kéo header, kéo sheet xuống từ đầu danh sách và double-tap thu gọn.
- `setSheetSnap(state)`: Tương thích với các lệnh tự động mở/thu gọn cũ; thao tác kéo không còn snap.
- `openSearchSheet()`: Mở trạng thái tìm kiếm mà không đổi chiều cao sheet; khi thu gọn, popover chứa Nearby/Recents mở phía trên, còn khi kéo sheet lên thì Nearby/Recents ở trong sheet và chỉ kết quả tìm kiếm hiện bên dưới ô nhập.
- `renderSuggestions(items, onSelect)`: Hiển thị kết quả gợi ý; mục đang dịch hoặc thiếu tên dịch không thể chọn.
- `applyLanguage(language)`: Cập nhật giao diện VI/EN và lưu lựa chọn ngôn ngữ.
- `customizeMapLabels(map)`: Ưu tiên trường tên bản địa hóa theo ngôn ngữ hiện tại cho nhãn bản đồ.
- `setNavigationActive(active)`, `setNavigationMetrics(metrics)`: Hiển thị/ẩn HUD dẫn đường và cập nhật tốc độ, ETA, thời gian, quãng đường.
- `setCameraFollowing(following)`, `setRecenterActive(active)`: Đồng bộ trạng thái bám camera và nút quay lại vị trí.
- `setTurnBanner(data)`: Vẽ chỉ dẫn rẽ hiện tại, cảnh báo khoảng cách và bước kế tiếp.

### `app.js`

**Các khối chính:**
- Quản lý bộ nhớ `localStorage` cho góc nhìn (`gps_view_mode`), địa điểm gần đây (`gps_recent_places`) và địa điểm đã lưu/ghim (`gps_saved_places`).
- Tự động tính trước thời gian ước tính (ETA preview) qua OSRM khi chọn điểm đến hoặc đổi loại xe.
- Tra cứu/gợi ý luôn lấy dữ liệu nguồn tiếng Anh (`lang=en` / `accept-language=en`); ở chế độ VI ưu tiên trường `name:vi`, nếu thiếu thì dịch tên và địa chỉ qua MyMemory trước khi hiển thị.
- Cache bản dịch dùng `Map` kết hợp `localStorage` (`gps_translation_cache_v1`, tối đa 500 mục); mỗi yêu cầu dịch có timeout 1.8 giây. Gợi ý được debounce 350 ms, các kết quả đang dịch dùng nhãn VI tạm thời và không thể chọn cho đến khi tên dịch xong.
- Khi đổi VI/EN, tên/địa chỉ điểm đến và danh sách gần đây được hiển thị theo ngôn ngữ tương ứng; dữ liệu gốc tiếng Anh được giữ riêng để chuyển ngôn ngữ và dịch lại khi cần.
- Kết nối sự kiện chọn địa điểm (từ tìm kiếm, gợi ý Photon hoặc danh sách gần đây) -> mở Place Detail Sheet, cắm marker, bay tới địa điểm và lưu lịch sử.
- Nút "Đi đường" trên thẻ chi tiết tự động kích hoạt chế độ xe và bắt đầu hành trình (`runRouteToDestination`).
- `runRouteToDestination()`: Lấy tuyến OSRM có các bước rẽ, bật HUD/Wake Lock/ESP bridge và chuyển camera sang zoom 18.8, giữ pitch theo chế độ 2D/3D đã lưu.
- `updateNavigationProgress()`: Cập nhật chỉ dẫn, khoảng cách và bước rẽ; ngưỡng cảnh báo/chuyển bước được điều chỉnh theo xe máy hoặc ô tô.
- `endJourney()`: Kết thúc lộ trình, nhả Wake Lock, gửi trạng thái inactive tới ESP bridge, ẩn HUD và khôi phục camera theo chế độ 2D/3D đã chọn.
- `recalculateActiveRoute()`: Tính lại tuyến khi GPS chất lượng tốt cho thấy người dùng lệch tuyến trên 45m.
- `stopNavigationCameraFollowing()` / nút `#btn-recenter`: Cho phép xem bản đồ tự do rồi bật lại camera bám theo vị trí/hướng hiện tại.
- `acquireNavigationWakeLock()` / `releaseNavigationWakeLock()`: Giữ màn hình sáng trong lúc dẫn đường nếu trình duyệt hỗ trợ.
- Nút "Lưu" lưu/bỏ lưu địa điểm vào danh sách yêu thích.
- Nút "Chia sẻ" sao chép tọa độ chuẩn xác vào bộ nhớ tạm Clipboard.
- Dẫn đường thời gian thực OSRM `steps=true` và cảnh báo rẽ theo khoảng cách xe máy (~150m/~35m) và ô tô (~250m/~55m).

## 3. Luồng dữ liệu giữa các file

1. Người dùng gõ tìm kiếm, chọn danh mục quanh đây hoặc bấm một mục trong danh sách "Gần đây":
   - `app.js` nhận dữ liệu tọa độ, tên và địa chỉ, gọi `setDestination()`.
   - `app.js` lưu vào `localStorage`, đồng thời gọi OSRM preview để lấy thời gian di chuyển dự tính (ETA).
   - `ui.js` mở Thẻ chi tiết địa điểm (`showPlaceDetail`), hiển thị thông tin địa chỉ, tọa độ, cự ly và cập nhật nút "Đi đường • ETA".
2. Người dùng bấm nút "Lưu": `app.js` cập nhật danh sách `gps_saved_places`, `ui.js` bật huy hiệu "Đã lưu" và chuyển đổi icon bookmark.
3. Người dùng bấm nút "Chia sẻ": `app.js` sao chép tọa độ vào clipboard và thông báo trạng thái.
4. Người dùng bấm nút "Đi đường": `app.js` lấy tuyến OSRM chi tiết, bật trạng thái dẫn đường, Wake Lock và ESP bridge; `ui.js` ẩn Bottom Sheet, hiện HUD VI/EN, banner rẽ và nút kết thúc.
5. Trong khi di chuyển, GPS cập nhật tốc độ, chỉ dẫn, ETA và quãng đường còn lại; camera theo xe cho đến khi người dùng thao tác bản đồ. Nút `#btn-recenter` bật lại chế độ bám theo.
6. Khi kết thúc/đến đích, `app.js` nhả Wake Lock, gửi trạng thái inactive, xóa tuyến và khôi phục giao diện/camera bình thường.

## 4. Bảng tra cứu chỉnh sửa nhanh

| Muốn sửa/tối ưu | File nên mở |
|---|---|
| Giao diện thẻ chi tiết, HUD dẫn đường, màu sắc và kích thước Bottom Sheet | `styles.css` |
| Thêm/bớt thành phần HTML của Place Detail, HUD hoặc nút Recenter | `index.html` |
| Bản dịch VI/EN, HUD, banner rẽ, Puck và mở/đóng/cập nhật thẻ | `ui.js` |
| GPS, ETA, OSRM, hướng dẫn rẽ, reroute, camera follow, Wake Lock và ESP bridge | `app.js` |
