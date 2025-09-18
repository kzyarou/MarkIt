import './lib/firebase';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext';
import { DraftsProvider } from '@/contexts/DraftsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <AuthProvider>
      <DraftsProvider>
        <App />
      </DraftsProvider>
    </AuthProvider>
  </LanguageProvider>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/service-worker.js')
      .then(reg => console.log('Service worker registered:', reg))
      .catch(err => console.error('Service worker registration failed:', err));
  });
}
