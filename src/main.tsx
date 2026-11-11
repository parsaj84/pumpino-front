import { StrictMode, Profiler } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function onRender(
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {

}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Profiler id='App' onRender={onRender }>
      <App />
    </Profiler>
  </StrictMode>
);
