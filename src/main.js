import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DEFAULTS, SCENARIOS, normalizeState, calculateMetrics, getRecommendation } from './model.js';

const $ = (id) => document.getElementById(id);
const controlIds = Object.keys(DEFAULTS);
let state = normalizeState(DEFAULTS);
let networkOn = true;
let heatOn = false;
let toastTimer;

function renderMetrics() {
  const metrics = calculateMetrics(state);
  for (const id of controlIds) $(id + 'Val').textContent = state[id] + ' %';
  $('energy').textContent = metrics.energy;
  $('heating').textContent = metrics.heating;
  $('water').textContent = metrics.retention;
  $('heat').textContent = metrics.heat;
  $('greenMetric').textContent = metrics.green;
  $('mobility').textContent = metrics.mobility;
  $('indexValue').textContent = metrics.index;
  $('indexBar').style.width = metrics.index + '%';
  $('recommendationText').textContent = getRecommendation(metrics);
  updateCityVisuals();
}

function setState(next, activeScenario = null) {
  state = normalizeState(next);
  for (const id of controlIds) $(id).value = String(state[id]);
  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.classList.toggle('active', button.dataset.scenario === activeScenario);
  });
  renderMetrics();
}

function showToast(message) {
  const element = $('toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2200);
}

for (const id of controlIds) {
  $(id).addEventListener('input', (event) => {
    state = normalizeState({ ...state, [id]: event.currentTarget.value });
    document.querySelectorAll('[data-scenario]').forEach((button) => button.classList.remove('active'));
    renderMetrics();
  });
}

document.querySelectorAll('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.scenario;
    setState(SCENARIOS[name], name);
    showToast('Szenario ' + name + ' geladen');
  });
});

$('networkToggle').addEventListener('click', () => {
  networkOn = !networkOn;
  $('networkToggle').setAttribute('aria-pressed', String(networkOn));
  updateCityVisuals();
});
$('heatToggle').addEventListener('click', () => {
  heatOn = !heatOn;
  $('heatToggle').setAttribute('aria-pressed', String(heatOn));
  updateCityVisuals();
});
$('resetCamera').addEventListener('click', () => {
  if (!cityView) return;
  cityView.camera.position.set(22, 25, 30);
  cityView.controls.target.set(0, 0, 0);
  cityView.controls.update();
});
$('reset').addEventListener('click', () => {
  setState(DEFAULTS, 'today');
  showToast('Ausgangswerte wiederhergestellt');
});
$('optimize').addEventListener('click', () => {
  setState({ solar: 68, retrofit: 62, permeable: 56, storage: 64, green: 72, transit: 40, bike: 46 });
  showToast('Modelloptimierung angewendet – Budget und Zielkonflikte nicht berücksichtigt');
});

let cityView = null;
function createCity() {
  const canvas = $('city');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x182a2a, 32, 78);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
  camera.position.set(22, 25, 30);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.minDistance = 12;
  controls.maxDistance = 62;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xc7e4d8, 0x26372f, 2.1));
  const sun = new THREE.DirectionalLight(0xffe2b4, 2.3);
  sun.position.set(-12, 24, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  const city = new THREE.Group();
  scene.add(city);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(58, 48),
    new THREE.MeshStandardMaterial({ color: 0x263a33, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.15;
  ground.receiveShadow = true;
  city.add(ground);

  const buildingMeshes = [];
  const treeCrowns = [];
  const pvPanels = [];
  const networkLines = [];
  const baseColors = [0x9caa9e, 0xb8b4a3, 0x778b87, 0xc5c0ae, 0x879a90];
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x455b54, roughness: 0.86 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x735b42 });
  const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x78a878, roughness: 1 });
  const pvMaterial = new THREE.MeshStandardMaterial({ color: 0x3b83a0, metalness: 0.35, roughness: 0.4, emissive: 0x102a36 });
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  let seed = 17;
  const random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  function addBuilding(x, z, width, height, depth, colorIndex) {
    const material = new THREE.MeshStandardMaterial({ color: baseColors[colorIndex], roughness: 0.88 });
    const building = new THREE.Mesh(buildingGeometry, material);
    building.scale.set(width, height, depth);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    building.userData.baseColor = baseColors[colorIndex];
    city.add(building);
    buildingMeshes.push(building);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.12, depth * 0.92), roofMaterial);
    roof.position.set(x, height + 0.06, z);
    city.add(roof);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.58, 0.045, depth * 0.55), pvMaterial);
    panel.position.set(x, height + 0.14, z);
    panel.visible = false;
    city.add(panel);
    pvPanels.push(panel);
  }

  function addTree(x, z, scale) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.11 * scale, 0.72 * scale, 6), trunkMaterial);
    trunk.position.y = 0.36 * scale;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48 * scale, 1), crownMaterial);
    crown.position.y = 0.95 * scale;
    crown.castShadow = true;
    group.add(trunk, crown);
    city.add(group);
    treeCrowns.push(group);
  }

  const districts = [
    { name: 'Hardhöhe', x: -14, z: -8, count: 38, scale: 1 },
    { name: 'Innenstadt', x: 0, z: 1, count: 52, scale: 0.78 },
    { name: 'Südstadt', x: 11, z: -9, count: 38, scale: 1.05 },
    { name: 'Modellquartier', x: 13, z: 11, count: 28, scale: 0.86 },
    { name: 'Grün- und Flussräume', x: -13, z: 12, count: 15, scale: 1.25 }
  ];

  for (const [districtIndex, district] of districts.entries()) {
    for (let i = 0; i < district.count; i++) {
      const x = district.x + (random() - 0.5) * 10 * district.scale;
      const z = district.z + (random() - 0.5) * 8 * district.scale;
      if (Math.abs(x) < 7 && z > 8) continue;
      const width = 0.55 + random() * 0.85;
      const height = 1 + random() * (districtIndex === 1 ? 4.2 : 3.2);
      const depth = 0.6 + random() * 0.9;
      addBuilding(x, z, width, height, depth, Math.floor(random() * baseColors.length));
      if (random() > 0.73) addTree(x + (random() - 0.5) * 1.5, z + (random() - 0.5) * 1.5, 0.6 + random() * 0.45);
    }
    const marker = new THREE.Mesh(
      new THREE.CircleGeometry(1.4, 32),
      new THREE.MeshBasicMaterial({ color: 0x6e9b77, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(district.x, 0.01, district.z);
    city.add(marker);
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512; labelCanvas.height = 96;
    const context = labelCanvas.getContext('2d');
    context.font = 'bold 42px sans-serif';
    context.fillStyle = '#dcece1';
    context.fillText(district.name, 12, 62);
    const texture = new THREE.CanvasTexture(labelCanvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
    sprite.position.set(district.x, 4.7, district.z);
    sprite.scale.set(5.8, 1.1, 1);
    city.add(sprite);
  }

  for (let i = 0; i < 90; i++) {
    const x = (random() - 0.5) * 46;
    const z = (random() - 0.5) * 36;
    if (Math.abs(x) > 7 || Math.abs(z) > 9) addTree(x, z, 0.65 + random() * 0.55);
  }

  const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x397f9a, roughness: 0.25, metalness: 0.12 });
  function addRiver(points, width) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.025, z)));
    city.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 100, width / 2, 12, false), riverMaterial));
  }
  addRiver([[-22,-15],[-17,-8],[-13,-2],[-10,5],[-7,15]], 2.1);
  addRiver([[20,-15],[14,-9],[9,-4],[2,1],[-7,15]], 1.45);
  addRiver([[-7,15],[-1,18],[8,20],[19,20]], 1.7);

  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x53615b, roughness: 1 });
  function addRoad(points, width) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.015, z)));
    city.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 100, width / 2, 8, false), roadMaterial));
  }
  addRoad([[-25,-4],[-15,-3],[-5,-2],[5,-1],[15,2],[25,4]], 0.65);
  addRoad([[-18,14],[-12,8],[-5,4],[2,0],[10,-6],[18,-14]], 0.52);
  addRoad([[-21,-14],[-12,-12],[-3,-10],[8,-10],[19,-8]], 0.5);
  addRoad([[-2,-22],[-1,-12],[0,-3],[2,7],[4,18]], 0.4);

  const park = new THREE.Mesh(new THREE.CircleGeometry(4.4, 40), new THREE.MeshStandardMaterial({ color: 0x416b50 }));
  park.rotation.x = -Math.PI / 2;
  park.position.set(-18, 0.01, 13);
  park.scale.set(1.25, 0.8, 1);
  city.add(park);

  const districtPoints = districts.map(({x,z}) => [x,z]);
  for (let i = 0; i < districtPoints.length - 1; i++) {
    for (const [a,b,color] of [
      [districtPoints[i], districtPoints[i+1], 0xe8c86e],
      [districtPoints[i], districtPoints[(i+2) % districtPoints.length], 0x65bfe4]
    ]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(a[0], 0.45, a[1]),
        new THREE.Vector3((a[0]+b[0])/2, 1.1, (a[1]+b[1])/2),
        new THREE.Vector3(b[0], 0.45, b[1])
      ]);
      const line = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, 0.035, 5, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
      );
      city.add(line);
      networkLines.push(line);
    }
  }

  cityView = { renderer, scene, camera, controls, buildingMeshes, treeCrowns, pvPanels, networkLines };
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  resize();
  const clock = new THREE.Clock();
  function animate() {
    if (!canvas.isConnected) { observer.disconnect(); renderer.dispose(); return; }
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    networkLines.forEach((line, i) => {
      line.material.opacity = networkOn ? 0.48 + Math.sin(time * 2 + i) * 0.18 : 0;
    });
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function updateCityVisuals() {
  $('networkToggle').classList.toggle('active', networkOn);
  $('heatToggle').classList.toggle('active', heatOn);
  if (!cityView) return;
  const metrics = calculateMetrics(state);
  cityView.networkLines.forEach((line) => { line.visible = networkOn; });
  cityView.pvPanels.forEach((panel, index) => {
    panel.visible = index < Math.round(cityView.pvPanels.length * state.solar / 100);
  });
  cityView.treeCrowns.forEach((tree, index) => {
    tree.visible = index < Math.round(cityView.treeCrowns.length * state.green / 100);
  });
  cityView.buildingMeshes.forEach((building) => {
    const base = new THREE.Color(building.userData.baseColor);
    if (heatOn) {
      const intensity = THREE.MathUtils.clamp((metrics.heat - 25) / 12, 0, 1);
      base.lerp(new THREE.Color(0xe66c42), intensity * 0.78);
    }
    building.material.color.copy(base);
  });
}

try {
  createCity();
} catch (error) {
  console.error('3D-Ansicht konnte nicht gestartet werden:', error);
  $('cityError').hidden = false;
  $('cityError').textContent = 'Die 3D-Ansicht konnte auf diesem Gerät nicht gestartet werden. Die Regler und Modellberechnungen bleiben verfügbar.';
}
renderMetrics();
