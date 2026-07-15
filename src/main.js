import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { API_BASE } from './config'

const app = createApp(App)
app.use(router)

// Global Error Handler for Vue
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info);
  fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: err.message,
      stack: err.stack,
      info: info,
      type: 'Vue Error'
    })
  }).catch(e => console.error('Failed to send log', e));
};

// Global Error Handler for unhandled exceptions
window.addEventListener('error', (event) => {
  fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : null,
      type: 'Window Error'
    })
  }).catch(e => console.error('Failed to send log', e));
});

window.addEventListener('unhandledrejection', (event) => {
  fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: event.reason,
      type: 'Unhandled Promise Rejection'
    })
  }).catch(e => console.error('Failed to send log', e));
});

app.mount('#app')
