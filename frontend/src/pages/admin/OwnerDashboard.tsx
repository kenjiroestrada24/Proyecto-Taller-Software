import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Settings, Plus, Edit, Trash2, ArrowUpRight, Save, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProductsByStore, deleteProduct, createProduct, updateProduct, getStoreStats, getStoreById, updateStore } from '../../services/api';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [storeInfo, setStoreProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Obtener el ID de tienda desde el localStorage
  const STORE_ID = parseInt(localStorage.getItem('storeId') || '1'); 

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', description: '', image: '' });

  const fetchData = async () => {
    try {
      const [prods, statData, profile] = await Promise.all([
        getProductsByStore(STORE_ID),
        getStoreStats(STORE_ID),
        getStoreById(STORE_ID)
      ]);
      setProducts(prods);
      setStats(statData);
      setStoreProfile(profile);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
      fetchData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, store_id: STORE_ID };
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await createProduct(data);
    }
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', stock: '', description: '', image: '' });
    fetchData();
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStore(STORE_ID, storeInfo);
    alert('Perfil actualizado correctamente');
  };

  if (loading) return <div className="text-center py-20">Cargando panel...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar */}
      <div className="w-full lg:w-64 space-y-2">
        <div className="p-6 bg-white rounded-3xl mb-4 border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 overflow-hidden bg-slate-50 border border-slate-50">
                <img src={storeInfo?.image} alt="" className="w-full h-full object-cover" />
            </div>
            <h4 className="font-black text-slate-800 text-sm truncate">{storeInfo?.name}</h4>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Dueño de Tienda</p>
        </div>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
        >
          <LayoutDashboard className="w-5 h-5" /> Resumen
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
        >
          <Package className="w-5 h-5" /> Mis Productos
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
        >
          <Settings className="w-5 h-5" /> Perfil Tienda
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Productos</p>
                <p className="text-3xl font-black text-slate-800">{stats?.productsCount}</p>
                <div className="text-blue-500 text-xs font-bold mt-2">Sincronizado</div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Ventas Semanales</p>
                <p className="text-3xl font-black text-slate-800">${stats?.weeklySales?.toFixed(2) || '0.00'}</p>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold mt-2">
                  <ArrowUpRight className="w-3 h-3" /> Corte cada Lunes
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Estado</p>
                <p className="text-3xl font-black text-green-500">Activo</p>
                <div className="text-slate-300 text-xs font-bold mt-2">Tienda visible</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Ventas de la Semana</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="ventas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Inventario</h2>
              <button 
                onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', stock: '', description: '', image: '' }); setShowModal(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-5 h-5" /> Nuevo Producto
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Producto</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Precio</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Stock</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-800 flex items-center gap-4">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        {p.name}
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-medium">${p.price}</td>
                      <td className="px-8 py-5 font-bold">{p.stock}</td>
                      <td className="px-8 py-5 flex gap-2">
                        <button 
                          onClick={() => { setEditingProduct(p); setFormData({ name: p.name, price: p.price, stock: p.stock, description: p.description, image: p.image }); setShowModal(true); }}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Perfil de la Tienda</h2>
            <form onSubmit={handleEditProfile} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Nombre de la Tienda</label>
                        <input value={storeInfo?.name || ''} onChange={e => setStoreProfile({...storeInfo, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">Teléfono</label>
                        <input value={storeInfo?.phone || ''} onChange={e => setStoreProfile({...storeInfo, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Descripción</label>
                    <textarea value={storeInfo?.description || ''} onChange={e => setStoreProfile({...storeInfo, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Dirección (Google Maps)</label>
                    <input value={storeInfo?.location || ''} onChange={e => setStoreProfile({...storeInfo, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">URL Imagen Portada</label>
                    <input value={storeInfo?.image || ''} onChange={e => setStoreProfile({...storeInfo, image: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <button type="submit" className="px-8 py-3 bg-blue-500 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-blue-600 transition-all">
                    <Save className="w-5 h-5" /> Guardar Cambios
                </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="Nombre del producto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none" />
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" placeholder="Precio ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none" />
                        <input required type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none" />
                    </div>
                    <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none" />
                    <input placeholder="URL de imagen" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none" />
                    <button type="submit" className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-100 mt-4">{editingProduct ? 'Actualizar' : 'Crear'} Producto</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
