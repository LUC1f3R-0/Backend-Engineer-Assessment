import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import Products from './pages/Products';
import Order from './pages/Order';
import NotFound from './pages/error/NotFound';

function RedirectSearchToProducts() {
  const { search } = useLocation();
  return <Navigate to={`/products${search}`} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/search" element={<RedirectSearchToProducts />} />
        <Route path="/orders" element={<Order />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
