"use client";
import { useState, useEffect } from 'react';
import Cal, { getCalApi } from "@calcom/embed-react";


  // --- COMPONENTE DEL MODAL (Paso a Paso) ---
  const BookingModal = ({ isOpen, onClose }) => {
  // Estado para el paso (1: Selección, 2: Formulario, 3: Calendario)
  const [step, setStep] = useState(1);
  // Estado para el tipo de servicio
  const [serviceType, setServiceType] = useState(null); 
  
  // Paso 1: El "Estado Maestro" de los datos (Lo que definimos antes)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    tipoLocacion: 'Casa',
    ciudad: 'Bogotá',
    telefono: '',
    email: '',
    direccion: '',
    referenciaCotizacion: '',
    trackingId: '' // Guardaremos el ID que viene de la API
  });

  // Configuración inicial de Cal.com (Tema oscuro y UI)
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { theme: "dark", styles: { branding: { brandColor: "#37b34a" } }, hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null; // Si el modal no está abierto, no renderizamos nada

  // Función para volver al inicio y limpiar
  const resetAndClose = () => {
    setStep(1);
    setServiceType(null);
    onClose();
  };

  // Redirigir al calendario. 

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          servicio: serviceType
        }),
      });

      const result = await response.json();

    if (result.success) {
      // 1. Guarda el ID de Seguimiento
      setFormData(prev => ({ ...prev, trackingId: result.trackingId }));
      
      // Creamos una nota para que el técnico sepa todo antes de ir
      setStep(3); 
      } else {
        alert("Error: No pudimos procesar tu solicitud.");
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={resetAndClose}></div>

      {/* Tarjeta del Modal */}
      <div 
        className="relative z-[110] bg-[#121212] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}>

        {/* Botón X para cerrar */}
        <button 
          onClick={resetAndClose} 
          className="absolute top-6 right-6 z-[120] text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

      {/* Contenido con scroll interno controlado */}
        <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {step === 1 && (
             <StepSelection onSelect={(type) => { setServiceType(type); setStep(2); }} />
          )} 
          {step === 2 && (
             <StepForm 
               serviceType={serviceType} 
               formData={formData} 
               handleChange={handleChange} 
               onBack={() => setStep(1)}
               onSubmit={handleSubmit} // <--- Para redirigir al calendario
             />
          )}

          {/* --- PASO 3: CALENDARIO EMBEBIDO --- */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter text-brand-green">Selecciona tu horario</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">ID de Gestión: {formData.trackingId}</p>
              </div>

              <div className="h-[450px] overflow-y-auto rounded-2xl border border-white/5 bg-black/20">
                <Cal
                  calLink={serviceType === 'instalacion' ? "evolt-co/instalacion" : "evolt-co/visita-tecnica"}
                  style={{ width: "100%", height: "100%" }}
                  config={{
                    name: `${formData.nombre} ${formData.apellido}`,
                    notes: `ID Seg: ${formData.trackingId} | Doc: ${formData.numeroDocumento} | Loc: ${formData.tipoLocacion} | Ciudad: ${formData.ciudad}`,
                    theme: "dark"
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};  
const StepSelection = ({ onSelect }) => (
  <div className="text-center space-y-8">
    <h3 className="text-2xl font-black uppercase tracking-tighter">¿Qué necesitas hoy?</h3>
    <div className="grid grid-cols-1 gap-4">
      <button 
        onClick={() => onSelect('visita')}
        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-green hover:bg-brand-green/5 transition-all text-left group"
      >
        <p className="font-bold uppercase text-brand-green text-xs mb-1">Opción 01</p>
        <p className="font-black text-lg uppercase tracking-tight">Visita Técnica</p>
      </button>

      <button 
        onClick={() => onSelect('instalacion')}
        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-green hover:bg-brand-green/5 transition-all text-left group"
      >
        <p className="font-bold uppercase text-brand-green text-xs mb-1">Opción 02</p>
        <p className="font-black text-lg uppercase tracking-tight text-white/50 group-hover:text-white">Instalación</p>
      </button>
    </div>
  </div>
);
    // --- COMPONENTE DEL FORMULARIO DETALLADO (PASO 2) ---
const StepForm = ({ serviceType, formData, handleChange, onBack, onSubmit }) => {
  const ciudadesColombia = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", 
    "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Ibagué"
  ];

  const esInstalacion = serviceType === 'instalacion';
  

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <button 
        onClick={onBack} 
        className="text-brand-green text-[10px] font-bold uppercase tracking-[0.2em] flex items-center hover:opacity-70 transition-opacity" >
        <span className="mr-2">←</span> Volver a selección
      </button>

      <div className="text-left">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">
          {esInstalacion ? 'Datos de Instalación' : 'Solicitud de Visita'}
        </h3>
      </div>

      <div className="space-y-4">
        {esInstalacion ? (
          /* --- FLUJO: INSTALACIÓN --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Número de documento</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            
          <div className="col-span-full space-y-6 animate-in slide-in-from-right-4 duration-300 mt-2">
            <div className="bg-brand-green/10 border border-brand-green/20 p-4 rounded-2xl">
              <p className="text-brand-green text-xs font-medium leading-relaxed">
                ⚠️ Recuerda que para solicitar la instalación debes haber recibido una visita técnica y cotización previa.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">
                Referencia de Cotización
              </label>
              <input 
                type="text" 
                name="referenciaCotizacion"
                value={formData.referenciaCotizacion}
                onChange={handleChange}
                placeholder="Ej: EV-2026-001" 
                className="bg-black/50 border border-white/10 rounded-full px-6 py-4 text-white focus:border-brand-green outline-none transition-all placeholder:text-gray-700" 
              />
            </div>
          </div>
      </div>  
          
        ) : (
          /* --- FLUJO: VISITA TÉCNICA --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Apellido</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Tipo Documento</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none appearance-none">
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PEP">PEP</option>
                <option value="PPT">PPT</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Número de Documento</label>
              <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Correo Electrónico</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Ubicación</label>
              <select name="tipoLocacion" value={formData.tipoLocacion} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none">
                <option value="Casa">Casa</option>
                <option value="Conjunto">Conjunto Residencial</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Ciudad</label>
              <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-full px-5 py-3 text-white focus:border-brand-green outline-none">
                {ciudadesColombia.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <p className="col-span-full text-center text-gray-600 text-[9px] mt-2 uppercase tracking-tighter">
              ¿No encuentras tu ciudad? envíanos un mensaje para agendar tu visita.
            </p>
          </div>
        )}
      </div>

      {/* Botón Ir al Calendario (Próximo paso: Conectar con Cal.com) */}
      <button 
        onClick={onSubmit}
        className="w-full bg-brand-green text-black font-black py-5 rounded-full uppercase text-sm tracking-[0.2em] shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
      >
        Ir al Calendario
      </button>
    </div>
  );
  };

  export default function LandingPage() {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Efecto Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <main className="bg-dark-base min-h-screen w-full relative">

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {/* NAVBAR CON IDENTIDAD SÓLIDA */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-black/90 backdrop-blur-md py-3 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-black py-5 border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16">
          
          {/* LOGO (IMAGEN) */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="E Volt Logo" 
              className={`transition-all duration-300 ${isScrolled ? 'h-7' : 'h-9'} w-auto`}
            />
          </div>

          {/* MENÚ CENTRAL */}
          <div className="hidden md:flex space-x-10 text-[10px] font-bold uppercase tracking-[0.25em]">
            {['Inicio', 'Nosotros', 'Servicios', 'Contacto'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="relative text-gray-300 hover:text-brand-green transition-colors group"
              >
                {item}
                {/* Línea decorativa que aparece al pasar el mouse */}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-brand-green transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* BOTÓN AGENDA (CTA) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-green text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-green-500 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-brand-green/20">
            Agenda tu cita
          </button>
        </div>
      </nav>

      {/* --- IMPORTANTE: ESPACIADOR --- */}
      {/* Como el navbar es 'fixed', este div evita que el Hero se meta debajo del navbar al inicio */}
      <div className="h-[80px] md:h-[90px] bg-black"></div>

      
      {/* SECCIÓN HERO */}
      <section className="relative h-screen w-full flex flex-col overflow-hidden">
        
        {/* IMAGEN DE FONDO */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.85), rgba(18, 18, 18, 0.85)), url('/hero.jpg')` 
          }}
        />
        

        {/* CONTENIDO CENTRAL DEL HERO */}
        {/* 'flex-1' obliga a este div a usar TODO el espacio hasta el fondo de la pantalla */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
          
          <h1 className="text-4xl md:text-7xl font-black uppercase leading-[1.2] tracking-tight max-w-5xl">
            Soluciones de Carga para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              Vehículos Eléctricos
            </span>
          </h1>

          <div className="flex flex-col md:flex-row gap-5 mt-12 mb-20"> {/* El mb-20 da el espacio bajo los botones */}
            <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-12 py-4 rounded-full font-black text-sm uppercase hover:bg-white/10 transition-all">
              Contáctanos
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-green text-black px-12 py-4 rounded-full font-black text-sm uppercase hover:bg-green-600 transition-all shadow-xl shadow-brand-green/20">
              Agenda tu cita
            </button>
          </div>

        </div>
      </section>

      {/* SECCIÓN NOSOTROS */}
<section id="nosotros" className="relative z-10 bg-dark-base py-32 px-6 md:px-16">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    
    {/* COLUMNA IZQUIERDA: IMAGEN POTENTE */}
    <div className="relative group">
      {/* Marco decorativo verde detrás de la imagen (símbolo de E Volt) */}
      <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-brand-green opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Contenedor de la imagen con bordes premium */}
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Reemplaza esta URL de Unsplash con una imagen real de una instalación si la tienes */}
        <img 
          src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1000" 
          alt="Instalación profesional de punto de carga por técnicos certificados de E Volt" 
          className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Tarjeta flotante de experiencia (idéntica al mockup original para dar autoridad) */}
      <div className="absolute -bottom-8 -right-8 bg-brand-green p-7 rounded-xl shadow-xl hidden md:block group-hover:scale-110 transition-transform duration-300">
        <p className="text-black font-black text-5xl tracking-tighter">+500</p>
        <p className="text-black text-[10px] font-bold uppercase tracking-widest mt-1">Puntos instalados</p>
      </div>
    </div>

    {/* COLUMNA DERECHA: TEXTO (Con el estilo premium de E Volt) */}
    <div className="flex flex-col space-y-8">
      <div>
        <p className="text-brand-green font-bold text-xs uppercase tracking-[0.3em] mb-4">
          Nuestra Esencia
        </p>
        <h2 className="text-4xl md:text-6xl font-black uppercase leading-[1.1] tracking-tighter">
          Impulsando el futuro <br />
          <span className="text-gray-500">de la movilidad</span>
        </h2>
      </div>

      <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
        En <span className="text-white font-bold italic">EVOLT</span>, no solo instalamos cargadores; diseñamos ecosistemas de energía inteligente. Nuestra misión es eliminar la fricción en la transición hacia lo eléctrico, garantizando seguridad, rapidez y un soporte técnico inigualable.
      </p>

      {/* TARJETAS DE VALOR (Minitarjetas para un diseño más limpio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-green/30 transition-colors duration-300">
          <div className="text-brand-green mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h3 className="font-bold uppercase text-xs tracking-widest mb-1 text-white">Certificación Total</h3>
          <p className="text-gray-500 text-xs">Cumplimos con las normativas RETIE y estándares internacionales.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-green/30 transition-colors duration-300">
          <div className="text-brand-green mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="font-bold uppercase text-xs tracking-widest mb-1 text-white">Carga Ultra Rápida</h3>
          <p className="text-gray-400 text-xs">Optimizamos tu infraestructura para el máximo rendimiento de tu vehículo.</p>
        </div>
      </div>
    </div>

  </div>
</section>
    {/* SECCIÓN SERVICIOS */}
{/* SECCIÓN SERVICIOS - DISEÑO PREMIUM */}
<section id="servicios" className="relative z-10 bg-black py-32 px-6 md:px-16 border-t border-white/5">
  <div className="max-w-7xl mx-auto">
    
    {/* ENCABEZADO DE SECCIÓN */}
    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
      <div className="max-w-2xl">
        <p className="text-brand-green font-bold text-xs uppercase tracking-[0.3em] mb-4">
          Nuestro Proceso
        </p>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
          Servicios <br />
          <span className="text-gray-600">Integrales</span>
        </h2>
      </div>
      <p className="text-gray-400 text-lg max-w-sm border-l border-brand-green pl-6 italic">
        "Te acompañamos en todo el proceso de documentación, permisos, instalación y mantenimiento."
      </p>
    </div>

    {/* GRILLA DE PASOS / SERVICIOS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      
      {/* PASO 1 */}
      <div className="group bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-brand-green transition-all duration-500 hover:-translate-y-2">
        <span className="text-5xl font-black opacity-20 group-hover:text-black group-hover:opacity-100 transition-all">01</span>
        <h3 className="text-xl font-bold uppercase mt-6 mb-4 group-hover:text-black">Visita Técnica</h3>
        <p className="text-gray-400 group-hover:text-black/80 leading-relaxed transition-colors">
          Ingresa al portal para agendar la visita del técnico a tu ubicación. Evaluamos tu infraestructura de inmediato.
        </p>
      </div>

      {/* PASO 2 */}
      <div className="group bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-brand-green transition-all duration-500 hover:-translate-y-2">
        <span className="text-5xl font-black opacity-20 group-hover:text-black group-hover:opacity-100 transition-all">02</span>
        <h3 className="text-xl font-bold uppercase mt-6 mb-4 group-hover:text-black">Cotización</h3>
        <p className="text-gray-400 group-hover:text-black/80 leading-relaxed transition-colors">
          Generamos una propuesta a medida para la instalación de tu punto de carga, optimizando costos y rendimiento.
        </p>
      </div>

      {/* PASO 3 */}
      <div className="group bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-brand-green transition-all duration-500 hover:-translate-y-2">
        <span className="text-5xl font-black opacity-20 group-hover:text-black group-hover:opacity-100 transition-all">03</span>
        <h3 className="text-xl font-bold uppercase mt-6 mb-4 group-hover:text-black">Instalación</h3>
        <p className="text-gray-400 group-hover:text-black/80 leading-relaxed transition-colors">
          Ejecutamos el proceso de instalación bajo normas RETIE, incluyendo mantenimiento preventivo futuro.
        </p>
      </div>

    </div>

    {/* BOTÓN DE ACCIÓN FINAL */}
    <div className="flex justify-center">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-brand-green text-black px-20 py-6 rounded-full font-black text-sm uppercase overflow-hidden shadow-2xl shadow-brand-green/20 active:scale-95 transition-all">
        <span className="relative z-10 tracking-widest">Agenda tu cita ahora</span>
        <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
      </button>
    </div>

  </div>
</section>
{/* SECCIÓN CONTACTO - VERSIÓN MODERNA PREMIUM */}
<section id="contacto" className="relative z-10 bg-dark-base py-32 px-6 md:px-16">
  <div className="max-w-7xl mx-auto">
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
      
      {/* COLUMNA IZQUIERDA: INFORMACIÓN DE MARCA */}
      <div className="flex flex-col space-y-12">
        <div>
          <p className="text-brand-green font-bold text-xs uppercase tracking-[0.3em] mb-4">
            Estamos listos
          </p>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
            Hablemos <br />
            <span className="text-gray-600">del proyecto</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            Contáctanos para obtener asesoría técnica personalizada sobre tu punto de carga.
          </p>
        </div>

        {/* BLOQUES DE INFO CON ÍCONOS */}
        <div className="space-y-8">
          {/* Horario */}
          <div className="flex items-center space-x-6 group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-black transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Horario</p>
              <p className="text-white font-medium">Lunes a Viernes, 8:00 - 16:00</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-6 group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-black transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</p>
              <p className="text-white font-medium">hola@evolt.co</p>
            </div>
          </div>

          {/* WhatsApp / Tel */}
          <div className="flex items-center space-x-6 group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-black transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Atención</p>
              <p className="text-white font-medium">+57 123 456 7890</p>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: EL FORMULARIO (Glassmorphism) */}
      <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] backdrop-blur-sm shadow-2xl">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Nombre</label>
              <input type="text" placeholder="Ej. Juan Pérez" className="bg-black/50 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-brand-green transition-all placeholder:text-gray-700" />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Email</label>
              <input type="email" placeholder="juan@ejemplo.com" className="bg-black/50 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-brand-green transition-all placeholder:text-gray-700" />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">WhatsApp / Teléfono</label>
            <input type="tel" placeholder="+57 ..." className="bg-black/50 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-brand-green transition-all placeholder:text-gray-700" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Tu Mensaje</label>
            <textarea rows="4" placeholder="Cuéntanos qué necesitas..." className="bg-black/50 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white focus:outline-none focus:border-brand-green transition-all resize-none placeholder:text-gray-700"></textarea>
          </div>

          <button className="w-full bg-brand-green text-black font-black py-5 rounded-full uppercase text-sm tracking-[0.2em] hover:bg-green-500 transition-all shadow-xl shadow-brand-green/20 active:scale-95">
            Enviar Mensaje
          </button>
        </form>
      </div>

    </div>
  </div>
</section>
{/* FOOTER - EL TOQUE FINAL PROFESIONAL */}
<footer className="relative z-10 bg-black pt-20 pb-10 px-6 md:px-16 border-t border-white/5">
  <div className="max-w-7xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      
      {/* COLUMNA 1: LOGO Y ESENCIA */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          {/* LOGO (IMAGEN) */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="E Volt Logo" 
              className={`transition-all duration-300 ${isScrolled ? 'h-7' : 'h-9'} w-auto`}
            />
          </div>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
          Líderes en infraestructura de carga para la nueva era de movilidad eléctrica en Colombia. Seguridad y potencia en cada conexión.
        </p>
      </div>

      {/* COLUMNA 2: NAVEGACIÓN RÁPIDA */}
      <div>
        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Navegación</h4>
        <ul className="space-y-4 text-gray-500 text-sm font-medium">
          <li><a href="#" className="hover:text-brand-green transition-colors">Inicio</a></li>
          <li><a href="#nosotros" className="hover:text-brand-green transition-colors">Nosotros</a></li>
          <li><a href="#servicios" className="hover:text-brand-green transition-colors">Servicios</a></li>
          <li><a href="#contacto" className="hover:text-brand-green transition-colors">Contacto</a></li>
        </ul>
      </div>

      {/* COLUMNA 3: SOPORTE / LEGAL */}
      <div>
        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Legal</h4>
        <ul className="space-y-4 text-gray-500 text-sm font-medium">
          <li><a href="#" className="hover:text-brand-green transition-colors">Política de Privacidad</a></li>
          <li><a href="#" className="hover:text-brand-green transition-colors">Términos de Servicio</a></li>
          <li><a href="#" className="hover:text-brand-green transition-colors">Certificaciones RETIE</a></li>
        </ul>
      </div>

      {/* COLUMNA 4: REDES Y NEWSLETTER */}
      <div>
        <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Síguenos</h4>
        <div className="flex space-x-4">
          {/* Iconos Minimalistas */}
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-black hover:border-brand-green transition-all duration-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-green hover:text-black hover:border-brand-green transition-all duration-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
        </div>
      </div>

    </div>

    {/* BARRA INFERIOR DE COPYRIGHT */}
    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-600 text-[10px] uppercase tracking-widest">
        © 2024 E VOLT COLOMBIA. TODOS LOS DERECHOS RESERVADOS.
      </p>
      <div className="flex space-x-6">
        <span className="text-gray-700 text-[10px] font-bold uppercase tracking-tighter italic">
          Powering the Future
        </span>
      </div>
    </div>

  </div>
</footer>


    </main>
  );
}