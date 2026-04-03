import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import PendingOrderPrompt from './app/components/checkout/PendingOrderPrompt';
import { CartProvider } from './app/context/CartContext';
import DeviceRegistrationRoot from './app/notifications/DeviceRegistrationRoot';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <CartProvider>
        <DeviceRegistrationRoot />
        <App />
        <PendingOrderPrompt />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
);
