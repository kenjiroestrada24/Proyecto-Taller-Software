import { useState, useEffect } from 'react';
import { Shield, Store, BarChart3, CheckCircle, XCircle, Trash2, PieChart, X, Edit, Plus } from 'lucide-react';
import { getStores, getGlobalStats, deleteStore, updateStore, getCategories, createStore, getStoreById } from '../../services/api';
import { sendStoreStatusEmail } from '../../services/emailService';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // Cambiado a pending por defecto
  const [stores, setStores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', location: '', category_id: '' });

  const fetchData = async () => {
    try {
      const [storesData, statData, cats] = await Promise.all([
        getStores(),
        getGlobalStats(),
        getCategories()
      ]);
      setStores(Array.isArray(storesData) ? storesData : []);
      setStats(statData);
      setCategories(Array.isArray(cats) ? cats : []);
      
      // Set default category if creating
      if (!formData.category_id && Array.isArray(cats) && cats.length > 0) {
        setFormData(prev => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setStores([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteStore = async (id: number) => {
    const storeToDelete = stores.find(s => s.id === id);
    if (window.confirm('¿Eliminar esta tienda permanentemente?')) {
      await deleteStore(id);
      
      // Enviar correo de rechazo si estaba pendiente
      if (storeToDelete && storeToDelete.status === 'pending' && storeToDelete.User) {
        await sendStoreStatusEmail(storeToDelete.User.email, storeToDelete.name, 'Rechazada');
      }
      
      fetchData();
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await updateStore(id, { status });
    
    // Si aprobamos, enviar correo de bienvenida
    if (status === 'active') {
        const store = stores.find(s => s.id === id);
        if (store && store.status === 'pending' && store.User) {
            await sendStoreStatusEmail(store.User.email, store.name, 'Aprobada');
        }
    }
    
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
        await updateStore(editingStore.id, formData);
    } else {
        await createStore(formData);
    }
    setShowModal(false);
    setEditingStore(null);
    setFormData({ name: '', description: '', image: '', location: '', category_id: categories[0]?.id || '' });
    fetchData();
  };

  if (loading) return <div className="text-center py-20">Cargando consola central...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      {/* Sidebar */}
      <div className="w-full lg:w-64 space-y-2">
        <div className="px-6 py-6 mb-4 bg-slate-900 rounded-[2rem] text-white flex flex-col items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-center">
            <span className="font-black text-sm tracking-widest uppercase block">Super Admin</span>
            <span className="text-[10px] text-slate-400 font-bold">Control Global</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'pending' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          <CheckCircle className="w-5 h-5" /> Pendientes
        </button>
        <button 
          onClick={() => setActiveTab('stores')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'stores' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          <Store className="w-5 h-5" /> Tiendas
        </button>
        <button 
          onClick={() => setActiveTab('metrics')}
          className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'metrics' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
        >
          <BarChart3 className="w-5 h-5" /> Métricas
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {activeTab === 'pending' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Solicitudes Pendientes</h2>
            <div className="grid grid-cols-1 gap-4">
              {stores.filter(s => s.status === 'pending').length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                  <p className="text-slate-400 font-bold italic">No hay solicitudes pendientes en este momento.</p>
                </div>
              ) : (
                stores.filter(s => s.status === 'pending').map(store => (
                  <div key={store.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <img src={store.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">{store.name}</h3>
                        <p className="text-slate-500 text-sm">{store.Category?.name} • {store.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(store.id, 'active')}
                        className="px-6 py-3 bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprobar
                      </button>
                      <button 
                        onClick={() => handleDeleteStore(store.id)}
                        className="px-6 py-3 bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Todas las Tiendas</h2>
                <button 
                    onClick={() => { setEditingStore(null); setFormData({name: '', description: '', image: '', location: '', category_id: categories[0]?.id || ''}); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
                >
                    <Plus className="w-4 h-4" /> Nueva Tienda
                </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tienda</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                            <img src={store.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <span className="font-bold text-slate-800">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-500 text-sm font-medium">{store.Category?.name}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          store.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                        }`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 flex gap-2">
                        <button onClick={() => { setEditingStore(store); setFormData({name: store.name, description: store.description, image: store.image, location: store.location, category_id: store.category_id}); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateStatus(store.id, store.status === 'active' ? 'suspended' : 'active')} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all">
                          {store.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDeleteStore(store.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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

        {activeTab === 'metrics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-4xl font-black text-slate-800">{stats?.stores || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Tiendas</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-4xl font-black text-slate-800">{stats?.products || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Productos</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-4xl font-black text-slate-800">{stats?.sales || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Órdenes</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-4xl font-black text-blue-500">${stats?.totalRevenue?.toFixed(0) || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Ventas Totales</p>
              </div>
            </div>

            <div className="bg-blue-600 p-16 rounded-[3rem] text-white flex flex-col items-center text-center space-y-6 shadow-2xl shadow-blue-200">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <PieChart className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">Sincronización Total</h3>
              <p className="text-blue-100 max-w-md text-lg font-medium leading-relaxed">
                Todas las métricas se actualizan automáticamente al momento de cada compra.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición de Tienda */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingStore ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input required placeholder="Nombre de la tienda" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    <textarea placeholder="Descripción larga" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    <input placeholder="Ubicación (Dirección)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    <input placeholder="URL Imagen" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100" />
                    
                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <button type="submit" className="w-full py-5 bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-100 mt-6 hover:bg-blue-600 transition-all uppercase tracking-widest text-sm">{editingStore ? 'Actualizar Tienda' : 'Crear Tienda'}</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

