# HÀNG RONG — TỪ GÁNH HÀNG NHỎ ĐẾN ĐẾ CHẾ ẨM THỰC
> Game mô phỏng kinh doanh ẩm thực đường phố Việt Nam sống động, đậm đà bản sắc văn hóa dân tộc.

---

## 🌟 TỔNG QUAN DỰ ÁN

**HÀNG RONG** là dự án game mô phỏng quản lý và kinh doanh (Tycoon / Simulation) 2D/2.5D lấy bối cảnh đường phố Việt Nam thân quen. Người chơi nhập vai **Bé Hàng Rong**, bắt đầu sự nghiệp với đôi quang gánh tre mộc mạc tại vỉa hè đầu ngõ. Bằng cách nhập nguyên liệu tươi sạch, chế biến món ăn chuẩn vị, phục vụ chu đáo các tầng lớp thực khách và quản lý tài chính khôn ngoan, người chơi sẽ từng bước nâng cấp lên Xe đẩy gỗ bánh mì, Xe Inox có mái che, Food Truck hiện đại và chuỗi Kiosk ẩm thực cao cấp tại Landmark 81!

---

## 🛠️ CÔNG NGHỆ VÀ KIẾN TRÚC

- **Frontend & UI**: React 19 + TypeScript + Tailwind CSS v4.
- **Game Engine & Rendering 2D**: Phaser 3 (v4 core) — quản lý thế giới game, nhân vật Chibi, bàn ghế nhựa đỏ, bóng đổ, khói bếp, chu kỳ ngày/đêm và thời tiết mưa rào.
- **Quản lý trạng thái (State Management)**: Zustand (`useGameStore`).
- **Hệ thống âm thanh sống động**: Procedural Web Audio API Synthesizer (tự tổng hợp âm thanh xèo xèo chiên nướng, dao thớt chặt gỗ, chuông keng, tiếng tiền xu rơi, nhạc ngũ cung lofi Việt Nam, không phụ thuộc URL mp3 ngoài).
- **Lưu trữ dữ liệu**: IndexedDB kết hợp đồng bộ localStorage, hỗ trợ sao lưu / phục hồi file `.json`.
- **Unit Testing**: Vitest (12 unit tests hoàn chỉnh cho Kinh tế, Kho hàng, Đơn hàng, Nhiệm vụ và Lưu game).

---

## 📁 CẤU TRÚC THƯ MỤC

```
hr/
├── src/
│   ├── audio/
│   │   └── soundSystem.ts          # Bộ tổng hợp âm thanh Web Audio API không lỗi mạng
│   ├── components/
│   │   ├── GameCanvas.tsx          # Wrapper tích hợp Phaser 3 và React
│   │   ├── TopHUD.tsx              # Thanh thông tin tiền VNĐ, cấp độ, thời tiết, Điện Thoại
│   │   ├── OrderQueueHUD.tsx       # Băng chuyền đơn hàng đang chờ phục vụ
│   │   ├── CookingModal.tsx        # Bếp nấu tương tác minigame canh thời gian hoàn hảo
│   │   ├── SmartphoneModal.tsx     # Chiếc Điện Thoại Hàng Rong với 8 ứng dụng quản lý
│   │   ├── DayEndReportModal.tsx   # Báo cáo tài chính P&L chi tiết cuối ngày
│   │   ├── TutorialOverlay.tsx     # Hướng dẫn 10 bước cho người chơi mới
│   │   ├── MobileControls.tsx      # D-pad ảo & phím tắt cảm ứng cho di động
│   │   └── ToastContainer.tsx      # Thông báo nổi giao dịch, lên cấp, nhiệm vụ
│   ├── data/
│   │   ├── ingredients.ts          # 20+ loại nguyên liệu & nhà cung cấp chợ truyền thống
│   │   ├── recipes.ts              # 20 món ăn Việt (Đồ ăn sáng, Ăn vặt, Đồ uống & Chè)
│   │   ├── customers.ts            # 12 nhóm khách hàng (Học sinh, Dân văn phòng, VIP, Shipper...)
│   │   ├── locations.ts            # 8 địa điểm mở khóa (Vỉa hè, Trường học, Bến xe, Tạ Hiện...)
│   │   ├── cartUpgrades.ts         # 5 cấp xe hàng và thiết bị bếp
│   │   ├── staff.ts                # 4 vị trí nhân viên (Phụ bếp, Đầu bếp, Tạp vụ, Marketing)
│   │   └── quests.ts               # Hệ thống nhiệm vụ hàng ngày, chương & thành tựu
│   ├── saves/
│   │   └── saveSystem.ts           # Xử lý lưu game IndexedDB, xuất/nhập JSON
│   ├── scenes/
│   │   ├── BootScene.ts            # Tạo texture procedural pixel chibi (100% offline)
│   │   └── StreetScene.ts          # Thế giới phố Việt, xe cộ qua lại, khách xếp hàng
│   ├── stores/
│   │   └── gameStore.ts            # Logic mô phỏng thời gian, kinh tế, đơn hàng
│   ├── tests/
│   │   └── gameSystems.test.ts     # 12 Unit test kiểm thử hệ thống
│   ├── types/
│   │   └── game.ts                 # Toàn bộ định nghĩa kiểu dữ liệu TypeScript
│   ├── utils/
│   │   └── formatters.ts           # Định dạng tiền tệ VNĐ (ví dụ: 15.000đ), tính cấp độ
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎮 TÍNH NĂNG VÀ NỘI DUNG ĐÃ HOÀN THIỆN

### 1. 20 Món Ăn Đường Phố Việt Nam Đặc Trưng
- **Đồ ăn sáng**: Bánh mì thịt xá xíu, Xôi xéo mỡ hành, Bánh bao trứng cút, Phở bò tái lăn Hà Nội, Bún thịt nướng, Bánh cuốn nóng.
- **Đồ ăn vặt**: Bánh tráng trộn Sài Gòn, Xiên thịt nướng than hoa, Nem chua rán giòn rụm, Cá viên chiên mắm tỏi, Khoai tây lốc xoáy phô mai, Bắp nướng mỡ hành.
- **Đồ uống & Tráng miệng**: Trà đá vỉa hè, Nước mía siêu sạch ép tắc, Cà phê sữa đá Sài Gòn, Trà tắc hạt chia, Chè đậu đỏ hạt sen, Sữa đậu nành lá dứa, Dừa tươi Bến Tre, Chè thập cẩm cốt dừa.

### 2. 12 Nhóm Thực Khách Với Hành Vi Riêng Biệt
- Bé Học sinh, Sinh viên đại học, Anh nhân viên văn phòng, Bác công nhân, Cụ già tập dưỡng sinh, Cô hàng xóm, Khách Tây balo, Nhà phê bình ẩm thực, Chị khách ruột công sở, Gia đình có con nhỏ, Anh shipper công nghệ, Food Reviewer VIP triệu view.
- Có ngân sách, thời gian kiên nhẫn, tỷ lệ tiền tip và biểu cảm cảm xúc (trái tim, đồng hồ đếm ngược, tức giận khi chờ lâu) khác biệt.

### 3. Vòng Lặp Kinh Tế Chân Thực (P&L Financial Loop)
- **Công thức lợi nhuận**: `Lợi Nhuận = Doanh Thu Bán Hàng - Giá Vốn Nguyên Liệu - Tiền Thuê Mặt Bằng - Tiền Lương Nhân Viên`.
- Hiển thị tiền theo chuẩn tiếng Việt: `15.000đ`, `125.000đ`, `1.250.000đ`.
- Báo cáo tài chính cuối ngày tổng kết đầy đủ doanh thu, giá vốn, số khách phục vụ, số sao đánh giá và món bán chạy nhất.

### 4. 8 Khu Vực & Địa Điểm Phố Phường Việt Nam
1. Vỉa hè khởi nghiệp (0đ thuê mặt bằng).
2. Cổng trường cấp 3 Chu Văn An.
3. Chợ Lớn truyền thống.
4. Khu cao ốc văn phòng Cầu Giấy.
5. Công viên Hoàng Văn Thụ.
6. Bến xe Miền Đông.
7. Phố ẩm thực đêm Tạ Hiện.
8. Kiosk ẩm thực Landmark 81.

### 5. Chu Kỳ Ngày/Đêm & Thời Tiết Thực Tế
- Khung giờ: Sáng sớm -> Buổi sáng -> Buổi trưa -> Buổi chiều -> Buổi tối.
- Thời tiết: Nắng đẹp, Oi bức nắng gắt (tăng nhu cầu nước mía/chè), Trời mát, Mưa rào phố phường (hiệu ứng hạt mưa rơi và tăng nhu cầu đồ nóng).

### 6. Điều Khiển Linh Hoạt Cả PC Lẫn Mobile
- **Máy tính**: Phím `W, A, S, D` hoặc phím mũi tên để di chuyển nhân vật, phím `E` hoặc `Space` để tương tác, chuột click để điều khiển bếp và xe hàng.
- **Điện thoại**: Joystick ảo D-pad điều hướng bên trái, các nút thao tác nhanh (Bếp nấu, Chợ nguyên liệu) bên phải, hỗ trợ cảm ứng toàn màn hình.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY GAME

### Yêu cầu hệ thống:
- Node.js version 18 trở lên (khuyên dùng Node 20 hoặc 24).
- npm version 9 trở lên.

### Lệnh chạy:
```bash
# 1. Cài đặt các thư viện (nếu chưa cài)
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Chạy toàn bộ Unit Tests
npm test

# 4. Build sản phẩm hoàn chỉnh
npm run build
```

Mở trình duyệt truy cập: `http://localhost:5173` để trải nghiệm game!
