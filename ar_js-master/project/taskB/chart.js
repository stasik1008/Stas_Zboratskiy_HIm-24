// chart.js

fetch('elements.json')
  .then(response => response.json())
  .then(data => {
    // Візьмемо перші 35 елементів
    const elements = data.slice(0, 35);

    // Масив символів елементів для підписів по осі X
    const labels = elements.map(el => el.symbol);

    // Дані для графіка атомного радіусу (якщо немає - ставимо null)
    const radiusData = elements.map(el => el.radius || null);

    // Дані для графіка електронегативності (null, якщо немає)
    const electronegativityData = elements.map(el => el.electronegativity || null);

    // Перший графік — атомний радіус
    const ctxRadius = document.getElementById('radiusChart').getContext('2d');
    const radiusChart = new Chart(ctxRadius, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Атомний радіус (пм)',
          data: radiusData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: true }
        }
      }
    });

    // Другий графік — електронегативність
    const ctxElectro = document.getElementById('electroChart').getContext('2d');
    const electroChart = new Chart(ctxElectro, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Електронегативність',
          data: electronegativityData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: true }
        }
      }
    });
  })
  .catch(err => {
    console.error('Помилка при завантаженні даних:', err);
  });
