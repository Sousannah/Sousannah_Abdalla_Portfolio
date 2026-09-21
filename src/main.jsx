import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

/**
 * Turn scroll reveals on only once the browser has proved it is painting, and
 * painting promptly. A page opened in a background tab gets its first frame
 * late (or never), and there the animation is skipped entirely so the content
 * is simply there. See the `.reveal` rules in index.css.
 */
const startedAt = performance.now();
requestAnimationFrame(() => {
  if (performance.now() - startedAt < 400) {
    document.documentElement.classList.add('motion-ok');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
