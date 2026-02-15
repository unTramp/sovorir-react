import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';

function App() {
  useEffect(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, []);

  return <AppShell />;
}

export default App;
