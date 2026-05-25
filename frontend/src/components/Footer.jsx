export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-primario)] text-white text-sm font-inherit mt-auto border-t border-white/5">
      {/* ── Bloque Principal de Contenido ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-12">
        
        {/* Columna 1: Canales de Atención */}
        <div className="flex flex-col gap-3 md:border-r border-white/10 md:pr-8">
          <div className="flex items-center gap-2">
            <img src="/img/iconos/soporte.svg" alt="" className="w-5 h-5 invert opacity-80" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-secundario)]">Contacto</h3>
          </div>
          <p className="text-white/70 text-xs leading-relaxed">
            Soporte técnico y canales de atención comercial corporativa de la organización.
          </p>
          <span className="text-xs font-medium text-white/90 hover:underline cursor-pointer">
            soporte@tuplataforma.com
          </span>
        </div>

        {/* Columna 2: Disponibilidad del Canal */}
        <div className="flex flex-col gap-2 md:border-r border-white/10 md:px-8">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-secundario)]">Operación</h3>
          <p className="text-white/80 font-medium">Canal Digital Autónomo</p>
          <p className="text-white/60 text-xs leading-relaxed">
            Disponible de forma continua para el procesamiento de solicitudes transaccionales y sincronización de inventario.
          </p>
        </div>

        {/* Columna 3: Marco Legal y Privacidad */}
        <div className="flex flex-col gap-2 md:pl-8">
          <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-secundario)]">Políticas</h3>
          <ul className="flex flex-col gap-2 text-xs text-white/70">
            <li className="hover:text-white transition-colors cursor-pointer">Aviso de Privacidad</li>
            <li className="hover:text-white transition-colors cursor-pointer">Tratamiento de Datos Personales</li>
            <li className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones del Servicio</li>
          </ul>
        </div>
      </div>

      {/* ── Barra de Derechos y Propiedad ── */}
      <div className="border-t border-white/10 bg-black/10 px-8 py-4 text-center text-xs text-white/50 tracking-wide">
        Plataforma Autónoma de Ventas © {anioActual}. Todos los derechos reservados.
      </div>
    </footer>
  );
}