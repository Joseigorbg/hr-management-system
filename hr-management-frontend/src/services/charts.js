import Chart from 'chart.js/auto';

// Function to create a progress distribution bar chart
export const createProgressChart = (canvasId, trainings) => {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: trainings.map(t => t.name),
      datasets: [{
        label: 'Progresso (%)',
        data: trainings.map(t => t.progress || 0),
        backgroundColor: '#4B91F1',
        borderColor: '#2E6BD7',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Progresso (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Treinamentos'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};

// Function to create a status distribution doughnut chart
export const createStatusChart = (canvasId, trainings) => {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Agendado', 'Em Andamento', 'Concluído', 'Cancelado', 'Desconhecido'],
      datasets: [{
        data: [
          trainings.filter(t => t.status === 'scheduled').length,
          trainings.filter(t => t.status === 'in_progress').length,
          trainings.filter(t => t.status === 'completed').length,
          trainings.filter(t => t.status === 'canceled').length,
          trainings.filter(t => !['scheduled', 'in_progress', 'completed', 'canceled'].includes(t.status)).length
        ],
        backgroundColor: ['#4B91F1', '#FFC107', '#4CAF50', '#F44336', '#9E9E9E']
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
};

// Function to create a participants per training bar chart
export const createParticipantsChart = (canvasId, trainings) => {
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: trainings.map(t => t.name),
      datasets: [{
        label: 'Participantes',
        data: trainings.map(t => t.participantCount || 0),
        backgroundColor: '#4B91F1',
        borderColor: '#2E6BD7',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Número de Participantes'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Treinamentos'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
};