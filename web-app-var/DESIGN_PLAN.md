# 🎨 Website Redesign Plan — VAR

> **Stack:** React 19 + Vite 7 · **Design:** Blue-Teal + Amber · **Port:** `localhost:5173`

> 💡 **Mở Markdown Preview:** `Ctrl+Shift+V` → xem đầy đủ sơ đồ màu sắc

---

## 1️⃣ Cấu trúc toàn bộ website

```mermaid
mindmap
  root((🌐 VAR Website))
    🏠 Trang Chủ
      Hero Section
      Social Proof Bar
      Dịch vụ Bento Grid
      Số liệu Counter
      Tin tức Magazine
      CTA Banner
      Contact Form
    👥 Giới Thiệu
      Hero + Stats
      Story Zigzag
      Core Values
      Timeline
      Đội ngũ
    ⚙️ Dịch Vụ
      Hero + Tab Filter
      Service Grid 3 cột
      Quy trình Stepper
      FAQ Accordion
    📰 Tin Tức
      Hero + Search Bar
      Category Filter Chips
      Featured Post lớn
      Post Grid 3 cột
      Pagination
    📞 Liên Hệ
      Thông tin + Maps
      Form gửi tin nhắn
    🤖 AI Chatbot
      Auth Gate Login
      Loading Splash
      Chatbot Iframe
    🔒 Admin
      Dashboard
      Quản lý bài viết
      Quản lý dịch vụ
```

---

## 2️⃣ Navigation Flow — Luồng điều hướng

```mermaid
flowchart TD
    USER([👤 Người dùng]) --> NAV[🔗 Navbar]

    NAV --> HOME[🏠 Trang Chủ\n/]
    NAV --> ABOUT[👥 Giới Thiệu\n/about]
    NAV --> SERVICE[⚙️ Dịch Vụ\n/service]
    NAV --> NEWS[📰 Tin Tức\n/news]
    NAV --> CONTACT[📞 Liên Hệ\n/contact]
    NAV --> CHATBOT[🤖 AI Chatbot\n/ai-chatbot]

    HOME -->|scroll down| H1[Hero Section]
    HOME -->|scroll down| H2[Dịch vụ nổi bật]
    HOME -->|scroll down| H3[Tin tức mới nhất]
    HOME -->|scroll down| H4[Contact Form]

    NEWS --> NEWS_DETAIL[📄 Chi tiết bài viết\n/news/:id]

    CHATBOT --> AUTH{Đã đăng nhập?}
    AUTH -->|Chưa| LOGIN_GATE[🔐 Auth Gate]
    AUTH -->|Rồi| SPLASH[⏳ Loading Splash]
    LOGIN_GATE -->|Đăng nhập OK| SPLASH
    SPLASH --> IFRAME[💬 Chatbot Interface]

    style HOME fill:#2563eb,color:#fff
    style ABOUT fill:#2563eb,color:#fff
    style SERVICE fill:#2563eb,color:#fff
    style NEWS fill:#2563eb,color:#fff
    style CONTACT fill:#2563eb,color:#fff
    style CHATBOT fill:#06b6d4,color:#fff
    style AUTH fill:#f59e0b,color:#fff
    style LOGIN_GATE fill:#ef4444,color:#fff
    style SPLASH fill:#8b5cf6,color:#fff
    style IFRAME fill:#10b981,color:#fff
```

---

## 3️⃣ Auth Flow — Luồng xác thực AI Chatbot

```mermaid
sequenceDiagram
    actor User as 👤 Người dùng
    participant FE as 🖥️ React FE
    participant LS as 💾 localStorage
    participant API as 🔌 API :3001
    participant CB as 🤖 Chatbot :3000

    User->>FE: Truy cập /ai-chatbot
    FE->>LS: Kiểm tra user / accessToken
    
    alt Chưa đăng nhập
        LS-->>FE: null
        FE->>User: Hiển thị Auth Gate
        User->>FE: Nhập username + password
        FE->>API: POST /api/users/login
        API-->>FE: { accessToken, refreshToken, user }
        FE->>LS: Lưu token + user info
        Note over FE,LS: Website navbar tự detect login!
    else Đã đăng nhập
        LS-->>FE: { user, accessToken }
    end

    FE->>User: Hiển thị Loading Splash (2s)
    FE->>CB: Load Chatbot Iframe
    CB-->>User: Giao diện AI Chatbot
```

---

---

## 4️⃣ Trang Chủ — Home Page Layout

### Trước vs Sau

| Hiện tại | Đề xuất |
|----------|---------|
| Service: 3 cột đều | Service: **Bento Grid** (ô to + ô nhỏ xen kẽ) |
| News: 3 cột đều | News: **Magazine** (1 featured lớn + 4 nhỏ) |
| Không có CTA | **CTA Banner** full-width gradient |
| Không có số liệu đếm | **Counter** count-up animation khi scroll |

### Wireframe Layout (từ trên xuống dưới)

```mermaid
block-beta
  columns 1

  block:NAVBAR["🔗 NAVBAR — Logo · Menu · Login"]:1
  end

  block:HERO["🦸 HERO SECTION — 100vh"]:1
    block:LEFT["📝 Nội dung trái (50%)"]
      A["🏷️ Badge: Chuyên gia #1"]
      B["H1: Chuyên gia tư vấn\n& hỗ trợ đấu thầu"]
      C["Mô tả ngắn gọn về dịch vụ..."]
      D["[ 🔥 Khám phá ]  [ 📞 Liên hệ ]"]
      E["320+ Gói · 1000+ KH · 85% Tỷ lệ"]
    end
    block:RIGHT["🖼️ Hình ảnh phải (50%)"]
      F["Hero Image\n+ Glow effect"]
      G["✦ floating: 320+ gói thầu\n✦ floating: 85% trúng thầu"]
    end
  end

  block:BAR["📢 SOCIAL PROOF BAR — Marquee cuộn vô tận"]:1
  end

  block:SVC["⚙️ DỊCH VỤ — Bento Grid"]:1
    block:SVC1["Dịch vụ 1\n(nhỏ)"]
    end
    block:SVC2["Dịch vụ 2 — WIDE\n(rộng gấp đôi)"]
    end
    block:SVC3["Dịch vụ 3\n(nhỏ)"]
    end
    block:SVC4["Dịch vụ 4 — WIDE\n(rộng gấp đôi)"]
    end
    block:SVC5["Dịch vụ 5\n(nhỏ)"]
    end
    block:SVC6["Dịch vụ 6\n(nhỏ)"]
    end
  end

  block:STATS["📊 SỐ LIỆU — 4 counter cards ngang"]:1
    block:S1["320+\nGói thầu"]
    end
    block:S2["1000+\nKhách hàng"]
    end
    block:S3["12+\nNăm kinh nghiệm"]
    end
    block:S4["85%\nTỷ lệ trúng thầu"]
    end
  end

  block:NEWS["📰 TIN TỨC — Magazine Layout"]:1
    block:NF["⭐ Bài viết nổi bật\n(chiếm 50% chiều ngang)\n[ảnh lớn + tiêu đề to]"]
    end
    block:NG["📋 Grid 4 bài nhỏ\n(2x2 bên phải)"]
    end
  end

  block:CTA["✨ CTA BANNER — Full width gradient blue→teal"]:1
  end

  block:CONTACT["📞 CONTACT FORM"]:1
  end

  block:FOOTER["🔗 FOOTER"]:1
  end
```

### Bento Grid chi tiết

```mermaid
block-beta
  columns 3

  block:A["📋 Tư vấn đấu thầu\nicon · tiêu đề · mô tả ngắn\n[→ Xem thêm]"]:1
  end
  block:B["📄 Lập hồ sơ dự thầu — WIDE\nicon · tiêu đề · mô tả DÀI hơn · danh sách tính năng\n[→ Xem thêm]"]:2
  end

  block:C["⚖️ Tư vấn pháp lý — WIDE\nicon · tiêu đề · mô tả DÀI hơn\n[→ Xem thêm]"]:2
  end
  block:D["🎓 Đào tạo\nicon · tiêu đề · mô tả ngắn\n[→ Xem thêm]"]:1
  end
```

### Magazine News chi tiết

```mermaid
block-beta
  columns 3

  block:FEAT["⭐ BÀI NỔI BẬT\n\n[   Ảnh lớn   ]\n\n🏷️ tag  📅 ngày\nTiêu đề lớn nổi bật\nMô tả bài viết dài...\n\n[ Đọc thêm → ]"]:1
  end

  block:SMALL["📋 4 bài viết nhỏ (2×2)"]:2
    block:N2["[img]\n🏷️ tag\nTiêu đề 2\n📅 date"]
    end
    block:N3["[img]\n🏷️ tag\nTiêu đề 3\n📅 date"]
    end
    block:N4["[img]\n🏷️ tag\nTiêu đề 4\n📅 date"]
    end
    block:N5["[img]\n🏷️ tag\nTiêu đề 5\n📅 date"]
    end
  end
```

---

---

## 5️⃣ Trang Dịch Vụ — Service Page

```mermaid
block-beta
  columns 1

  block:H["🎯 HERO — nền tối gradient\n'Dịch vụ của chúng tôi'\nGiải pháp đấu thầu chuyên nghiệp toàn diện"]:1
  end

  block:TABS["🗂️ TAB FILTER\n[ Tất cả ]  [ Tư vấn ]  [ Hồ sơ ]  [ Pháp lý ]  [ Đào tạo ]"]:1
  end

  block:GRID["📦 SERVICE GRID — 3 cột (stagger fadeInUp khi scroll)"]:1
    block:G1["🔷 Tư vấn đấu thầu\nNội dung chi tiết...\n• Tính năng 1\n• Tính năng 2\n[Tìm hiểu thêm]"]
    end
    block:G2["📄 Lập hồ sơ dự thầu\nNội dung chi tiết...\n• Tính năng 1\n• Tính năng 2\n[Tìm hiểu thêm]"]
    end
    block:G3["⚖️ Tư vấn pháp lý\nNội dung chi tiết...\n• Tính năng 1\n• Tính năng 2\n[Tìm hiểu thêm]"]
    end
  end

  block:STEP["🔄 QUY TRÌNH — Horizontal Stepper (hover: nổi lên)"]:1
    block:P1["① 📄\nTiếp nhận\nyêu cầu"]
    end
    block:P2["② 📊\nĐánh giá\nhồ sơ"]
    end
    block:P3["③ ⚙️\nThực hiện\ndịch vụ"]
    end
    block:P4["④ 🤝\nBàn giao\nkết quả"]
    end
  end

  block:FAQ["❓ FAQ ACCORDION\n▼ Quy trình đấu thầu mất bao lâu?\n▼ Chi phí tư vấn như thế nào?\n▼ Có hỗ trợ sau khi trúng thầu không?"]:1
  end
```

---

---

## 6️⃣ Trang Tin Tức — News Page

```mermaid
block-beta
  columns 1

  block:H["📰 HERO + SEARCH BAR\n'Tin Tức & Kiến Thức'\n[ 🔍 Tìm kiếm bài viết... ]"]:1
  end

  block:CAT["🏷️ CATEGORY FILTER CHIPS\n[ Tất cả ]  [ Luật đấu thầu ]  [ Kinh nghiệm ]  [ Hướng dẫn ]  [ Thông báo ]"]:1
  end

  block:FEATURED["⭐ BÀI VIẾT NỔI BẬT — Full width card"]:1
    block:FI["🖼️ Ảnh lớn\n(60% chiều rộng)"]
    end
    block:FC["🏷️ Tag: Luật đấu thầu\n📅 12/04/2026\n\nH2: Tiêu đề bài viết nổi bật\ncỡ chữ to, thu hút\n\nMô tả chi tiết hơn các card thường,\n2-3 dòng giới thiệu nội dung...\n\n[ Đọc ngay → ]"]
    end
  end

  block:GRID["📋 POST GRID — 3 cột (stagger animation khi scroll)"]:1
    block:P1["[🖼️ ảnh]\n🏷️ Tag\nTiêu đề bài 1\nMô tả...\n📅 Ngày đăng\n[Xem thêm]"]
    end
    block:P2["[🖼️ ảnh]\n🏷️ Tag\nTiêu đề bài 2\nMô tả...\n📅 Ngày đăng\n[Xem thêm]"]
    end
    block:P3["[🖼️ ảnh]\n🏷️ Tag\nTiêu đề bài 3\nMô tả...\n📅 Ngày đăng\n[Xem thêm]"]
    end
  end

  block:PAGE["📄 PAGINATION\n◀  1  [ 2 ]  3  4  ▶"]:1
  end
```

---

---

## 7️⃣ Trang Giới Thiệu — About Page

```mermaid
block-beta
  columns 1

  block:HERO["👥 HERO — Về Chúng Tôi\n'Đồng hành cùng doanh nghiệp trên con đường đấu thầu'\n[ 320+ Gói ] [ 1000+ KH ] [ 12 Năm ] [ 85% Tỷ lệ ]"]:1
  end

  block:ZIG1["📖 Câu chuyện thành lập — Zigzag row 1"]:1
    block:IMG1["🖼️ Hình ảnh\ncông ty / đội ngũ"]
    end
    block:TXT1["📖 Câu chuyện thành lập\n\nThành lập năm 2012 với sứ mệnh\nđồng hành cùng doanh nghiệp...\n\nPhát triển từ 3 người sáng lập\nthành đội ngũ 50+ chuyên gia."]
    end
  end

  block:ZIG2["🎯 Tầm nhìn & Sứ mệnh — Zigzag row 2 (đổi chiều)"]:1
    block:TXT2["🎯 Tầm nhìn & Sứ mệnh\n\nTrở thành đối tác tư vấn đấu thầu\nsố 1 tại Việt Nam vào năm 2030.\n\nCam kết mang lại kết quả\ntốt nhất cho mọi khách hàng."]
    end
    block:IMG2["🖼️ Hình ảnh\nvăn phòng / giải thưởng"]
    end
  end

  block:VALUES["🏅 GIÁ TRỊ CỐT LÕI — 3 cột"]:1
    block:V1["🏆 Uy tín\nCam kết minh bạch,\ntrung thực trong\nmọi dịch vụ."]
    end
    block:V2["🔬 Chuyên môn\nĐội ngũ có 12+ năm\nkinh nghiệm trong\nlĩnh vực đấu thầu."]
    end
    block:V3["🤝 Tận tâm\nLuôn đặt lợi ích\ncủa khách hàng\nlên hàng đầu."]
    end
  end

  block:TL["📅 TIMELINE — Lịch sử phát triển\n\n2012 ──●── 2015 ──●── 2018 ──●── 2022 ──●── 2026\nThành lập  100 KH   500 KH  Top 10 VN  1000+ KH"]:1
  end

  block:TEAM["👥 ĐỘI NGŨ CHUYÊN GIA — 4 thành viên"]:1
    block:T1["👤 Avatar\nNguyễn Văn A\nGiám đốc"]
    end
    block:T2["👤 Avatar\nTrần Thị B\nTrưởng phòng"]
    end
    block:T3["👤 Avatar\nLê Văn C\nChuyên gia cao cấp"]
    end
    block:T4["👤 Avatar\nPhạm Thị D\nTư vấn viên"]
    end
  end
```

### Timeline chi tiết

```mermaid
timeline
    title Lịch sử phát triển VAR
    2012 : Thành lập công ty
         : 3 người sáng lập
         : Văn phòng đầu tiên tại HN
    2015 : Đạt 100 khách hàng
         : Mở rộng đội ngũ lên 15 người
         : Chi nhánh TP.HCM
    2018 : Đạt 500 khách hàng
         : Ra mắt dịch vụ đào tạo
         : Hệ thống phần mềm nội bộ
    2022 : Top 10 công ty tư vấn đấu thầu VN
         : Đội ngũ 50+ chuyên gia
         : Hợp tác doanh nghiệp quốc tế
    2026 : 1000+ khách hàng tin tưởng
         : Ra mắt AI Chatbot hỗ trợ
         : Mở rộng toàn quốc
```

---

---

## 8️⃣ Trang Liên Hệ — Contact Page

```mermaid
block-beta
  columns 1

  block:HERO["📞 HERO — Liên Hệ Với Chúng Tôi"]:1
  end

  block:CONTENT["📋 NỘI DUNG CHÍNH — 2 cột"]:1
    block:INFO["📍 THÔNG TIN LIÊN HỆ\n\n📍 Địa chỉ: 123 Đường ABC,\n   Quận Hoàn Kiếm, Hà Nội\n\n📞 Điện thoại: 0123 456 789\n\n✉️ Email: info@var.vn\n\n🕐 Giờ làm việc:\n   T2–T6: 8:00–17:30\n   T7: 8:00–12:00\n\n[ 🗺️ Google Maps Embed ]"]
    end
    block:FORM["📝 FORM GỬI TIN NHẮN\n\n[ 👤 Họ và tên          ]\n[ ✉️ Email              ]\n[ 📞 Số điện thoại      ]\n[ 📋 Tiêu đề            ]\n[                       ]\n[  Nội dung tin nhắn    ]\n[  (textarea)           ]\n[                       ]\n\n[ 📨 Gửi tin nhắn →    ]"]
    end
  end
```

---

## 9️⃣ AI Chatbot — Auth Gate Flow

```mermaid
flowchart TD
    A([Truy cập /ai-chatbot]) --> B{Có token\ntrong localStorage?}

    B -->|Không| C[🔐 Hiện Auth Gate\nBackground particles animation]
    C --> D{Đăng ký\nhay đăng nhập?}
    
    D -->|Đăng nhập| E["[👤 Username]\n[🔒 Password]\n[▶ Đăng nhập]"]
    D -->|Đăng ký| F["[👤 Họ tên]\n[📧 Email]\n[👤 Username]\n[🔒 Password]\n[▶ Đăng ký]"]
    
    E --> G[POST /api/users/login]
    F --> H[POST /api/users/register\n→ auto login]
    H --> G
    
    G -->|Thành công| I[Lưu vào localStorage:\naccessToken · refreshToken · user]
    G -->|Thất bại| J[⚠️ Hiện thông báo lỗi]
    J --> D
    
    I --> K
    B -->|Có| K[⏳ Loading Splash\n2 giây animation]
    K --> L[💬 Chatbot Iframe\nlocalhost:3000]

    style C fill:#1e3a5f,color:#fff
    style L fill:#10b981,color:#fff
    style J fill:#ef4444,color:#fff
    style I fill:#2563eb,color:#fff
```

---

---

## 🎨 Design System

### Bảng màu

```mermaid
quadrantChart
    title Màu sắc theo mức độ sử dụng
    x-axis Ít dùng --> Dùng nhiều
    y-axis Phụ --> Chính
    quadrant-1 Chính + Nhiều
    quadrant-2 Chính + Ít
    quadrant-3 Phụ + Ít
    quadrant-4 Phụ + Nhiều
    Primary Blue #2563eb: [0.9, 0.9]
    Teal #06b6d4: [0.7, 0.8]
    Amber #f59e0b: [0.5, 0.6]
    Dark #0b1426: [0.6, 0.7]
    White/Surface: [0.8, 0.5]
    Border #e0e7f1: [0.4, 0.3]
```

### Bảng màu tham khảo trực quan

| Màu | Preview | Hex | Dùng cho |
|-----|---------|-----|----------|
| **Primary** | 🟦 | `#2563eb` | Buttons chính, links, icons |
| **Teal** | 🩵 | `#06b6d4` | Gradient accent, highlights |
| **Amber** | 🟧 | `#f59e0b` | CTA buttons, badges nổi bật |
| **Dark Navy** | 🟫 | `#0b1426` | Hero backgrounds |
| **Surface** | ⬜ | `#ffffff` | Card backgrounds |
| **Border** | 🔲 | `#e0e7f1` | Viền card, dividers |
| **Error** | 🟥 | `#ef4444` | Thông báo lỗi |
| **Success** | 🟩 | `#10b981` | Thông báo thành công |

### Gradient chính

```css
--grad-primary: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
--grad-warm:    linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
--grad-hero:    linear-gradient(135deg, #0b1426, #1e3a5f, #0d2847);
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 Hero | Montserrat | `clamp(34px, 4.8vw, 60px)` | 800 |
| H2 Section | Montserrat | `clamp(28px, 4.2vw, 46px)` | 800 |
| Body | Inter | `15–17px` | 400 |
| Caption | Inter | `12–13px` | 500–700 |

### Spacing & Radius

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `--radius-lg` | `24px` | Card corners |
| `--radius-full` | `9999px` | Buttons, badges |
| Section padding | `100px 40px` | Tất cả sections |
| Grid gap | `28px` | Giữa các card |
| Navbar height | `100px` | Sticky navbar |

---

## ✨ Animation Plan

```mermaid
flowchart LR
    subgraph TRIGGER["🖱️ Triggers"]
        T1[📜 Scroll vào vùng nhìn]
        T2[🖱️ Hover chuột]
        T3[📄 Page load]
        T4[🔄 Liên tục - Continuous]
    end

    subgraph EFFECT["✨ Effects"]
        E1[fadeInUp stagger]
        E2[count-up số liệu]
        E3[heroSlide Left/Right]
        E4[particle Float]
        E5[gradientShift text]
        E6[shimmer sweep]
        E7[topBar scaleX]
        E8[icon rotate]
        E9[image scale]
    end

    T1 --> E1
    T1 --> E2
    T2 --> E6
    T2 --> E7
    T2 --> E8
    T2 --> E9
    T3 --> E3
    T4 --> E4
    T4 --> E5

    style T1 fill:#2563eb,color:#fff
    style T2 fill:#06b6d4,color:#fff
    style T3 fill:#f59e0b,color:#fff
    style T4 fill:#8b5cf6,color:#fff
```

---

## 📅 Implementation Phases

```mermaid
gantt
    title Kế hoạch thực hiện redesign
    dateFormat  YYYY-MM-DD
    section Phase 1 ✅ DONE
    Scroll-reveal system          :done, p1a, 2026-03-01, 3d
    Hero particles + glow         :done, p1b, 2026-03-04, 2d
    Stagger card animations       :done, p1c, 2026-03-06, 3d
    Shimmer hover effects         :done, p1d, 2026-03-09, 2d
    AI Chatbot auth gate          :done, p1e, 2026-03-11, 4d
    Contact form UX fixes         :done, p1f, 2026-03-15, 2d

    section Phase 2 🔧 TIẾP THEO
    Social proof marquee bar      :active, p2a, 2026-04-09, 3d
    Home Bento grid services      :p2b, after p2a, 4d
    Home Magazine news layout     :p2c, after p2b, 3d
    Home CTA Banner section       :p2d, after p2c, 2d
    Home count-up animation       :p2e, after p2d, 2d
    News search bar + filters     :p2f, after p2e, 4d
    News featured post            :p2g, after p2f, 3d

    section Phase 3 🎯 TƯƠNG LAI
    Service tab filter            :p3a, after p2g, 3d
    About zigzag layout           :p3b, after p3a, 4d
    About company timeline        :p3c, after p3b, 3d
    Contact Google Maps embed     :p3d, after p3c, 2d
    Mobile bottom navigation      :p3e, after p3d, 4d
    Page transition animations    :p3f, after p3e, 3d
    Dark mode toggle              :p3g, after p3f, 5d
```

### Checklist chi tiết

#### ✅ Phase 1 — Đã hoàn thành
- [x] Scroll-reveal `[data-reveal]` toàn trang
- [x] Hero particles + image glow effect
- [x] Stagger animation cho tất cả card grids
- [x] Shimmer sweep on hover
- [x] News card tag badge
- [x] AI Chatbot auth gate (login required)
- [x] Contact form autofill fix
- [x] Contact form border & focus outline fix

#### 🔧 Phase 2 — Tiếp theo (High Impact)
- [ ] **Home:** Social proof marquee bar
- [ ] **Home:** Bento grid cho service cards
- [ ] **Home:** Magazine layout cho news
- [ ] **Home:** Full-width CTA banner
- [ ] **Home:** Count-up animation cho số liệu
- [ ] **News:** Search bar trong hero
- [ ] **News:** Category filter chips
- [ ] **News:** Featured post full-width

#### 🎯 Phase 3 — Tương lai (Polish)
- [ ] **Service:** Tab filter theo danh mục
- [ ] **About:** Zigzag story layout
- [ ] **About:** Company timeline
- [ ] **Contact:** Google Maps embed
- [ ] **Global:** Mobile bottom navigation
- [ ] **Global:** Page transition animations
- [ ] **Global:** Dark mode toggle

---

## 📱 Responsive Design

```mermaid
flowchart LR
    DEV["🖥️ Desktop\n≥ 1200px\nFull 3 cột\nFull spacing"] -->|thu nhỏ| TAB["📱 Tablet\n768–1199px\n2 cột\nSpacing giảm"]
    TAB -->|thu nhỏ| MOB["📱 Mobile\n480–767px\n1 cột\nStack vertical"]
    MOB -->|thu nhỏ| SM["⌚ Small\n< 480px\nFont nhỏ\nPadding tối thiểu"]

    style DEV fill:#2563eb,color:#fff
    style TAB fill:#06b6d4,color:#fff
    style MOB fill:#f59e0b,color:#000
    style SM fill:#8b5cf6,color:#fff
```

---

*Tài liệu thiết kế dự án VAR Website · Cập nhật: Tháng 4/2026*
