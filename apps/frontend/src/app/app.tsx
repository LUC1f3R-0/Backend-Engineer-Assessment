import { Navigate, Route, Routes } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import Products from './pages/Products';
import Order from './pages/Order';
import NotFound from './pages/error/NotFound';

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/search" element={<Products />} />
      </Route>
      <Route path="/orders" element={<Order />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
