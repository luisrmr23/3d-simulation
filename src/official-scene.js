// Official 3D building data from the City of Fürth Geoportal.
// Load the public ArcGIS I3S SceneServer only when the user switches to this view.
const toggle = document.getElementById('official3dToggle');
const fallback = document.getElementById('officialSceneStatus');
const canvas = document.getElementById('city');
const sceneContainer = document.getElementById('officialCityScene');
let sceneView = null;
let requested = false;

function showStatus(message) {
  if (fallback) {
    fallback.hidden = false;
    fallback.textContent = message;
  }
}

function setOfficialMode(enabled) {
  if (!toggle || !sceneContainer || !canvas) return;
  sceneContainer.style.display = enabled ? 'block' : 'none';
  canvas.style.display = enabled ? 'none' : 'block';
  toggle.classList.toggle('active', enabled);
  toggle.setAttribute('aria-pressed', String(enabled));
  if (enabled && sceneView) sceneView.resize();
}

function loadOfficialScene() {
  if (requested) return;
  requested = true;
  showStatus('Das amtliche 3D-Stadtmodell wird geladen …');

  if (!window.require) {
    showStatus('Die Esri-3D-Bibliothek konnte nicht geladen werden. Prüfe deine Internetverbindung.');
    return;
  }

  window.require([
    'esri/Map',
    'esri/views/SceneView',
    'esri/layers/SceneLayer'
  ], (Map, SceneView, SceneLayer) => {
    try {
      const buildings = new SceneLayer({
        url: 'https://geoportal.fuerth.de/server/rest/services/Gebaeude_LoDmax/SceneServer',
        title: 'Gebäude Fürth – amtliches 3D-Stadtmodell',
        popupEnabled: true,
        popupTemplate: {
          title: '{adresse}',
          content: [{
            type: 'fields',
            fieldInfos: [
              { fieldName: 'vm_beschriftung', label: 'Gebäudetyp' },
              { fieldName: 'hoehedach', label: 'Dachhöhe (m)', format: { places: 1 } },
              { fieldName: 'anzahloberirdischengeschosse', label: 'Oberirdische Geschosse' },
              { fieldName: 'vm_baujahr', label: 'Baujahr' },
              { fieldName: 'vm_sanjahr', label: 'Sanierungsjahr' }
            ]
          }]
        }
      });
      const map = new Map({ basemap: 'gray-vector', ground: 'world-elevation', layers: [buildings] });
      sceneView = new SceneView({
        container: sceneContainer,
        map,
        qualityProfile: 'high',
        camera: {
          position: { longitude: 10.99, latitude: 49.477, z: 1900 },
          tilt: 65,
          heading: 20
        },
        environment: { atmosphere: { quality: 'high' }, starsEnabled: false }
      });
      sceneView.when(() => {
        if (fallback) fallback.hidden = true;
      }).catch((error) => {
        console.error('Amtliches 3D-Stadtmodell konnte nicht geladen werden:', error);
        showStatus('Das amtliche 3D-Stadtmodell ist momentan nicht erreichbar. Die schematische Simulation bleibt verfügbar.');
      });
    } catch (error) {
      console.error('Fehler beim Initialisieren des amtlichen 3D-Stadtmodells:', error);
      showStatus('Das amtliche 3D-Stadtmodell konnte nicht initialisiert werden.');
    }
  });
}

toggle?.addEventListener('click', () => {
  const enabled = toggle.getAttribute('aria-pressed') !== 'true';
  setOfficialMode(enabled);
  if (enabled) loadOfficialScene();
});

document.getElementById('resetCamera')?.addEventListener('click', () => {
  if (toggle?.getAttribute('aria-pressed') === 'true' && sceneView) {
    sceneView.goTo({
      position: { longitude: 10.99, latitude: 49.477, z: 1900 },
      tilt: 65,
      heading: 20
    }).catch(() => {});
  }
});
