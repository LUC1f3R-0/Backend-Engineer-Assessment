import { Navigate, Route, Routes } from 'react-router-dom';
import Products from './pages/Products';
import Order from './pages/Order';
import NotFound from './pages/error/NotFound';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/orders" element={<Order />} />

      <Route path='*' element={<NotFound/>}/>
    </Routes>
  );
}

export default App;
