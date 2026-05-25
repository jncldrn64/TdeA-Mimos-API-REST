import {
    listarProductosActivos,
    listarProductosTodos,
    buscarProductos,
    obtenerProductoPorId,
    insertarProducto,
    actualizarProducto,
    actualizarStock,
    desactivarProducto,
    activarProducto
} from '../model/ProductoModel.js';

// GET /api/producto — catálogo público (solo activos)
const getProductos = async (req, res) => {
    try {
        const { buscar } = req.query;
        const productos = buscar
            ? await buscarProductos(buscar)
            : await listarProductosActivos();
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
    }
};

// GET /api/producto/admin — todos (admin)
const getProductosAdmin = async (req, res) => {
    try {
        const productos = await listarProductosTodos();
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener productos', error: error.message });
    }
};

// GET /api/producto/:id
const getProductoPorId = async (req, res) => {
    try {
        const producto = await obtenerProductoPorId(Number(req.params.id));
        if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.status(200).json({ success: true, data: producto });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener producto', error: error.message });
    }
};

// POST /api/producto — crear (admin)
const postProducto = async (req, res) => {
    try {
        // Mapeamos exactamente lo que envía React
        const { nombre_producto, descripcion, precio_unitario, stock_disponible, url_imagen, esta_activo } = req.body;

        if (!nombre_producto || nombre_producto.trim() === '')
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        if (!precio_unitario || Number(precio_unitario) <= 0)
            return res.status(400).json({ success: false, message: 'El precio debe ser mayor a 0' });
        if (stock_disponible !== undefined && Number(stock_disponible) < 0)
            return res.status(400).json({ success: false, message: 'El stock no puede ser negativo' });

        // Adaptamos los nombres para el Model que ya tenías
        const productoData = {
            nombre_producto,
            descripcion_detallada: descripcion,
            precio_unitario,
            stock_disponible: Number(stock_disponible) || 0,
            url_imagen
        };

        const nuevo = await insertarProducto(productoData);

        // Si desde la creación se marcó como oculto, lo desactivamos
        if (esta_activo === false || esta_activo === "false") {
            await desactivarProducto(nuevo.id_producto);
        }

        res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: nuevo });
    } catch (error) {
        const msg = error.message?.includes('Ya existe') ? error.message : 'Error al crear producto';
        res.status(500).json({ success: false, message: msg, error: error.message });
    }
};

// PUT /api/producto/:id — actualizar datos (admin)
const putProducto = async (req, res) => {
    try {
        const { nombre_producto, descripcion, precio_unitario, stock_disponible, url_imagen, esta_activo } = req.body;
        const id = Number(req.params.id);

        if (!nombre_producto || !precio_unitario)
            return res.status(400).json({ success: false, message: 'Nombre y precio son obligatorios' });
        if (Number(precio_unitario) <= 0)
            return res.status(400).json({ success: false, message: 'El precio debe ser mayor a 0' });

        // 1. Actualizamos datos principales
        await actualizarProducto(id, {
            nombre_producto,
            descripcion_detallada: descripcion,
            precio_unitario,
            url_imagen
        });

        // 2. Actualizamos el stock usando tu función existente
        if (stock_disponible !== undefined) {
            await actualizarStock(id, Number(stock_disponible));
        }

        // 3. Sincronizamos el estado (Público/Oculto)
        if (esta_activo !== undefined) {
            if (esta_activo === true || esta_activo === "true") {
                await activarProducto(id);
            } else {
                await desactivarProducto(id);
            }
        }

        res.status(200).json({ success: true, message: 'Producto actualizado con éxito' });
    } catch (error) {
        const msg = error.message?.includes('Ya existe') ? error.message : 'Error al actualizar producto';
        res.status(500).json({ success: false, message: msg, error: error.message });
    }
};

// PATCH /api/producto/:id/stock — actualizar solo el stock (admin)
const patchStock = async (req, res) => {
    try {
        const { nuevo_stock } = req.body;
        if (nuevo_stock === undefined || Number(nuevo_stock) < 0)
            return res.status(400).json({ success: false, message: 'El stock no puede ser negativo' });
        await actualizarStock(Number(req.params.id), Number(nuevo_stock));
        res.status(200).json({ success: true, message: 'Stock actualizado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar stock', error: error.message });
    }
};

// PATCH /api/producto/:id/desactivar — soft delete (admin)
const patchDesactivar = async (req, res) => {
    try {
        await desactivarProducto(Number(req.params.id));
        res.status(200).json({ success: true, message: 'Producto desactivado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al desactivar', error: error.message });
    }
};

// PATCH /api/producto/:id/activar — reactivar (admin)
const patchActivar = async (req, res) => {
    try {
        await activarProducto(Number(req.params.id));
        res.status(200).json({ success: true, message: 'Producto activado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al activar', error: error.message });
    }
};

export {
    getProductos, getProductosAdmin, getProductoPorId,
    postProducto, putProducto,
    patchStock, patchDesactivar, patchActivar
};