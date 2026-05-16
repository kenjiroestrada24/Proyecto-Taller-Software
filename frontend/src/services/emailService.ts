import emailjs from '@emailjs/browser';

// Configuración inicial de EmailJS
// Reemplaza estos valores con tus propios IDs de EmailJS
const SERVICE_ID = 'service_q8z84ds'; // Tu Service ID real
const PUBLIC_KEY = '8npEhE9Cl1i9P5ss6'; // Tu clave pública proporcionada

export const sendStoreStatusEmail = async (userEmail: string, storeName: string, status: 'Aprobada' | 'Rechazada') => {
  try {
    await emailjs.send(
      SERVICE_ID,
      'template_status', // ID Confirmado por el usuario
      {
        to_email: userEmail,
        store_name: storeName,
        status_update: status,
        message: status === 'Aprobada' 
          ? `¡Felicidades! Tu tienda "${storeName}" ha sido aprobada. Ya puedes iniciar sesión.`
          : `Lamentamos informarte que tu solicitud para la tienda "${storeName}" ha sido rechazada.`
      },
      PUBLIC_KEY
    );
    console.log(`✅ Correo de ${status} enviado con éxito`);
  } catch (error: any) {
    console.error('❌ Error EmailJS (Status):', error);
    if (error.text) console.error('Detalle del error:', error.text);
  }
};

export const sendCheckoutEmail = async (customerEmail: string, itemsList: string, total: number) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      'template_checkout', // ID Confirmado por el usuario
      {
        to_email: customerEmail,
        order_details: itemsList,
        total_price: total.toFixed(2),
        message: 'Gracias por tu compra en MultiShop.'
      },
      PUBLIC_KEY
    );
    console.log('✅ Correo de compra enviado con éxito');
  } catch (error: any) {
    console.error('❌ Error EmailJS (Compra):', error);
    if (error.text) console.error('Detalle del error:', error.text);
  }
};
