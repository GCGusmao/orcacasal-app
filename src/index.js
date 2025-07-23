import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa o CSS global
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Chame a função para registrar o service worker
serviceWorkerRegistration.register();
