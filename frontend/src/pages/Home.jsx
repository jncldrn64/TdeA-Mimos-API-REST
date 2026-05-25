import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const categorias = [
    { id: 1, nombre: "Línea Estándar", descripcion: "Productos principales de alta rotación" },
    { id: 2, nombre: "Especialidades", descripcion: "Ediciones limitadas y selecciones de temporada" },
    { id: 3, nombre: "Institucional", descripcion: "Formatos a gran escala y corporativos" },
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--color-fondo)] font-inherit">
      
      {/* ── HERO / BANNER PROMOCIONAL FULL-WIDTH ── */}
      <section className="relative w-full min-h-[500px] flex items-center shadow-inner overflow-hidden select-none">
        
        {/* Capa 1: Imagen de Fondo Estática */}
        <div className="absolute inset-0 z-0 bg-[var(--color-primario-dark)]">
          <img 
            src="/img/banner.jpg" 
            alt="Banner Promocional" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Capa 2: Superposición Oscura */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Capa 3: Contenido de Texto */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full text-white">
          <div className="max-w-2xl flex flex-col gap-5 text-center md:text-left">
            <span className="text-[var(--color-acento)] uppercase font-semibold tracking-widest text-xs drop-shadow-md">
              Plataforma Autónoma
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight drop-shadow-lg">
              Tus productos favoritos, <br />
              <span className="text-white/90">sin intermediarios.</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed drop-shadow-md">
              Explora nuestro catálogo digital unificado conectado en tiempo real con nuestra base de datos operativa. Gestión directa, rápida y segura.
            </p>
            <div className="pt-4 flex justify-center md:justify-start">
              <button
                onClick={() => navigate("/catalogo")}
                className="bg-[var(--color-acento)] hover:bg-gray-600 text-white px-10 py-3.5 rounded-lg text-sm font-bold tracking-wide shadow-xl transition-all active:scale-[0.98]"
              >
                Ver Catálogo Completo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center md:text-left mb-10">
          <h2 className="text-2xl font-bold text-[var(--color-texto)] tracking-tight">
            Explora por Categorías
          </h2>
          <p className="text-sm text-[var(--color-texto-suave)] mt-1">
            Segmentos de productos configurados en el sistema de manera estandarizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <div 
              key={cat.id}
              className="bg-[var(--color-superficie)] p-6 rounded-xl border border-[var(--color-borde)] shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate("/catalogo")}
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-secundario)] flex items-center justify-center text-[var(--color-primario)] font-bold text-sm mb-4 group-hover:bg-[var(--color-acento)] group-hover:text-white transition-colors">
                {cat.id}
              </div>
              <h3 className="font-bold text-base text-[var(--color-texto)] mb-1 group-hover:text-[var(--color-acento)] transition-colors">
                {cat.nombre}
              </h3>
              <p className="text-xs text-[var(--color-texto-suave)] leading-relaxed">
                {cat.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}