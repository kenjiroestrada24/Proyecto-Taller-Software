import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutGrid, UserCircle2 } from 'lucide-react';

const Navbar = () => {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            <span className="font-black text-lg">M</span>
          </div>
          <span className="font-black text-xl text-slate-800 tracking-tight">MultiShop</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">
            <LayoutGrid className="w-4 h-4" />
            Tiendas
          </Link>
          
          <div className="h-6 w-px bg-slate-100 hidden md:block"></div>

          <Link to="/cart" className="relative p-2.5 bg-slate-50 text-slate-600 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all group">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-pink-100 animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/admin/login" className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-100">
            <UserCircle2 className="w-5 h-5" />
            <span className="hidden sm:inline">Panel Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
