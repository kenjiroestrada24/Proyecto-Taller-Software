import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, CreditCard, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { createSale } from '../services/api';
import { sendCheckoutEmail } from '../services/emailService';

const Cart = () => {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Guardar la venta en nuestra base de datos MySQL
      const saleData = {
        customer_email: email,
        total: total,
        payment_method: 'Credit Card',
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await createSale(saleData);

      // 2. Enviar correo de confirmación vía EmailJS
      const itemsList = cart.map(item => `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
      await sendCheckoutEmail(email, itemsList, total);

      setOrderCompleted(true);
      clearCart();
    } catch (error) {
      console.error('Error procesando la compra:', error);
      alert('Hubo un error al procesar tu compra.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">¡Compra Confirmada!</h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          Hemos enviado un correo detallado de confirmación a <br/>
          <span className="font-black text-blue-500 underline decoration-blue-200">{email}</span>. <br/>
          ¡Gracias por confiar en MultiShop!
        </p>
        <Link to="/" className="px-10 py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Tu Carrito</h1>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 shadow-sm">
          <p className="text-slate-400 mb-10 text-lg font-medium italic">Tu carrito está esperando ser llenado...</p>
          <Link to="/" className="inline-flex items-center gap-3 px-10 py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm">
            Explorar Tiendas <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h1 className="text-4xl font-black text-slate-800 mb-10 tracking-tight">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl" />
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-lg">{item.name}</h3>
                <p className="text-slate-400 text-sm font-bold">Cantidad: {item.quantity}</p>
                <p className="text-blue-500 font-black text-lg mt-1">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-500/5">
            <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Resumen</h2>
            <div className="space-y-3 mb-8">
                <div className="flex justify-between text-slate-400 font-bold text-sm uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-50 w-full"></div>
                <div className="flex justify-between text-2xl font-black text-slate-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {!showPayment ? (
              <button 
                onClick={() => setShowPayment(true)}
                className="w-full py-5 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
              >
                Continuar al Pago
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-5 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo para Confirmación</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tarjeta de Crédito</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      required
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <button 
                  disabled={isProcessing}
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 uppercase tracking-widest text-sm"
                >
                  {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                        <span>Pagar ${total.toFixed(2)}</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
