import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth(); 
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500"; 
  const token = localStorage.getItem("token");

  const rol = Number(usuario?.rol);
  
  const [tabActiva, setTabActiva] = useState(
    rol === 2 ? 'inventario' : rol === 3 ? 'soporte' : 'pedidos'
  );

  // ── ESTADOS DE USUARIOS ──
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // ── ESTADOS DE INVENTARIO ──
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [modalProducto, setModalProducto] = useState(null);

  // ── ESTADOS DE SOPORTE (PQRS) ──
  const [incidentes, setIncidentes] = useState([]);
  const [cargandoIncidentes, setCargandoIncidentes] = useState(false);
  const [ticketEditando, setTicketEditando] = useState(null);
  const [respuestaAdmin, setRespuestaAdmin] = useState("");

  // ── ESTADOS DE PEDIDOS ──
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // ── EXPULSADOR AUTOMÁTICO ──
  const verificarSesion = (status) => {
    if (status === 401 || status === 403) {
      alert("Por tu seguridad, la sesión ha expirado. Ingresa nuevamente.");
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  };

  // ── FUNCIONES DE USUARIOS ──
  const cargarUsuarios = async () => {
    if (rol !== 0 && rol !== 1) return;
    setCargandoUsuarios(true);
    try {
      const res = await fetch(`${API}/api/usuario`, { headers: { "Authorization": `Bearer ${token}` } });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (res.ok || data.success) setUsuarios(data.data || data);
    } catch (e) { console.error("Error usuarios:", e); } 
    finally { setCargandoUsuarios(false); }
  };

  const actualizarUsuario = async () => {
    try {
      const payload = {
        nombre: usuarioEditando.nombre,
        apellido: usuarioEditando.apellido,
        email: usuarioEditando.email,
        estado: usuarioEditando.estado,
        rol: Number(usuarioEditando.id_rol || usuarioEditando.rol) 
      };

      const res = await fetch(`${API}/api/usuario/${usuarioEditando.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (verificarSesion(res.status)) return;
      const data = await res.json(); 
      if (res.ok || data.success || data.message?.toLowerCase().includes("exitosamente")) {
        alert("¡Cuenta actualizada con éxito!"); 
        setUsuarioEditando(null); 
        cargarUsuarios(); 
      } else {
        alert("Atención: " + (data.message || data.error || "No se pudo actualizar"));
      }
    } catch (error) { alert("Falla de red al actualizar usuario."); }
  };

  // ── FUNCIONES DE INVENTARIO ──
  const cargarProductos = async () => {
    if (rol !== 0 && rol !== 2) return;
    setCargandoProductos(true);
    try {
      const res = await fetch(`${API}/api/producto`, { headers: { "Authorization": `Bearer ${token}` } });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (res.ok || data.success) setProductos(data.data || data);
    } catch (e) { console.error("Error productos:", e); } 
    finally { setCargandoProductos(false); }
  };

  const abrirModalNuevo = () => {
    setModalProducto({
      nombre_producto: "", descripcion: "", precio_unitario: 0, stock_disponible: 0, id_categoria: 1, url_imagen: "", esta_activo: "true"
    });
  };

  const guardarProducto = async () => {
    const esNuevo = !modalProducto.id_producto;
    const url = esNuevo ? `${API}/api/producto` : `${API}/api/producto/${modalProducto.id_producto}`;
    const metodo = esNuevo ? "POST" : "PUT";

    try {
      const payload = {
        nombre_producto: modalProducto.nombre_producto, 
        descripcion: modalProducto.descripcion || "Sin descripción", 
        precio_unitario: Number(modalProducto.precio_unitario), 
        stock_disponible: Number(modalProducto.stock_disponible), 
        id_categoria: Number(modalProducto.id_categoria), 
        url_imagen: modalProducto.url_imagen, 
        esta_activo: modalProducto.esta_activo === "true" || modalProducto.esta_activo === true
      };

      const res = await fetch(url, {
        method: metodo, 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
        body: JSON.stringify(payload),
      });

      if (verificarSesion(res.status)) return;
      const data = await res.json(); 
      if (res.ok || data.success) {
        alert(`¡Producto ${esNuevo ? 'creado' : 'actualizado'} con éxito!`);
        setModalProducto(null); 
        cargarProductos(); 
      } else {
        alert("Error del Backend: " + (data.message || data.error || JSON.stringify(data)));
      }
    } catch (error) { alert("Falla de red al guardar el producto."); }
  };

  // ── FUNCIONES DE SOPORTE PQRS ──
  const cargarIncidentes = async () => {
    if (rol !== 0 && rol !== 1 && rol !== 3) return; 
    setCargandoIncidentes(true);
    try {
      const res = await fetch(`${API}/api/incidentes/admin`, { headers: { "Authorization": `Bearer ${token}` } });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (data.success) setIncidentes(data.data);
    } catch (e) { console.error("Error incidentes:", e); } 
    finally { setCargandoIncidentes(false); }
  };

  const responderTicket = async () => {
    try {
      const res = await fetch(`${API}/api/incidentes/${ticketEditando.id_incidente}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ estado: ticketEditando.estado, respuesta: respuestaAdmin })
      });
      const data = await res.json();
      if (data.success) {
        alert("Ticket actualizado y respondido.");
        setTicketEditando(null);
        setRespuestaAdmin("");
        cargarIncidentes();
      } else { alert("Error: " + data.message); }
    } catch (e) { alert("Falla de red al responder."); }
  };

  // ── FUNCIONES DE PEDIDOS ──
  const cargarPedidos = async () => {
    if (rol !== 0 && rol !== 1 && rol !== 2) return; 
    setCargandoPedidos(true);
    try {
      const res = await fetch(`${API}/api/admin/pedidos`, { headers: { "Authorization": `Bearer ${token}` } });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (data.success) setPedidos(data.data);
    } catch (e) { console.error("Error pedidos:", e); } 
    finally { setCargandoPedidos(false); }
  };

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/api/admin/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) {
        cargarPedidos();
      } else {
        alert("Error al actualizar pedido: " + data.message);
      }
    } catch (error) {
      alert("Error de red al actualizar estado del pedido.");
    }
  };

  // ── EFECTO DE SINCRONIZACIÓN DE PESTAÑAS ──
  useEffect(() => { 
    if (tabActiva === 'usuarios') cargarUsuarios();
    if (tabActiva === 'inventario') cargarProductos();
    if (tabActiva === 'soporte') cargarIncidentes();
    if (tabActiva === 'pedidos') cargarPedidos();
  }, [tabActiva]);

  return (
    <div className="w-full min-h-screen bg-[var(--color-fondo)] px-6 py-10 font-inherit">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="flex justify-between items-end border-b border-[var(--color-borde)] pb-4">
            <div>
              <h1 className="text-2xl font-black text-[var(--color-texto)] tracking-tight">Centro de Operaciones</h1>
              <p className="text-sm text-[var(--color-texto-suave)] mt-1">Nivel de Acceso: <strong className="text-[var(--color-acento)]">Nivel {rol}</strong></p>
            </div>
          </div>

          <div className="flex gap-4 mt-6 border-b border-[var(--color-borde)] overflow-x-auto">
            {(rol === 0 || rol === 1 || rol === 2) && (
              <button onClick={() => setTabActiva('pedidos')} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${tabActiva === 'pedidos' ? 'border-b-2 border-[var(--color-primario)] text-[var(--color-primario)]' : 'text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]'}`}>
                Gestión de Pedidos
              </button>
            )}
            {(rol === 0 || rol === 1) && (
              <button onClick={() => setTabActiva('usuarios')} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${tabActiva === 'usuarios' ? 'border-b-2 border-[var(--color-primario)] text-[var(--color-primario)]' : 'text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]'}`}>
                Control de Cuentas
              </button>
            )}
            {(rol === 0 || rol === 2) && (
              <button onClick={() => setTabActiva('inventario')} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${tabActiva === 'inventario' ? 'border-b-2 border-[var(--color-primario)] text-[var(--color-primario)]' : 'text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]'}`}>
                Catálogo
              </button>
            )}
            {(rol === 0 || rol === 1 || rol === 3) && (
              <button onClick={() => setTabActiva('soporte')} className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${tabActiva === 'soporte' ? 'border-b-2 border-[var(--color-primario)] text-[var(--color-primario)]' : 'text-[var(--color-texto-suave)] hover:text-[var(--color-texto)]'}`}>
                Soporte PQRS
              </button>
            )}
          </div>
        </div>

        {/* ── CONTENIDO: GESTIÓN DE PEDIDOS ── */}
        {tabActiva === 'pedidos' && (
          <div className="bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] shadow-sm overflow-hidden">
            {cargandoPedidos ? <div className="p-10 text-center text-sm animate-pulse">Sincronizando pedidos...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-secundario-soft)] text-xs uppercase border-b border-[var(--color-borde)]">
                    <th className="p-4 font-bold">Pedido</th>
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold text-center">Estado de Entrega</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {pedidos.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">No hay pedidos registrados en el sistema.</td></tr>
                  ) : pedidos.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-fondo)]">
                      <td className="p-4 font-medium">#{p.id} <br/><span className="text-[10px] text-gray-400">{new Date(p.fecha).toLocaleString()}</span></td>
                      <td className="p-4">{p.nombre} {p.apellido}<br/><span className="text-[10px] text-[var(--color-texto-suave)]">{p.email}</span></td>
                      <td className="p-4 font-bold text-[var(--color-texto)]">${Number(p.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <select 
                          value={p.estado} 
                          onChange={(e) => cambiarEstadoPedido(p.id, e.target.value)}
                          className={`text-xs font-bold outline-none cursor-pointer px-3 py-1.5 rounded-lg border border-[var(--color-borde)] ${p.estado === 'Completado' ? 'bg-yellow-50 text-yellow-700' : p.estado === 'Entregado' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
                        >
                          <option value="Completado">Completado (Pago Recibido)</option>
                          <option value="Procesado">Procesado (En preparación)</option>
                          <option value="Enviado">Enviado (En camino)</option>
                          <option value="Entregado">Entregado al Cliente</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ... (Las demás pestañas: usuarios, inventario, soporte, y sus modales siguen iguales aquí abajo) */}
        {/* TABLA DE USUARIOS */}
        {tabActiva === 'usuarios' && (
          <div className="bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] shadow-sm overflow-hidden">
            {cargandoUsuarios ? <div className="p-10 text-center text-sm animate-pulse">Sincronizando cuentas...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-secundario-soft)] text-xs uppercase border-b border-[var(--color-borde)]">
                    <th className="p-4 font-bold">ID</th><th className="p-4 font-bold">Nombre</th><th className="p-4 font-bold">Email</th><th className="p-4 font-bold">Nivel</th><th className="p-4 font-bold">Estado</th><th className="p-4 font-bold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {usuarios.map((u) => (
                    <tr key={u.id_usuario} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-fondo)]">
                      <td className="p-4">#{u.id_usuario}</td><td className="p-4">{u.nombre} {u.apellido}</td><td className="p-4">{u.email}</td><td className="p-4">Rol {u.id_rol}</td><td className="p-4">{u.estado}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => setUsuarioEditando({ ...u })} className="bg-[var(--color-secundario)] hover:bg-[var(--color-acento)] hover:text-white text-[var(--color-texto)] border border-[var(--color-borde)] text-xs font-bold px-4 py-1.5 rounded transition-colors">Modificar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TABLA DE INVENTARIO */}
        {tabActiva === 'inventario' && (
          <div className="bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] shadow-sm overflow-hidden">
             <div className="p-4 border-b border-[var(--color-borde)] flex justify-between items-center bg-[var(--color-fondo)]">
                <h3 className="font-bold text-[var(--color-texto)] text-sm uppercase">Catálogo Interno</h3>
                <button onClick={abrirModalNuevo} className="bg-[var(--color-acento)] text-white px-4 py-2 rounded text-xs font-bold shadow-sm hover:bg-blue-600 transition-colors">+ Registar Producto</button>
             </div>
            {cargandoProductos ? <div className="p-10 text-center text-sm animate-pulse">Sincronizando catálogo...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-secundario-soft)] text-xs uppercase border-b border-[var(--color-borde)]">
                    <th className="p-4 font-bold">Ref</th><th className="p-4 font-bold">Producto</th><th className="p-4 font-bold">Precio</th><th className="p-4 font-bold">Stock</th><th className="p-4 font-bold">Estado</th><th className="p-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {productos.map((p) => (
                    <tr key={p.id_producto} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-fondo)]">
                      <td className="p-4 font-medium text-gray-500">#{p.id_producto}</td><td className="p-4 font-semibold text-[var(--color-texto)]">{p.nombre_producto}</td><td className="p-4">${p.precio_unitario}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.stock_disponible > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock_disponible} unds.</span></td>
                      <td className="p-4">{p.esta_activo ? 'Público' : 'Oculto'}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => setModalProducto({ ...p, esta_activo: p.esta_activo ? "true" : "false" })} className="text-[var(--color-acento)] hover:underline text-xs font-bold">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TABLA DE SOPORTE */}
        {tabActiva === 'soporte' && (
          <div className="bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] shadow-sm overflow-hidden">
            {cargandoIncidentes ? <div className="p-10 text-center text-sm animate-pulse">Cargando tickets...</div> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-secundario-soft)] text-xs uppercase border-b border-[var(--color-borde)]">
                    <th className="p-4 font-bold">Ticket</th><th className="p-4 font-bold">Cliente</th><th className="p-4 font-bold">Asunto</th><th className="p-4 font-bold">Estado</th><th className="p-4 font-bold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {incidentes.map((t) => (
                    <tr key={t.id_incidente} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-fondo)]">
                      <td className="p-4 font-medium">#{t.id_incidente}</td>
                      <td className="p-4">{t.nombre} {t.apellido}</td>
                      <td className="p-4"><span className="font-bold">{t.asunto}</span></td>
                      <td className="p-4"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-100">{t.estado}</span></td>
                      <td className="p-4 text-center"><button onClick={() => { setTicketEditando({...t}); setRespuestaAdmin(t.respuesta || ""); }} className="text-[var(--color-acento)] hover:underline text-xs font-bold">Gestionar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MODAL GESTIONAR TICKET */}
        {ticketEditando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[var(--color-superficie)] w-full max-w-lg rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
                <h3 className="text-lg font-bold mb-2 border-b pb-3">Ticket #{ticketEditando.id_incidente}</h3>
                <div className="overflow-y-auto space-y-4 mb-4">
                  <div className="bg-[var(--color-fondo)] p-3 rounded-lg"><p className="text-xs">Mensaje:</p><p className="text-sm font-medium">{ticketEditando.mensaje}</p></div>
                  <div><label className="text-xs font-bold">Cambiar Estado</label><select value={ticketEditando.estado} onChange={(e) => setTicketEditando({ ...ticketEditando, estado: e.target.value })} className="w-full mt-1 p-2 border rounded-lg"><option value="Abierto">Abierto</option><option value="En Revisión">En Revisión</option><option value="Cerrado">Cerrado</option></select></div>
                  <div><label className="text-xs font-bold">Respuesta Oficial</label><textarea rows="4" value={respuestaAdmin} onChange={(e) => setRespuestaAdmin(e.target.value)} className="w-full mt-1 p-2 border rounded-lg resize-none"></textarea></div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button onClick={responderTicket} className="flex-1 bg-[var(--color-acento)] text-white font-bold py-2.5 rounded-lg text-sm">Guardar y Responder</button>
                  <button onClick={() => setTicketEditando(null)} className="flex-1 border font-bold py-2.5 rounded-lg text-sm">Cancelar</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL USUARIOS */}
        {usuarioEditando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[var(--color-superficie)] w-full max-w-md rounded-xl p-6">
                <h3 className="text-lg font-bold mb-5 border-b pb-3">Modificar Registro #{usuarioEditando.id_usuario}</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Nombre</label><input value={usuarioEditando.nombre} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })} className="p-2 border rounded-lg" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Apellido</label><input value={usuarioEditando.apellido} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, apellido: e.target.value })} className="p-2 border rounded-lg" /></div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold">Email</label><input type="email" value={usuarioEditando.email} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })} className="p-2 border rounded-lg" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Rol</label><select value={usuarioEditando.id_rol || usuarioEditando.rol} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, id_rol: e.target.value, rol: e.target.value })} className="p-2 border rounded-lg"><option value={0}>Dev</option><option value={1}>Admin</option><option value={2}>Inventario</option><option value={3}>Incidentes</option><option value={7}>Cliente</option></select></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Estado</label><select value={usuarioEditando.estado} onChange={(e) => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })} className="p-2 border rounded-lg"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={actualizarUsuario} className="flex-1 bg-[var(--color-primario)] text-white font-bold py-2 rounded-lg text-sm">Guardar Cambios</button>
                  <button onClick={() => setUsuarioEditando(null)} className="flex-1 border font-bold py-2 rounded-lg text-sm">Cancelar</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL PRODUCTO */}
        {modalProducto && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-[var(--color-superficie)] w-full max-w-lg rounded-xl p-6">
                <h3 className="text-lg font-bold mb-5 border-b pb-3">{modalProducto.id_producto ? `Editar Producto` : 'Registrar Nuevo'}</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex flex-col gap-1"><label className="text-xs font-bold">Nombre</label><input value={modalProducto.nombre_producto} onChange={(e) => setModalProducto({ ...modalProducto, nombre_producto: e.target.value })} className="p-2 border rounded-lg text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Categoría</label><select value={modalProducto.id_categoria} onChange={(e) => setModalProducto({ ...modalProducto, id_categoria: e.target.value })} className="p-2 border rounded-lg text-sm"><option value={1}>Helados</option><option value={2}>Bebidas</option><option value={3}>Postres</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Precio (COP)</label><input type="number" min="0" value={modalProducto.precio_unitario} onChange={(e) => setModalProducto({ ...modalProducto, precio_unitario: e.target.value })} className="p-2 border rounded-lg text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Stock</label><input type="number" min="0" value={modalProducto.stock_disponible} onChange={(e) => setModalProducto({ ...modalProducto, stock_disponible: e.target.value })} className="p-2 border rounded-lg text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 flex flex-col gap-1"><label className="text-xs font-bold">URL Imagen</label><input type="text" value={modalProducto.url_imagen} onChange={(e) => setModalProducto({ ...modalProducto, url_imagen: e.target.value })} className="p-2 border rounded-lg text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold">Estado</label><select value={modalProducto.esta_activo} onChange={(e) => setModalProducto({ ...modalProducto, esta_activo: e.target.value })} className="p-2 border rounded-lg text-sm"><option value="true">Público</option><option value="false">Oculto</option></select></div>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={guardarProducto} className="flex-1 bg-[var(--color-acento)] text-white font-bold py-2 rounded-lg text-sm">Guardar Producto</button>
                  <button onClick={() => setModalProducto(null)} className="flex-1 border font-bold py-2 rounded-lg text-sm">Cancelar</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}