# Kế Hoạch Nâng Cấp Toàn Diện: Mô Hình 3D Mèo Vàng

Nâng cấp mô hình Mèo Vàng từ phiên bản hiện tại sử dụng **primitive geometry đơn giản** (sphere, cone, box, cylinder) lên phiên bản **chất lượng điện ảnh / game cao cấp** — tập trung vào chiều sâu thị giác, vật lý tự nhiên, hiệu ứng huyền thuật Tarot, vẫn giữ phong cách **Studio Ghibli toon shading** đặc trưng.

---

# PHẦN A — NÂNG CẤP CƠ BẢN (Geometry & Chi Tiết Bộ Phận)

## Đánh Giá Phiên Bản Hiện Tại

### Các bộ phận đã có:
| Bộ phận | Geometry | Ghi chú |
|---------|----------|---------|
| Thân chính | `sphereGeometry` r=0.55 | Hình cầu đơn giản |
| Bụng | `sphereGeometry` r=0.42 | Lớp phủ phía trước |
| Đầu | `sphereGeometry` r=0.46 | Tròn trịa |
| Mắt (2) | `sphereGeometry` nhãn cầu + pupil + 2 highlight | Có pupil tracking |
| Mí mắt nhắm (2) | `boxGeometry` | Hiện khi ngủ |
| Mũi | `sphereGeometry` r=0.025 | Rất nhỏ |
| Miệng | 2× `boxGeometry` W-shape | Đường nét đơn giản |
| Tai (2) | `coneGeometry` + lòng tai trong | 4 cạnh (vuông) |
| Râu (6) | `boxGeometry` mỏng | Thanh thẳng cứng |
| 4 chân | `sphereGeometry` 4 bàn chân tròn | Chỉ có bàn chân, không có cẳng |
| Đuôi (4 khớp) | sphere + 2 cylinder + sphere tip | Uốn lượn mượt |
| Vòng cổ | `torusGeometry` | Hình xuyến |
| Chuông | `sphereGeometry` r=0.07 | Hình cầu nhỏ |

### Điểm yếu cần khắc phục:
- **Chân**: Chỉ có bàn chân tròn, không có phần cẳng chân → trông như "bóng nổi" dưới thân
- **Tai**: `coneGeometry` 4 cạnh → hình kim tự tháp, không tự nhiên
- **Miệng**: Quá đơn giản, chỉ 2 nét thẳng → thiếu biểu cảm
- **Râu**: Thanh thẳng cứng → thiếu uốn cong tự nhiên
- **Thân**: Sphere đơn thuần → thiếu form dáng mèo thực tế (vai, hông, eo)
- **Thiếu chi tiết**: Không có lông mày, không có hoa văn/sọc vằn, không có đệm chân (paw pads)
- **Material phẳng**: Toon gradient chỉ 3 bậc, không có rim light, không có SSS
- **Animation cứng**: Đuôi dùng keyframe sin/cos, không có vật lý thực; thiếu squash & stretch
- **Không có VFX huyền thuật**: Chuông/mắt không phát sáng, không có runes Tarot

---

## Proposed Changes — Phần A

### A1. Nâng cấp hình học cơ thể (Body Geometry)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

**Thân mèo (Body)** — Từ 1 sphere → **composite body** gồm nhiều sphere hợp nhất:
- **Ngực trên** (upper torso): `sphereGeometry` r=0.48, vị trí cao hơn → tạo dáng vai rộng
- **Bụng dưới** (lower body): `sphereGeometry` r=0.5, vị trí thấp hơn → tạo dáng mông tròn
- **Lông ngực fluffy** (chest fluff): Thêm 3–4 sphere nhỏ chồng lên nhau tại vùng ngực phía trước tạo hiệu ứng lông bông xù

**Đầu mèo (Head)** — Bổ sung thêm:
- **Gò má** (cheeks): 2× `sphereGeometry` nhỏ hai bên để tạo má phúng phính đặc trưng mèo Ghibli
- **Cằm** (chin): 1× sphere nhỏ phía dưới mũi

---

### A2. Chi tiết khuôn mặt (Facial Details)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

**Tai** — Từ `coneGeometry(4 cạnh)` → **coneGeometry(12+ cạnh)** hoặc **latheGeometry** tùy chỉnh:
- Tăng `radialSegments` từ 4 → 12 để tai tròn mượt thay vì vuông góc
- Thêm **phần gốc tai** dày hơn ở đáy bằng sphere nhỏ để chuyển tiếp tự nhiên với đầu

**Miệng** — Từ 2 box thẳng → **Đường cong W** mượt hơn:
- Dùng `TubeGeometry` theo `CatmullRomCurve3` để vẽ đường miệng cong mềm mại kiểu `:3` hoặc `ω`
- Thêm trạng thái **miệng mở** (cho surprised / happy): 1 `sphereGeometry` nhỏ dẹt màu hồng sẫm bên dưới mũi

**Râu** — Từ box thẳng → **TubeGeometry uốn cong**:
- Mỗi râu sử dụng `TubeGeometry` theo `QuadraticBezierCurve3` để tạo đường cong nhẹ tự nhiên
- Thêm **micro-animation** râu rung nhẹ theo nhịp thở

**Lông mày** (Mới):
- 2× `TubeGeometry` cong nhẹ phía trên mỗi mắt
- Có thể thay đổi góc nghiêng theo trạng thái (vui: cong lên / ngạc nhiên: nhướng cao / buồn ngủ: xụ xuống)

---

### A3. Hệ thống sọc vằn trên lông (Fur Stripes Pattern)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

Thêm **sọc vằn tabby** đặc trưng kiểu mèo vàng:
- 3–5 dải sọc mỏng trên lưng/trán sử dụng mesh dẹt (`planeGeometry`) với `meshBasicMaterial` màu cam đậm `#c47832`, đặt sát bề mặt body
- 1 sọc trán hình chữ **M** đặc trưng (classic tabby marking) dùng `TubeGeometry`
- Điều chỉnh opacity/màu sắc nhẹ nhàng để không quá rối

---

### A4. Nâng cấp chân (Legs & Paw Pads)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

**Cẳng chân** (Mới) — Thêm phần chân nối thân với bàn chân:
- **Chân trước**: Mỗi chân gồm `capsuleGeometry` (hoặc cylinder + 2 sphere) nối từ vai xuống bàn chân
- **Chân sau**: Tương tự nhưng to hơn, hơi gập góc (đầu gối) để tạo tư thế ngồi tự nhiên
- Thêm **animation mượt** cho chuyển động chân (walking / shuffle / surprised)

**Đệm chân** (Paw Pads — Mới):
- Mỗi bàn chân thêm 1 `circleGeometry` mặt dưới màu hồng đào (paw pad chính)
- 3–4 `circleGeometry` nhỏ xíu xếp cạnh nhau (paw pad ngón)
- Chỉ hiện khi trạng thái nhấc chân lên (surprised / shuffle)

---

### A5. Phụ kiện huyền thuật (Mystic Accessories)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

**Nâng cấp chuông lục lạc**:
- Thêm **khe sáng** bên trong chuông (nhỏ `pointLight` phát sáng nhẹ màu vàng)
- Tạo **rung nhẹ** bằng micro-animation khi di chuyển

**Mũ phù thủy mini** (Tuỳ chọn — có thể toggle):
- `coneGeometry` vải nhọn có bẻ gập đầu
- Đặt nghiêng đáng yêu trên đầu giữa hai tai
- Màu tím `mysticPurple` với ngôi sao nhỏ

---

### A6. Cải thiện Material & Ánh sáng (Cơ bản)

#### [MODIFY] [materials.ts](file:///d:/YellowCatTarot/components/three/materials.ts)

- Thêm màu sắc mới vào `CAT_COLORS`:
  - `stripe: '#c47832'` — Sọc vằn cam đậm
  - `pawPad: '#e8a4a4'` — Đệm chân hồng nhạt
  - `mouthInner: '#c44040'` — Miệng bên trong đỏ sẫm
  - `eyebrow: '#8a5a2e'` — Lông mày nâu nhạt
  - `chestFluff: '#ffe0a0'` — Lông ngực kem sáng
- Tăng toon gradient từ 3 bậc → **4–5 bậc** cho bóng đổ chi tiết hơn

---

### A7. Animation mới & cải tiến (Cơ bản)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

| Animation | Mô tả |
|-----------|-------|
| **Lông mày biểu cảm** | Xoay/nghiêng lông mày theo state (nhướng khi surprised, xụ khi sleeping, ngang khi idle) |
| **Miệng mở/đóng** | Thêm target cho miệng mở (surprised: mở to; happy: nhe răng cười) |
| **Râu rung** | Micro-animation dọc theo amplitude nhẹ, tăng khi surprised |
| **Chân cẳng liên kết** | IK-style: khi bàn chân di chuyển, cẳng chân xoay theo pivot point |
| **Má phồng thở** | Scale nhẹ 2 gò má theo nhịp thở |
| **Chuông rung** | Pendulum oscillation nhẹ khi di chuyển nhanh |

---

### A8. Tối ưu hiệu năng (Cơ bản)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)

> [!NOTE]
> Thêm nhiều chi tiết geometry có thể tăng polygon count đáng kể. Cần tối ưu:

- **Giảm segments** trên geometry nhỏ (paw pads, highlights): `8` thay vì `16`
- **BufferGeometry sharing**: Tái sử dụng geometry instances cho các mesh có cùng shape (4 chân, 2 tai, 6 râu)
- **LOD** (Level of Detail): Giảm chi tiết cho size `sm` — ẩn sọc vằn, paw pads, lông mày
- **Instanced mesh** cho sọc vằn nếu cùng geometry
- **Giám sát triangle count**: Mục tiêu ≤ 8,000 triangles tổng

---
---

# PHẦN B — NÂNG CAO PREMIUM / GHIBLI CINEMATIC

Mục tiêu: Đưa mô hình từ "đồ họa 3D khá tốt" lên **"chất lượng điện ảnh / game AAA indie"**, với chiều sâu thị giác, vật lý chuyển động tự nhiên và hiệu ứng huyền thuật Tarot mạnh mẽ.

> [!IMPORTANT]
> Phần B nên được thực hiện **sau khi hoàn thành Phần A** vì nó phụ thuộc vào cấu trúc geometry mới (gò má, cẳng chân, lông mày, v.v.) được thiết lập ở Phần A. Tuy nhiên, mục **B1 (Shader)** và **B4 (Mystic VFX)** có thể triển khai song song với Phần A.

---

## B1. Hệ Thống Shader & Vật Liệu Cao Cấp (Advanced Toon Shading)

#### [MODIFY] [materials.ts](file:///d:/YellowCatTarot/components/three/materials.ts)
#### [NEW] [shaders/catToonShader.ts](file:///d:/YellowCatTarot/components/three/shaders/catToonShader.ts)

**Rim Lighting (Viền Sáng Fresnel):**
- Thêm lớp viền sáng mềm mại quanh rìa cơ thể mèo bằng custom `ShaderMaterial` sử dụng công thức Fresnel: `pow(1.0 - dot(viewDir, normal), rimPower)`
- Đặc biệt nổi bật trên tai, gò má và đuôi — giúp tách biệt mèo khỏi background Tarot tối
- `rimColor`: Vàng ấm `#ffe8b5` cho idle, tím `#b388ff` cho reading
- `rimPower`: 2.5 (tuỳ chỉnh theo trạng thái)

**Subsurface Scattering (SSS) Giả Lập:**
- Áp dụng SSS nhẹ cho phần **tai** và **mũi** bằng cách blend `NdotL` ngược (wrap lighting):
  ```glsl
  float sss = max(0.0, dot(-lightDir, viewDir)) * sssStrength;
  finalColor += sssColor * sss * thickness;
  ```
- Khi có nguồn sáng phía sau (backlight), tai mèo sẽ hơi **trong suốt (translucency)** màu hồng cam nhẹ `#ff9e7a`, tạo cảm giác da thịt thật
- `thickness map`: Sử dụng vertex color hoặc simple procedural (tai mỏng → thickness cao → SSS mạnh)

**Custom Gradient Map (Bản Đồ Gradient Tùy Chỉnh):**
- Thay vì `step()` cứng nhắc 3 bậc hiện tại, tạo `CanvasTexture` gradient **5-tone** chuyên nghiệp:

| Tone | Tên | Giá trị Luminance | Mục đích |
|------|-----|-------------------|----------|
| 1 | **Highlight** | 1.0 | Điểm sáng trực tiếp |
| 2 | **Light** | 0.75 | Vùng sáng phụ |
| 3 | **Midtone** | 0.5 | Tông màu chính của lông |
| 4 | **Core Shadow** | 0.25 | Bóng chính (dưới cằm, bụng) |
| 5 | **Bounce Light** | 0.15 | Ánh sáng phản chiếu từ mặt đất (warm tint nhẹ) |

- Gradient map được truyền vào `meshToonMaterial.gradientMap` hoặc custom shader uniform

**Anisotropic Highlight (Vệt Sáng Kéo Dài):**
- Tạo vệt sáng specular hình elip (anisotropic) trên **mắt** và **mũi**:
  ```glsl
  float aniso = pow(dot(tangent, halfVector), anisoExponent) * anisoStrength;
  ```
- Mô phỏng độ ẩm trên mũi ướt và sự phản chiếu môi trường trên nhãn cầu
- Áp dụng qua `onBeforeCompile` hook trên `MeshToonMaterial` hiện tại để không phải viết lại toàn bộ shader

---

## B2. Hệ Thống Biểu Cảm & Morph Targets (Facial Rigging)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)
#### [NEW] [morphTargets.ts](file:///d:/YellowCatTarot/components/three/morphTargets.ts)

**Morph Targets (Blendshapes):**
Thay vì di chuyển mesh rời rạc (scale mắt, ẩn/hiện eyelid), tích hợp **Morph Targets** vào `BufferGeometry` cho các trạng thái biểu cảm phức tạp hơn:

| Target Name | Ảnh hưởng | Khi nào kích hoạt |
|-------------|-----------|-------------------|
| `eyeSmile` | Mắt híp lại hình trăng khuyết (⌒), gò má đẩy lên | `happy` state |
| `eyeWide` | Mắt mở to, nhãn cầu lộ rõ, đồng tử co nhỏ | `surprised` state |
| `mouthMeow` | Mở miệng hình chữ O kêu meo, thêm mesh lưỡi nhỏ bên trong | `surprised` + card draw reaction |
| `browFurrow` | Nhíu mày (2 lông mày kéo sát vào nhau, hơi xụ xuống) | `reading` (tập trung) |
| `browRaise` | Nhướng mày lên cao | `surprised` + `idle` (micro-expression) |
| `cheekPuff` | Má phồng tròn | `idle` (micro-expression ngẫu nhiên) |

- Triển khai bằng cách tạo `morph attribute arrays` trên geometry đầu, sau đó điều khiển `mesh.morphTargetInfluences[i]` qua LERP trong `useFrame`
- File `morphTargets.ts` chứa hàm factory tạo morph positions cho từng target

**Pupil Dilation (Đồng Tử Co Giãn Nâng Cao):**
- Đồng tử không chỉ tracking chuột (đã có) mà còn tự động thay đổi kích thước dựa trên:
  - **Cảm xúc**: `surprised` → co nhỏ 0.4x; `happy` → giãn to 1.2x; `reading` → co vừa 0.7x tập trung
  - **Cường độ ánh sáng môi trường**: Đọc `ambientLight.intensity` → map ngược tỷ lệ pupil size (sáng nhiều → đồng tử nhỏ)
- Sử dụng `smoothstep` LERP cho chuyển đổi mượt mà, không giật

**Smooth LookAt IK (Cải tiến Eye/Head Tracking):**
- Thay vì áp dụng trực tiếp `pointer.x/y` (hiện tại), sử dụng **spring damping** hệ số:
  ```typescript
  // Spring parameters
  const springStiffness = 120;  // Độ cứng lò xo
  const springDamping = 12;     // Độ tắt dần
  
  velocity += (target - current) * stiffness * dt;
  velocity *= Math.exp(-damping * dt);
  current += velocity * dt;
  ```
- Giới hạn góc xoay cổ (**neck limits**): pitch ±25°, yaw ±40°, roll ±15° — tránh lỗi bẻ cong phi thực tế
- Mắt có thể xoay **thêm 15°** so với đầu (mắt nhìn trước, đầu theo sau chậm hơn → rất tự nhiên)

---

## B3. Vật Lý & Animation Thứ Cấp (Physics & Secondary Motion)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)
#### [NEW] [physics/verletChain.ts](file:///d:/YellowCatTarot/components/three/physics/verletChain.ts)
#### [NEW] [physics/springSystem.ts](file:///d:/YellowCatTarot/components/three/physics/springSystem.ts)

**Verlet Integration cho Đuôi:**
- Thay thế hoàn toàn hệ thống animate đuôi hiện tại (sine/cosine keyframes) bằng **Verlet Physics Chain**:
  ```typescript
  class VerletChain {
    points: VerletPoint[];     // 4-6 điểm khớp
    constraints: Constraint[]; // Ràng buộc khoảng cách giữa các khớp
    gravity: THREE.Vector3;    // Trọng lực tác dụng
    damping: number;           // Hệ số giảm chấn (0.98)
    
    update(dt: number, anchorPos: THREE.Vector3): void;
    solve(iterations: number): void; // Giải ràng buộc (3-5 iterations)
  }
  ```
- Đuôi sẽ **tự động phản ứng** với chuyển động thân mèo: vẫy khi quay đầu, quấn quanh chân khi ngồi yên, rũ xuống khi ngủ, dựng đứng khi giật mình — tất cả hoàn toàn tự động theo vật lý
- Hệ số gravity thay đổi theo state: `sleeping` → gravity mạnh (đuôi nằm sát đất); `happy` → gravity yếu + random impulse (đuôi vẫy tung)

**Soft Body Squash & Stretch:**
- Khi mèo **chạm đất** sau khi nhảy (shuffle → idle) hoặc **thở nhanh**, áp dụng biến dạng squash & stretch:
  ```typescript
  // Volume preservation: scaleX * scaleY * scaleZ = 1.0
  const squashFactor = 1.0 + velocity.y * squashStrength;
  body.scale.set(
    1.0 / Math.sqrt(squashFactor),  // X giãn ra
    squashFactor,                    // Y nén xuống
    1.0 / Math.sqrt(squashFactor)   // Z giãn ra
  );
  ```
- Áp dụng cho: **bụng**, **gò má** (phồng khi thở), **đệm chân** (nén khi chạm đất)
- Mức độ squash & stretch tuỳ chỉnh theo velocity — di chuyển nhanh → biến dạng lớn hơn

**Procedural Ear Twitch (Tai Giật Tự Nhiên):**
- Thay thế random timer hiện tại bằng **Perlin Noise** (hoặc Simplex Noise):
  ```typescript
  const earNoise = noise2D(time * 0.3, earSeed) * 0.5 + 0.5;
  // Chỉ giật khi noise vượt ngưỡng threshold → tạo cảm giác tự nhiên
  if (earNoise > 0.85) {
    targetEarRotZ = Math.sign(earSeed) * 0.35;
  }
  ```
- Kết quả: tai giật **không theo chu kỳ**, trông "sống" ngay cả khi ở trạng thái `idle` lâu dài
- Có thể kích hoạt giật tai cả 2 bên đồng thời (phản xạ khi nghe tiếng động = click chuột)

---

## B4. Hiệu Ứng Huyền Thuật Tarot (Mystic VFX)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)
#### [MODIFY] [MagicParticles.tsx](file:///d:/YellowCatTarot/components/three/MagicParticles.tsx)
#### [NEW] [effects/EmissiveRunes.tsx](file:///d:/YellowCatTarot/components/three/effects/EmissiveRunes.tsx)
#### [NEW] [effects/ShockwaveRing.tsx](file:///d:/YellowCatTarot/components/three/effects/ShockwaveRing.tsx)

**Runes Phát Sáng (Emissive Runes):**
- Thêm các **ký tự Tarot cổ** (☉ ☽ ★ △ ♃ ♄ ♀ ♂) khắc trên chuông và/hoặc vòng cổ
- Sử dụng `emissiveMap` (canvas texture vẽ runtime) kết hợp `pulse animation`:
  ```typescript
  // Nhấp nháy theo nhịp tim khi reading
  const pulse = Math.sin(time * 2.0) * 0.5 + 0.5;
  bellMaterial.emissiveIntensity = reading ? pulse * 1.5 : 0.3;
  ```
- Emissive color: Vàng `#ffd166` mặc định, chuyển sang tím `#b388ff` khi `reading`
- Runes chỉ phát sáng rõ khi ở trạng thái `reading` / `shuffle`, mờ nhẹ khi `idle`

**Particle System Nâng Cao:**

| Loại hạt | Khi nào | Mô tả kỹ thuật |
|----------|---------|-----------------|
| **Tarot Dust** | `shuffle` | Hạt bụi phát sáng li ti bay lơ lửng, sử dụng `InstancedBufferGeometry` với 50-80 instances, mỗi hạt có random velocity + gravity + lifetime |
| **Magic Aura Ring** | Rút được lá bài | Sóng xung kích (shockwave ring) mờ ảo lan tỏa từ chân mèo ra ngoài bằng `ringGeometry` có scale animation 0→3.0 + fade out opacity |
| **Spirit Wisps** | `reading` | 3-5 quả cầu sáng nhỏ bay vòng quanh quả cầu pha lê theo quỹ đạo Lissajous `sin(a*t), cos(b*t)` |

**Eye Glow (Ánh Mắt Huyền Bí):**
- Thêm `emissive` layer trong **lòng đen mắt** (iris):
  ```typescript
  // Mắt phát sáng khi "tiên tri" (reading state)
  eyeMaterial.emissive.set(reading ? '#9b5de5' : '#000000');
  eyeMaterial.emissiveIntensity = reading ? (0.5 + Math.sin(time * 1.5) * 0.3) : 0;
  ```
- Kết hợp với **Selective Bloom** (B5) để tạo hào quang mắt mà không làm cháy sáng toàn bộ mô hình
- Hiệu ứng: Khi mèo đang đọc bài, mắt phát ra ánh sáng tím huyền bí nhẹ → rất kịch tính và thần bí

---

## B5. Hậu Kỳ & Tương Tác Camera (Post-Processing & Camera)

#### [MODIFY] [YellowCat3D.tsx](file:///d:/YellowCatTarot/components/YellowCat3D.tsx)
#### [NEW] [three/PostProcessing.tsx](file:///d:/YellowCatTarot/components/three/PostProcessing.tsx)

> [!WARNING]
> Post-processing effects có thể ảnh hưởng đáng kể đến hiệu năng trên thiết bị yếu. Tất cả hiệu ứng bên dưới cần có **toggle off** cho low-end devices.

**Depth of Field (DoF — Xóa Phông):**
- Sử dụng `@react-three/postprocessing` với `DepthOfField` effect
- Tự động **lấy nét (Auto-Focus)** vào đôi mắt mèo (focus distance = khoảng cách camera → head group)
- Các phần như đuôi hoặc chân ở gần camera sẽ bị làm mờ (**bokeh**) tạo chiều sâu điện ảnh
- `focalLength`: 0.05; `bokehScale`: 3; tuỳ chỉnh theo size (hero → DoF mạnh, sm → tắt DoF)

**Selective Bloom:**
- Chỉ áp dụng Bloom lên **vật thể phát sáng** (chuông runes, mắt glow, highlights, particles):
  ```typescript
  // Gán layer 1 cho emissive objects
  bellMesh.layers.enable(1);
  eyeGlowMesh.layers.enable(1);
  
  // Bloom chỉ render layer 1
  <Bloom luminanceThreshold={0.8} intensity={1.5} levels={3} />
  ```
- Hoặc sử dụng `SelectiveBloom` từ `@react-three/postprocessing` với selection array
- Tránh bloom "cháy" toàn bộ mô hình — chỉ tạo hào quang cho phần phát sáng

**Chromatic Aberration (Quang Sai):**
- Hiệu ứng lệch màu RGB nhẹ ở rìa màn hình:
  - `surprised`: offset = 0.003 (hiệu ứng "giật mình" kịch tính)
  - `shuffle`: offset = 0.002 (hiệu ứng "năng lượng phép thuật")
  - Các state khác: offset = 0 (tắt)
- Sử dụng `ChromaticAberration` effect, animate `offset` qua LERP mượt mà
- Duration ngắn (~0.5s) rồi fade out → hiệu ứng xung kích nhất thời

---

## B6. Tối Ưu Hóa GPU & Cấu Trúc Dữ Liệu Nâng Cao (GPU Optimization)

#### [MODIFY] [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx)
#### [MODIFY] [YellowCat3D.tsx](file:///d:/YellowCatTarot/components/YellowCat3D.tsx)

**Texture Atlas:**
- Gộp tất cả UV maps (sọc vằn, mắt, miệng, chuông, runes) vào **một Texture Atlas 1024×1024 duy nhất**
- Giảm draw calls từ ~15-20 xuống **≤ 5 draw calls** cho toàn bộ mô hình
- Sử dụng UV offset/scale trên mỗi mesh để map vào vùng atlas tương ứng

**GPU Instancing:**
- `InstancedMesh` cho:
  - **Particle System** (Tarot Dust, Spirit Wisps): 1 draw call cho 50-80 hạt
  - **Sọc vằn** (nếu dùng mesh): 1 draw call cho 3-5 sọc
  - **Râu**: 1 draw call cho 6 râu (nếu cùng TubeGeometry)

**Frustum Culling & Intersection Observer:**
- Tự động **tắt hiệu ứng nặng** khi component `CatModel` nằm ngoài viewport:
  ```typescript
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  ```
- Khi `isVisible = false`: Tắt Particles, DoF, Verlet Physics, giảm `useFrame` frequency → tiết kiệm GPU
- Khi `isVisible = true`: Khôi phục đầy đủ (smooth transition)

**WebGL 1.0 / Low-End Fallback:**
- Phát hiện thiết bị yếu qua:
  ```typescript
  const isLowEnd = navigator.hardwareConcurrency <= 4 
    || !renderer.capabilities.isWebGL2
    || /Android|iPhone/.test(navigator.userAgent);
  ```
- **Low-end mode** (tự động kích hoạt):
  - Shader: Chỉ dùng 3-tone toon, tắt SSS và Rim Lighting
  - Particles: Giảm count 50→15, tắt Spirit Wisps
  - Post-processing: Tắt hoàn toàn (DoF, Bloom, Chromatic Aberration)
  - Physics: Fallback đuôi về sine/cosine đơn giản (hiện tại), tắt Verlet
  - Geometry: Ẩn sọc vằn, paw pads, chest fluff, lông mày
  - Target FPS: ≥ 30fps
- **High-end mode** (mặc định trên desktop):
  - Tất cả hiệu ứng bật
  - Target FPS: ≥ 55fps

---

## Tổng Kết File Cần Thay Đổi

| File | Loại | Phần |
|------|------|------|
| [CatModel.tsx](file:///d:/YellowCatTarot/components/three/CatModel.tsx) | MODIFY | A1–A8, B2–B4, B6 |
| [materials.ts](file:///d:/YellowCatTarot/components/three/materials.ts) | MODIFY | A6, B1 |
| [MagicParticles.tsx](file:///d:/YellowCatTarot/components/three/MagicParticles.tsx) | MODIFY | B4 |
| [YellowCat3D.tsx](file:///d:/YellowCatTarot/components/YellowCat3D.tsx) | MODIFY | B5, B6 |
| [shaders/catToonShader.ts](file:///d:/YellowCatTarot/components/three/shaders/catToonShader.ts) | NEW | B1 |
| [morphTargets.ts](file:///d:/YellowCatTarot/components/three/morphTargets.ts) | NEW | B2 |
| [physics/verletChain.ts](file:///d:/YellowCatTarot/components/three/physics/verletChain.ts) | NEW | B3 |
| [physics/springSystem.ts](file:///d:/YellowCatTarot/components/three/physics/springSystem.ts) | NEW | B3 |
| [effects/EmissiveRunes.tsx](file:///d:/YellowCatTarot/components/three/effects/EmissiveRunes.tsx) | NEW | B4 |
| [effects/ShockwaveRing.tsx](file:///d:/YellowCatTarot/components/three/effects/ShockwaveRing.tsx) | NEW | B4 |
| [three/PostProcessing.tsx](file:///d:/YellowCatTarot/components/three/PostProcessing.tsx) | NEW | B5 |

---

## Open Questions

> [!IMPORTANT]
> 1. **Mũ phù thủy**: Quý nhân có muốn thêm mũ phù thủy nhỏ nghiêng trên đầu mèo? Tăng tính "pháp sư tarot" nhưng có thể thay đổi vẻ ngoài đáng yêu hiện tại.
> 2. **Sọc vằn tabby**: Nên thêm sọc vằn cam đậm kiểu tabby trên lưng/trán, hay giữ nguyên lông vàng trơn?
> 3. **Đệm chân (paw pads)**: Thêm chi tiết đệm chân hồng ở mặt dưới bàn chân?
> 4. **Thứ tự ưu tiên**: Thực hiện Phần A trước rồi B, hay chọn lọc một số mục từ cả 2 phần?
> 5. **Post-processing dependencies**: Cần cài thêm `@react-three/postprocessing` và `postprocessing` package. Quý nhân đồng ý thêm dependency?
> 6. **Perlin Noise**: Sử dụng thư viện `simplex-noise` (~2KB gzipped) hay viết inline noise function?

---

## Verification Plan

### Automated Tests
- Build kiểm tra TypeScript: `node ./node_modules/next/dist/bin/next build`
- Kiểm tra không có lỗi runtime khi render CatModel ở tất cả 6 trạng thái
- Triangle count benchmark: Log `renderer.info.render.triangles` mỗi frame, assert ≤ 12,000

### Manual Verification
- Mở dev server và kiểm tra Mèo Vàng hiển thị đúng ở trang chủ (hero), reading (lg/md), interactive (sm)
- Kiểm tra mỗi trạng thái: idle, reading, sleeping, surprised, happy, shuffle
- Kiểm tra hiệu năng FPS trên Chrome DevTools:
  - Desktop (high-end mode): target ≥ 55fps
  - Mobile (low-end mode): target ≥ 30fps
- Kiểm tra fallback SVG vẫn hoạt động khi WebGL không hỗ trợ
- Kiểm tra Intersection Observer: Scroll mèo ra ngoài viewport → GPU load giảm
- Kiểm tra Verlet đuôi: Xoay đầu mèo nhanh → đuôi phản ứng tự nhiên với độ trễ
- Kiểm tra Eye Glow + Bloom: Reading state → mắt phát sáng tím, không cháy sáng toàn bộ
