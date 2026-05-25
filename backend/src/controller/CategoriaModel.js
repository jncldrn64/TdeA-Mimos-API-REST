import { listarCategorias } from '../model/CategoriaModel.js';

export const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await listarCategorias();
        res.status(200).json({ success: true, data: categorias });
    } catch (error) {
        console.error("Error en Categorías:", error);
        res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
};