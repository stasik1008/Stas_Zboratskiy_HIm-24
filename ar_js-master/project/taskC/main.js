import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
const molecules = [];
const catalysts = [];
const moleculeCountH2 = 10;
const moleculeCountO = 10;
const catalystCount = 5;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const arButton = ARButton.createButton(renderer);
  document.body.appendChild(arButton);

  renderer.xr.addEventListener('sessionstart', () => {
    addMolecules();
    addCatalysts();
  });

  renderer.xr.addEventListener('sessionend', () => {
    removeMolecules();
    removeCatalysts();
  });

  window.addEventListener('resize', onWindowResize);
}

// --- Каталізатор (Pt) ---
function createCatalyst() {
  const geometry = new THREE.SphereGeometry(0.02, 12, 12);
  const material = new THREE.MeshStandardMaterial({ color: 0x6E6E6E, metalness: 1, roughness: 0.4 });
  const catalyst = new THREE.Mesh(geometry, material);
  catalyst.position.set(
    (Math.random() - 0.5) * 1.0,
    (Math.random() - 0.5) * 1.0,
    (Math.random() - 0.5) * 1.0 - 0.5
  );
  catalyst.userData.type = 'Pt';
  return catalyst;
}

function addCatalysts() {
  for (let i = 0; i < catalystCount; i++) {
    const c = createCatalyst();
    catalysts.push(c);
    scene.add(c);
  }
}

function removeCatalysts() {
  catalysts.forEach(c => {
    scene.remove(c);
    c.geometry.dispose();
    c.material.dispose();
  });
  catalysts.length = 0;
}

// --- Молекули ---

function createH2() {
  const group = new THREE.Group();
  group.userData.type = 'H2';

  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const atom1 = new THREE.Mesh(geometry, material);
  const atom2 = new THREE.Mesh(geometry, material);

  atom1.position.set(-0.03, 0, 0);
  atom2.position.set(0.03, 0, 0);

  group.add(atom1);
  group.add(atom2);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [atom1.position, atom2.position];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);

  group.position.set(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5) - 0.5
  );

  group.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  group.userData.reactionCooldown = 0;

  return group;
}

function createO() {
  const geometry = new THREE.SphereGeometry(0.03, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  const oxygen = new THREE.Mesh(geometry, material);
  oxygen.userData.type = 'O';

  oxygen.position.set(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5) - 0.5
  );

  oxygen.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  oxygen.userData.reactionCooldown = 0;

  return oxygen;
}

function createH2O() {
  const group = new THREE.Group();
  group.userData.type = 'H2O';

  const oxygenGeometry = new THREE.SphereGeometry(0.035, 16, 16);
  const oxygenMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const oxygen = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
  oxygen.position.set(0, 0, 0);
  group.add(oxygen);

  const hydrogenGeometry = new THREE.SphereGeometry(0.015, 16, 16);
  const hydrogenMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const angle = 104.5 * Math.PI / 180;

  const h1 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h1.position.set(Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  group.add(h1);

  const h2 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h2.position.set(-Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  group.add(h2);

  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const bondRadius = 0.005;

  function createBond(start, end) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const bondGeometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);

    const bond = new THREE.Mesh(bondGeometry, bondMaterial);

    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    bond.position.copy(midPoint);

    bond.lookAt(end);
    bond.rotateX(Math.PI / 2);

    return bond;
  }

  group.add(createBond(oxygen.position, h1.position));
  group.add(createBond(oxygen.position, h2.position));

  group.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  group.userData.reactionCooldown = 0;

  return group;
}

function addMolecules() {
  for (let i = 0; i < moleculeCountH2; i++) {
    const h2 = createH2();
    molecules.push(h2);
    scene.add(h2);
  }
  for (let i = 0; i < moleculeCountO; i++) {
    const o = createO();
    molecules.push(o);
    scene.add(o);
  }
}

function removeMolecules() {
  molecules.forEach(m => {
    scene.remove(m);
    if (m.geometry) {
      m.geometry.dispose();
    } else {
      m.children.forEach(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
  });
  molecules.length = 0;
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  updateMolecules();
  renderer.render(scene, camera);
}

function updateMolecules() {
  const delta = 1; // просто умовне число для cooldown (можна замінити на час)

  molecules.forEach(molecule => {
    molecule.position.add(molecule.userData.velocity);

    ['x', 'y', 'z'].forEach(axis => {
      if (molecule.position[axis] > 0.5) {
        molecule.position[axis] = 0.5;
        molecule.userData.velocity[axis] *= -1;
      }
      if (molecule.position[axis] < -0.5) {
        molecule.position[axis] = -0.5;
        molecule.userData.velocity[axis] *= -1;
      }
    });

    // Зменшуємо таймер охолодження реакції
    if (molecule.userData.reactionCooldown > 0) {
      molecule.userData.reactionCooldown -= delta;
      if (molecule.userData.reactionCooldown < 0) molecule.userData.reactionCooldown = 0;
    }
  });

  checkReactions();
}

function checkReactions() {
  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      const m1 = molecules[i];
      const m2 = molecules[j];
      if (m1.userData.reactionCooldown > 0 || m2.userData.reactionCooldown > 0) continue; // пропускаємо, якщо охолодження

      const dist = m1.position.distanceTo(m2.position);
      const types = [m1.userData.type, m2.userData.type];

      if (types.includes('H2') && types.includes('O')) {
        // Перевіряємо, чи є поруч каталізатор
        const nearCatalyst = catalysts.some(c => {
          return c.position.distanceTo(m1.position) < 0.15 || c.position.distanceTo(m2.position) < 0.15;
        });

        // Якщо каталізатор близько — реакція при більшій дистанції
        const reactionDistance = nearCatalyst ? 0.12 : 0.07;

        if (dist < reactionDistance) {
          reactH2O(m1, m2);
          return;
        }
      }
    }
  }
}

function reactH2O(m1, m2) {
  removeMolecule(m1);
  removeMolecule(m2);

  const pos = new THREE.Vector3().addVectors(m1.position, m2.position).multiplyScalar(0.5);
  const h2o = createH2O();
  h2o.position.copy(pos);
  h2o.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  molecules.push(h2o);
  scene.add(h2o);
}

function removeMolecule(molecule) {
  const index = molecules.indexOf(molecule);
  if (index !== -1) {
    scene.remove(molecule);
    molecules.splice(index, 1);

    if (molecule.geometry) {
      molecule.geometry.dispose();
    } else {
      molecule.children.forEach(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
