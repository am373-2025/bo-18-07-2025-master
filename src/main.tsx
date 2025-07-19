import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext'

createRoot(document.getElementById("root")!).render(
  <FeatureFlagsProvider>
    <App />
  </FeatureFlagsProvider>
);
