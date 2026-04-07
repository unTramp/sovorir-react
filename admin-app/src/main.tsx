import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@shared/styles/globals.css';
import '@shared/styles/admin-builder.css';
import './admin.css';
import { AdminApp } from './AdminApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
