AFRAME.registerComponent('element-visualizer', {
  schema: {
    index: { type: 'int', default: 0 } // індекс елемента в масиві даних
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    // Припустимо, у тебе є глобальний масив elementsData з інформацією
    const element = elementsData[data.index];
    if (!element) return;

    // Створюємо ядро
    const nucleus = document.createElement('a-sphere');
    nucleus.setAttribute('radius', 0.2);
    nucleus.setAttribute('color', '#ff0000');
    el.appendChild(nucleus);

    // Параметри для оболонок (відстані від центру)
    const shellDistances = [0.5, 0.8, 1.1, 1.4, 1.7];

    // Створюємо електронні оболонки
    element.shells.forEach((electronCount, shellIndex) => {
      const radius = shellDistances[shellIndex] || (shellDistances[shellDistances.length - 1] + shellIndex * 0.3);
      const angleStep = (2 * Math.PI) / electronCount;

      // Контейнер для обертання
      const shellGroup = document.createElement('a-entity');
      shellGroup.setAttribute('rotation', '0 0 0');
      el.appendChild(shellGroup);

      for (let i = 0; i < electronCount; i++) {
        const angle = i * angleStep;
        const x = radius * Math.cos(angle);
        const y = 0;
        const z = radius * Math.sin(angle);

        const electron = document.createElement('a-sphere');
        electron.setAttribute('radius', 0.05);
        electron.setAttribute('color', '#44ccff');
        electron.setAttribute('position', `${x} ${y} ${z}`);
        shellGroup.appendChild(electron);
      }

      // Анімація обертання shellGroup
      shellGroup.setAttribute('animation', {
        property: 'rotation',
        to: '0 360 0',
        loop: true,
        dur: 8000 - shellIndex * 1000,
        easing: 'linear'
      });
    });
  }
});
