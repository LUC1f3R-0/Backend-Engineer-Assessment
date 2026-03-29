import { Navigate, Route, Routes } from 'react-router-dom';
import Products from './pages/Products';
import Order from './pages/Order';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/orders" element={<Order />} />
    </Routes>
  );
}

export default App;
