import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Phone, Clock, Globe, MessageSquare, AlertCircle } from 'lucide-react';
import { getStoreById, getProductsByStore } from '../services/api';
import { useCart } from '../context/CartContext';

const StoreDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [storeData, productsData] = await Promise.all([
          getStoreById(id),
          getProductsByStore(id)
        ]);
        setStore(storeData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching store details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">Cargando tienda...</div>;
  if (!store) return <div className="text-center py-20 text-slate-500 font-medium">Tienda no encontrada.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Cabecera Enriquecida */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="h-48 bg-pastel-blue relative">
          <img src={store.image} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        <div className="px-8 pb-8 -mt-16 relative flex flex-col md:flex-row gap-8 items-end">
          <div className="w-32 h-32 overflow-hidden rounded-3xl border-4 border-white shadow-lg bg-white">
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-3">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">{store.name}</h1>
            <p className="text-slate-500 max-w-2xl">{store.description}</p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{store?.location}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{store?.hours || 'Horario no disponible'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{store?.phone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {store?.facebook && (
              <a href={store.facebook} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                <Globe className="w-5 h-5" />
              </a>
            )}
            {store?.instagram && (
              <a href={store.instagram} target="_blank" rel="noreferrer" className="p-3 bg-slate-50 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Menú de Productos</h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <p className="text-slate-400 italic">No hay productos disponibles actualmente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map(product => (
                <div key={product.id} className="group bg-white rounded-3xl p-4 border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden">
                  <div className="aspect-square overflow-hidden rounded-2xl mb-4 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white px-4 py-2 rounded-full text-xs font-black text-slate-800 shadow-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          AGOTADO
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-col">
                        <span className="text-blue-500 font-black text-xl">${product.price}</span>
                        <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                        </span>
                      </div>
                      <button 
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                        className={`p-3 rounded-2xl transition-all ${
                          product.stock > 0 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95' 
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapa y Ubicación */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Nuestra Ubicación</h2>
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-50">
              {store?.map_url ? (
                <iframe 
                  title="Google Maps"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0 }}
                  src={store.map_url} 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">
                    Mapa no disponible
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                {store.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
