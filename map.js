// Nhà Cổ Trần Văn Hổ — bản đồ 3D tương tác
// Bố cục lấy cảm hứng từ gxu-campus-3d (sidebar lọc lớp + danh sách landmark + "Start Tour"),
// dựng trên MapLibre GL JS + OpenFreeMap (không cần API key) thay vì WebGL tự viết.

const CENTER = [106.6493005, 10.9817781];

const CATEGORY_COLORS = {
  'kien-truc': '#a0522d',
  'noi-that': '#b08d57',
  'canh-quan': '#6b8f5e',
};

const CATEGORY_ORDER = ['kien-truc', 'noi-that', 'canh-quan'];

let landmarks = [];
let markers = new Map(); // id -> maplibregl.Marker
let selectedIds = new Set();
let activeId = null;
let tourTimer = null;
let tourRunning = false;

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: CENTER,
  zoom: 18.5,
  pitch: 55,
  bearing: -20,
  antialias: true,
  maxPitch: 80,
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

map.on('load', async () => {
  await addFloorplanLayer();
  await loadLandmarks();
});

async function addFloorplanLayer() {
  const res = await fetch('floorplan.geojson');
  const data = await res.json();

  map.addSource('floorplan', { type: 'geojson', data });

  map.addLayer({
    id: 'floorplan-extrusion',
    type: 'fill-extrusion',
    source: 'floorplan',
    filter: ['==', ['get', 'type'], 'bilding_envelope'],
    paint: {
      'fill-extrusion-color': '#c19a5b',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'base_height'],
      'fill-extrusion-opacity': 0.85,
    },
  });

  map.addLayer({
    id: 'floorplan-rooms',
    type: 'fill-extrusion',
    source: 'floorplan',
    filter: ['==', ['get', 'type'], 'room'],
    paint: {
      'fill-extrusion-color': [
        'match', ['get', 'name'],
        'Gian thờ', '#8f5b3a',
        'Gian tiếp khách', '#a0522d',
        'Buồng ngủ', '#6b3f24',
        'Sinh hoạt gia đình', '#b08d57',
        '#9a7b52',
      ],
      'fill-extrusion-height': 3.2,
      'fill-extrusion-base': 0.05,
      'fill-extrusion-opacity': 0.75,
    },
  });
}

async function loadLandmarks() {
  const res = await fetch('landmarks.geojson');
  const data = await res.json();
  landmarks = data.features.map((f) => ({
    id: f.properties.id,
    name: f.properties.name,
    category: f.properties.category,
    categoryLabel: f.properties.categoryLabel,
    description: f.properties.description,
    area: f.properties.area,
    height: f.properties.height,
    lngLat: f.geometry.coordinates,
  }));

  renderLandmarkList();
  renderMarkers();
  updateSelectionCount();
}

function renderMarkers() {
  landmarks.forEach((lm) => {
    const el = document.createElement('div');
    el.className = `landmark-marker landmark-marker--${lm.category}`;
    el.title = lm.name;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      focusLandmark(lm.id, { openPopup: true });
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(lm.lngLat)
      .addTo(map);

    markers.set(lm.id, marker);
  });
}

function renderLandmarkList() {
  const list = document.getElementById('landmark-list');
  list.innerHTML = '';

  landmarks.forEach((lm) => {
    const li = document.createElement('li');
    li.className = 'landmark-item';
    li.dataset.id = lm.id;
    li.dataset.category = lm.category;

    li.innerHTML = `
      <input type="checkbox" aria-label="Thêm ${lm.name} vào hành trình" />
      <span class="landmark-item__body">
        <span class="landmark-item__name">${lm.name}</span>
        <span class="landmark-item__cat">${lm.categoryLabel}</span>
      </span>
    `;

    const checkbox = li.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedIds.add(lm.id);
      else selectedIds.delete(lm.id);
      updateSelectionCount();
    });

    li.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      focusLandmark(lm.id, { openPopup: true });
    });

    list.appendChild(li);
  });
}

function updateSelectionCount() {
  const label = document.getElementById('landmark-count');
  label.textContent = `${selectedIds.size} điểm đã chọn`;

  const startLabel = document.getElementById('tour-start-label');
  startLabel.textContent = tourRunning
    ? 'Dừng tham quan'
    : selectedIds.size > 0
      ? `Tham quan ${selectedIds.size} điểm đã chọn`
      : 'Bắt đầu tham quan (tất cả)';
}

function focusLandmark(id, { openPopup = false } = {}) {
  const lm = landmarks.find((l) => l.id === id);
  if (!lm) return;

  setActive(id);

  map.flyTo({
    center: lm.lngLat,
    zoom: 19.2,
    pitch: 62,
    bearing: map.getBearing() + 15,
    speed: 0.8,
    curve: 1.3,
  });

  if (openPopup) showPopup(lm);
}

function setActive(id) {
  activeId = id;

  document.querySelectorAll('.landmark-item').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.id === id);
  });
  markers.forEach((marker, mid) => {
    marker.getElement().classList.toggle('is-active', mid === id);
  });
}

let activePopup = null;

function showPopup(lm) {
  if (activePopup) activePopup.remove();

  const meta = [];
  if (lm.area) meta.push(`Diện tích ước tính: ${lm.area} m²`);
  if (lm.height) meta.push(`Chiều cao khối bao: ${lm.height} m`);

  activePopup = new maplibregl.Popup({ offset: 14, closeButton: true })
    .setLngLat(lm.lngLat)
    .setHTML(`
      <h3>${lm.name}</h3>
      <p>${lm.description || ''}</p>
      ${meta.length ? `<p><em>${meta.join(' · ')}</em></p>` : ''}
    `)
    .addTo(map);
}

// ---------- Layer filter checkboxes ----------
document.querySelectorAll('.layer-toggle input[data-layer]').forEach((input) => {
  input.addEventListener('change', () => {
    const category = input.dataset.layer;
    const visible = input.checked;

    markers.forEach((marker, id) => {
      const lm = landmarks.find((l) => l.id === id);
      if (lm && lm.category === category) {
        marker.getElement().style.display = visible ? '' : 'none';
      }
    });

    document.querySelectorAll(`.landmark-item[data-category="${category}"]`).forEach((el) => {
      el.style.display = visible ? '' : 'none';
    });
  });
});

document.getElementById('toggle-extrusion').addEventListener('change', (e) => {
  const visibility = e.target.checked ? 'visible' : 'none';
  ['floorplan-extrusion', 'floorplan-rooms'].forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
  });
});

// ---------- Guided tour ----------
document.getElementById('tour-start').addEventListener('click', () => {
  if (tourRunning) {
    stopTour();
    return;
  }
  const route = selectedIds.size > 0
    ? landmarks.filter((l) => selectedIds.has(l.id))
    : landmarks;
  startTour(route);
});

function startTour(route) {
  if (!route.length) return;
  tourRunning = true;
  updateSelectionCount();

  let i = 0;
  const step = () => {
    if (!tourRunning) return;
    focusLandmark(route[i].id, { openPopup: true });
    i += 1;
    if (i >= route.length) {
      tourTimer = setTimeout(stopTour, 4500);
      return;
    }
    tourTimer = setTimeout(step, 4500);
  };
  step();
}

function stopTour() {
  tourRunning = false;
  clearTimeout(tourTimer);
  tourTimer = null;
  updateSelectionCount();
}
