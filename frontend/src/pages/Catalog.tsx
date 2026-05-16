import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStores, getCategories } from '../services/api';

const Catalog = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesData, categoriesData] = await Promise.all([
          getStores(),
          getCategories()
        ]);
        console.log('Stores fetched:', storesData);
        console.log('Categories fetched:', categoriesData);
        
        // Validar que los datos sean arrays
        setStores(Array.isArray(storesData) ? storesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setStores([]); // Asegurar que sea array en caso de error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStores = activeCategory === 'Todas' 
    ? stores.filter(store => store.status === 'active')
    : stores.filter(store => store.Category?.name === activeCategory && store.status === 'active');

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando MultiShop...</p>
    </div>
  );

  if (stores.length === 0) return (
    <div className="text-center py-40 space-y-4">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>
      <h2 className="text-xl font-black text-slate-800">No se encontraron tiendas</h2>
      <p className="text-slate-400">Verifica que el servidor backend esté corriendo en el puerto 3001.</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full text-sm">Reintentar</button>
    </div>
  );

  return (
    <div>
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Explora nuestras tiendas</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Encuentra los mejores productos y servicios de marcas locales en un solo lugar.</p>
      </header>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => setActiveCategory('Todas')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === 'Todas' 
              ? 'bg-blue-400 text-white shadow-lg shadow-blue-100' 
              : 'bg-white text-slate-600 hover:bg-pastel-blue'
          }`}
        >
          Todas
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.name 
                ? 'bg-blue-400 text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-600 hover:bg-pastel-blue'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStores.map(store => (
          <Link 
            key={store.id} 
            to={`/store/${store.id}`}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={store.image} 
                alt={store.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">{store?.name}</h3>
                <span className="px-3 py-1 bg-pastel-mint text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {store?.Category?.name}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{store?.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
