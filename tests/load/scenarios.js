import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    // Prueba de carga normal
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },  // Ramp-up a 50 usuarios
        { duration: '3m', target: 50 },  // Mantener 50 usuarios
        { duration: '1m', target: 0 }    // Ramp-down a 0
      ],
      gracefulRampDown: '30s'
    },
    
    // Prueba de picos de tráfico
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // Rápido ramp-up
        { duration: '1m', target: 100 },  // Mantener carga alta
        { duration: '10s', target: 0 }    // Rápido ramp-down
      ],
      gracefulRampDown: '30s'
    },
    
    // Prueba de estrés
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Ramp-up normal
        { duration: '5m', target: 100 },   // Mantener carga
        { duration: '2m', target: 200 },   // Aumentar a carga alta
        { duration: '5m', target: 200 },   // Mantener carga alta
        { duration: '2m', target: 300 },   // Aumentar a carga muy alta
        { duration: '5m', target: 300 },   // Mantener carga muy alta
        { duration: '2m', target: 0 }      // Ramp-down
      ],
      gracefulRampDown: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de las peticiones deben completarse en menos de 500ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores
    errors: ['rate<0.05']             // Menos del 5% de errores totales
  }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function() {
  // Prueba de endpoints principales
  group('Main Endpoints', function() {
    // Contratos
    const contractsResponse = http.get(`${BASE_URL}/api/v1/contracts`);
    check(contractsResponse, {
      'contracts status is 200': (r) => r.status === 200,
      'contracts response has data': (r) => r.json().contracts.length > 0
    }) || errorRate.add(1);
    
    sleep(1);

    // Presupuestos
    const budgetResponse = http.get(`${BASE_URL}/api/v1/budgets/distribution`);
    check(budgetResponse, {
      'budget status is 200': (r) => r.status === 200,
      'budget has total': (r) => r.json().total > 0
    }) || errorRate.add(1);
    
    sleep(1);

    // Alertas
    const alertsResponse = http.get(`${BASE_URL}/api/v1/alerts`);
    check(alertsResponse, {
      'alerts status is 200': (r) => r.status === 200
    }) || errorRate.add(1);
  });

  // Prueba de caché
  group('Cache Performance', function() {
    // Primera petición (miss de caché)
    const firstResponse = http.get(`${BASE_URL}/api/v1/contracts`);
    const firstTiming = firstResponse.timings.duration;
    
    sleep(1);
    
    // Segunda petición (hit de caché)
    const secondResponse = http.get(`${BASE_URL}/api/v1/contracts`);
    const secondTiming = secondResponse.timings.duration;
    
    check(secondResponse, {
      'cache hit is faster': () => secondTiming < firstTiming,
      'cache hit is under 100ms': () => secondTiming < 100
    }) || errorRate.add(1);
  });

  // Prueba de rate limiting
  group('Rate Limiting', function() {
    // Hacer múltiples peticiones rápidas
    const responses = [];
    for (let i = 0; i < 10; i++) {
      responses.push(http.get(`${BASE_URL}/api/v1/contracts`));
    }
    
    check(responses, {
      'all requests successful or rate limited': (rs) => rs.every(r => 
        r.status === 200 || r.status === 429
      ),
      'some requests rate limited': (rs) => rs.some(r => 
        r.status === 429
      )
    }) || errorRate.add(1);
  });
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}