import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import StoreDetail from './pages/StoreDetail';
import Cart from './pages/Cart';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import OwnerDashboard from './pages/admin/OwnerDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/store/:id" element={<StoreDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/register" element={<Register />} />
              <Route path="/admin/owner" element={<OwnerDashboard />} />
              <Route path="/admin/super" element={<SuperAdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
