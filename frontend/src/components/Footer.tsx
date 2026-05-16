import { Mail, Phone, MapPin, Globe, Send, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo y descripción */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <span className="font-black text-sm">M</span>
              </div>
              <span className="font-black text-lg text-slate-800 tracking-tight">MultiShop</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plataforma líder para conectar con las mejores tiendas locales. Encuentra tecnología, moda, comida y más en un solo lugar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">Explorar</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link to="/" className="hover:text-blue-500 transition-colors">Todas las Tiendas</Link></li>
              <li><Link to="/admin/login" className="hover:text-blue-500 transition-colors">Panel de Control</Link></li>
              <li><Link to="/cart" className="hover:text-blue-500 transition-colors">Mi Carrito</Link></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Nuevas Aperturas</a></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">Soporte</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Vender en MultiShop</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-6">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>hola@multishop.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+52 55 1234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>CDMX, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © 2026 MultiShop Platform. Sistema de Gestión de Ingeniería de Software.
          </p>
          <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-800 transition-colors">Status</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Seguridad</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
