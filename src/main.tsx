import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { RouterProvider } from './lib/router';
import { CartProvider } from './store/cart';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </RouterProvider>
  </StrictMode>,
);
