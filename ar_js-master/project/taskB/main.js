let elementsData = [];
let trendChart;

document.addEventListener("DOMContentLoaded", async () => {
  // Завантажуємо дані про елементи один раз
  elementsData = await fetch('data/elements.json').then(res => res.json());

  const scene = document.querySelector("a-scene");

  // Створюємо таргети та їх контент
  for (let i = 0; i < elementsData.length; i++) {
    // Створюємо таргет для MindAR
    const target = document.createElement("a-entity");
    target.setAttribute("mindar-image-target", `targetIndex: ${i}`);

    // Створюємо контент — тут буде компонент, що візуалізує атом
    const content = document.createElement("a-entity");
    content.setAttribute("element-visualizer", `index: ${i}`);
    content.setAttribute("position", "0 0 0");
    target.appendChild(content);

    // Додаємо до сцени
    scene.appendChild(target);

    // Додаємо слухачі подій для показу/приховування інформації
    target.addEventListener("targetFound", () => {
      showElementInfo(elementsData[i]);
    });
    target.addEventListener("targetLost", () => {
      hideElementInfo();
    });
  }

  // Відразу показуємо тренд електронегативності
  updateTrendChart("electronegativity");
});

// Функція показу інформаційної панелі
function showElementInfo(element) {
  document.getElementById("element-symbol").textContent = element.symbol;
  document.getElementById("element-name").textContent = element.name;
  document.getElementById("element-number").textContent = element.number;
  document.getElementById("element-mass").textContent = element.mass;
  document.getElementById("element-en").textContent = element.electronegativity ?? "–";
  document.getElementById("element-radius").textContent = element.radius ?? "–";
  document.getElementById("element-shells").textContent = element.shells ? element.shells.join(", ") : "–";

  document.getElementById("info-panel").style.display = "block";
}

// Функція приховування інформації
function hideElementInfo() {
  document.getElementById("info-panel").style.display = "none";
}

// Оновлення графіка трендів за вибраною властивістю
function updateTrendChart(property = "electronegativity") {
  if (!elementsData || elementsData.length === 0) return;

  const filtered = elementsData.filter(e => e[property] !== null && e[property] !== undefined);
  const labels = filtered.map(e => e.symbol);
  const values = filtered.map(e => e[property]);

  if (trendChart) {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = values;
    trendChart.data.datasets[0].label = property.charAt(0).toUpperCase() + property.slice(1);
    trendChart.update();
  } else {
    const ctx = document.getElementById("trend-chart").getContext("2d");
    trendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: property.charAt(0).toUpperCase() + property.slice(1),
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}
