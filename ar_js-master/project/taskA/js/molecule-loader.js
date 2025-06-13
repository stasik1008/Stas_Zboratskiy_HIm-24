async function loadMolecule(jsonPath, container) {
  const response = await fetch(jsonPath);
  const molecule = await response.json();

  function getAtomColor(element) {
    switch (element) {
      case 'C': return '#333333';
      case 'H': return '#FFFFFF';
      default: return '#FF00FF';
    }
  }

  function getAtomRadius(element) {
    switch (element) {
      case 'C': return 0.25;
      case 'H': return 0.15;
      default: return 0.2;
    }
  }

  molecule.atoms.forEach(atom => {
    const atomEntity = document.createElement('a-sphere');
    atomEntity.setAttribute('position', atom.position.join(' '));
    atomEntity.setAttribute('color', getAtomColor(atom.element));
    atomEntity.setAttribute('radius', getAtomRadius(atom.element));
    atomEntity.setAttribute('segments-height', 18);
    atomEntity.setAttribute('segments-width', 18);
    container.appendChild(atomEntity);
  });

  function createBond(pos1, pos2, offset = [0, 0, 0]) {
    const start = new THREE.Vector3(...pos1).add(new THREE.Vector3(...offset));
    const end = new THREE.Vector3(...pos2).add(new THREE.Vector3(...offset));
    const diff = new THREE.Vector3().subVectors(end, start);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const bond = document.createElement('a-cylinder');
    bond.setAttribute('position', `${mid.x} ${mid.y} ${mid.z}`);
    bond.setAttribute('radius', 0.05);
    bond.setAttribute('height', diff.length());
    bond.setAttribute('color', '#999999');

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, diff.clone().normalize());
    bond.object3D.quaternion.copy(quaternion);

    return bond;
  }

  molecule.bonds.forEach(bond => {
    let from, to, type;

    // підтримка як старого [i1, i2], так і нового {from, to, type}
    if (Array.isArray(bond)) {
      [from, to] = bond;
      type = 'single';
    } else {
      ({ from, to, type } = bond);
    }

    const pos1 = molecule.atoms[from].position;
    const pos2 = molecule.atoms[to].position;

    if (type === 'double') {
      // Обчислюємо напрям перпендикуляра
      const v1 = new THREE.Vector3(...pos1);
      const v2 = new THREE.Vector3(...pos2);
      const direction = new THREE.Vector3().subVectors(v2, v1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      let perpendicular = new THREE.Vector3().crossVectors(direction, up);

      // Якщо напрямок збігається з "вгору", змінити базовий вектор
      if (perpendicular.lengthSq() === 0) {
        perpendicular = new THREE.Vector3(1, 0, 0); // фолбек
      }

      perpendicular.normalize().multiplyScalar(0.1); // відстань між лініями

      const bond1 = createBond(pos1, pos2, perpendicular.toArray());
      const bond2 = createBond(pos1, pos2, perpendicular.clone().negate().toArray());

      container.appendChild(bond1);
      container.appendChild(bond2);
    } else {
      const bondEntity = createBond(pos1, pos2);
      container.appendChild(bondEntity);
    }
  });
}
