import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

const rootEl = document.getElementById('root')!;
const appTree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if (rootEl.hasChildNodes()) hydrateRoot(rootEl, appTree);
else createRoot(rootEl).render(appTree);
