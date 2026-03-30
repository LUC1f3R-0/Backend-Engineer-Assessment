import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import { PAGE_SIZE } from './components/ui/Pagination';
import Products from './pages/Products';
import Order from './pages/Order';
import NotFound from './pages/error/NotFound';

const PRODUCTS_DEFAULT_SEARCH = `?page=1&limit=${PAGE_SIZE}`;

function RedirectSearchToProducts() {
  const { search } = useLocation();
  const to = search ? `/products${search}` : `/products${PRODUCTS_DEFAULT_SEARCH}`;
  return <Navigate to={to} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Navigate to={`/products${PRODUCTS_DEFAULT_SEARCH}`} replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/search" element={<RedirectSearchToProducts />} />
        <Route path="/orders" element={<Order />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
