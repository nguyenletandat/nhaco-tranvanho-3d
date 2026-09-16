// =========================================================
// Nhà Cổ Trần Văn Hổ — storytelling site
// Toàn bộ logic: AOS, timeline, hotspot, loading skeleton,
// lightbox thư viện ảnh, slider so sánh xưa/nay, chia sẻ.
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initTimeline();
  initModelSkeleton();
  initHotspots();
  initGallery();
  initCompareSlider();
  initShareButtons();
  initFooterYear();
});

/* ---------------------------------------------------------
 * AOS (Animate On Scroll) — hiệu ứng "lật trang" khi cuộn
 * ------------------------------------------------------- */
function initAOS() {
  if (window.AOS) {
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }
}

/* ---------------------------------------------------------
 * TIMELINE — dữ liệu dạng mảng, dễ chỉnh sửa.
 * TODO: đây là các mốc placeholder (trừ 1890 và 1993 là mốc
 * đã xác nhận theo hồ sơ di tích) — bổ sung/chỉnh sửa các sự
 * kiện thật của công trình tại đây.
 * ------------------------------------------------------- */
const TIMELINE_DATA = [
  { year: '1890', event: 'Khởi dựng ngôi nhà (năm Canh Dần), trên khuôn viên rộng 1.296 m².' },
  { year: '19xx', event: '(Placeholder) Một sự kiện lịch sử đáng chú ý trong giai đoạn biến động — thay bằng nội dung thật.' },
  { year: '1993', event: 'Được xếp hạng Di tích kiến trúc nghệ thuật cấp Quốc gia (07/01/1993).' },
  { year: '20xx', event: '(Placeholder) Đợt trùng tu / bảo tồn — thay bằng nội dung và năm thật.' },
  { year: '20xx', event: '(Placeholder) Mốc gần đây nhất — thay bằng nội dung và năm thật.' },
];

function initTimeline() {
  const list = document.getElementById('timeline-list');
  if (!list) return;

  TIMELINE_DATA.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.setAttribute('data-aos', index % 2 === 0 ? 'fade-up-right' : 'fade-up-left');
    el.setAttribute('data-aos-delay', String(Math.min(index * 80, 240)));
    el.innerHTML = `
      <div class="timeline-item__year">${escapeHTML(item.year)}</div>
      <p class="timeline-item__event">${escapeHTML(item.event)}</p>
    `;
    list.appendChild(el);
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
 * MODEL-VIEWER — ẩn skeleton loading khi model tải xong
 * ------------------------------------------------------- */
function initModelSkeleton() {
  const modelViewer = document.getElementById('house-model');
  const skeleton = document.getElementById('model-skeleton');
  if (!modelViewer || !skeleton) return;

  modelViewer.addEventListener('load', () => {
    skeleton.classList.add('is-hidden');
  });

  modelViewer.addEventListener('error', () => {
    skeleton.querySelector('.model-skeleton__label').textContent =
      'Không tải được mô hình 3D — kiểm tra lại file 3DNhaCo.glb.';
  });
}

/* ---------------------------------------------------------
 * HOTSPOTS — bấm để hiện/ẩn chú thích (data-driven qua các
 * <button slot="hotspot-N"> đã khai báo sẵn trong HTML).
 * ------------------------------------------------------- */
function initHotspots() {
  const hotspots = document.querySelectorAll('.hotspot');
  hotspots.forEach((hotspot) => {
    hotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = hotspot.classList.contains('is-active');
      hotspots.forEach((h) => h.classList.remove('is-active'));
      if (!wasActive) hotspot.classList.add('is-active');
    });
  });

  document.addEventListener('click', () => {
    hotspots.forEach((h) => h.classList.remove('is-active'));
  });
}

/* ---------------------------------------------------------
 * GALLERY LIGHTBOX
 * ------------------------------------------------------- */
function initGallery() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!items.length || !lightbox || !lightboxImg) return;

  let currentIndex = 0;

  function open(index) {
    currentIndex = (index + items.length) % items.length;
    const src = items[currentIndex].dataset.full;
    const alt = items[currentIndex].querySelector('img').alt;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => open(index));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => open(currentIndex - 1));
  nextBtn.addEventListener('click', () => open(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(currentIndex - 1);
    if (e.key === 'ArrowRight') open(currentIndex + 1);
  });
}

/* ---------------------------------------------------------
 * COMPARE SLIDER — so sánh ảnh xưa/nay
 * ------------------------------------------------------- */
function initCompareSlider() {
  const frame = document.getElementById('compare-frame');
  const after = document.getElementById('compare-after');
  const range = document.getElementById('compare-range');
  const handle = document.getElementById('compare-handle');
  if (!frame || !after || !range || !handle) return;

  function update(value) {
    after.style.width = value + '%';
    handle.style.left = value + '%';
  }

  function syncFrameWidth() {
    frame.style.setProperty('--frame-w', frame.offsetWidth + 'px');
  }

  syncFrameWidth();
  update(range.value);

  range.addEventListener('input', () => update(range.value));
  window.addEventListener('resize', syncFrameWidth);
}

/* ---------------------------------------------------------
 * SHARE BUTTONS — chia sẻ link trang hiện tại
 * ------------------------------------------------------- */
function initShareButtons() {
  const fbBtn = document.getElementById('share-fb');
  const zaloBtn = document.getElementById('share-zalo');
  const pageUrl = window.location.href;

  if (fbBtn) {
    fbBtn.addEventListener('click', () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    });
  }

  if (zaloBtn) {
    zaloBtn.addEventListener('click', () => {
      const url = `https://sp.zalo.me/plugin/share?url=${encodeURIComponent(pageUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    });
  }
}

/* ---------------------------------------------------------
 * FOOTER YEAR
 * ------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}
