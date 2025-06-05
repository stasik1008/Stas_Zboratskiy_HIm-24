const G = 6.67430e-11;
const SUN_MASS = 1.989e30;

const AU_IN_METERS = 1.5e11;  // 1 астрономічна одиниця в метрах

const MAX_ORBIT_RADIUS = 10;  // максимально радіус орбіти в одиницях A-Frame (задано)

const planets = [];

AFRAME.registerComponent('planet', {
  schema: {
    name: {type: 'string'},
    mass: {type: 'number'},
    year: {type: 'number'},
    dist: {type: 'number'} // у астрономічних одиницях
  },

  init: function() {
    // Нормалізація відстані для візуалізації
    const normDist = this.data.dist / 30.05 * MAX_ORBIT_RADIUS;

    // Початкова позиція по осі X
    this.el.setAttribute('position', { x: normDist, y: 0, z: 0 });

    // Початкова швидкість для кругової орбіти, взята по осі Z
    // v = sqrt(G * M_sun / r), r у метрах = dist * AU_IN_METERS
    const radiusMeters = this.data.dist * AU_IN_METERS;
    const orbitalSpeed = Math.sqrt(G * SUN_MASS / radiusMeters);

    // Масштаб швидкості для нормалізованої сцени
    // Оскільки відстані зменшені в ~3e10 разів, то й швидкість треба підкоригувати для плавного руху
    const velocityScale = 1e5;

    this.v = [0, 0, orbitalSpeed / velocityScale];

    // Додаємо планету для оновлень
    planets.push({
      el: this.el,
      name: this.data.name,
      mass: this.data.mass,
      pos: [normDist, 0, 0],
      v: this.v,
      a: [0, 0, 0]
    });
  },

  tick: function(time, timeDelta) {
    // Простіший рух по колу без взаємодії (щоб не ускладнювати)
    // Оновлюємо позицію в залежності від швидкості та часу
    const dt = timeDelta / 1000; // ms -> s

    // Оновлюємо позицію
    let planet = planets.find(p => p.el === this.el);
    if (!planet) return;

    // Позиція
    planet.pos[0] += planet.v[0] * dt;
    planet.pos[1] += planet.v[1] * dt;
    planet.pos[2] += planet.v[2] * dt;

    // Оскільки v_x = 0, v_z = const, щоб рух був круговим:
    // Перетворимо координати вручну на коло:
    // Використаємо кут (theta), який змінюємо пропорційно часу:

    if (!this.theta) this.theta = 0;
    this.theta += planet.v[2] * dt / planet.pos[0]; // omega = v / r

    // Нова позиція по колу у площині XZ:
    const r = planet.pos[0];
    const x = r * Math.cos(this.theta);
    const z = r * Math.sin(this.theta);

    this.el.setAttribute('position', { x: x, y: 0, z: z });
  }
});
