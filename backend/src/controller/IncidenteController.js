import * as IncidenteModel from '../model/IncidenteModel.js';

export const crearTicket = async (req, res) => {
    try {
        const usuario_id = req.usuario.id || req.usuario.id_usuario || req.usuario.sub;
        const { venta_id, asunto, mensaje } = req.body;

        if (!asunto || !mensaje) {
            return res.status(400).json({ success: false, message: 'Asunto y mensaje son obligatorios' });
        }

        const nuevoTicket = await IncidenteModel.crearIncidente({ usuario_id, venta_id, asunto, mensaje });
        res.status(201).json({ success: true, message: 'Incidente reportado con éxito', data: nuevoTicket });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear incidente', error: error.message });
    }
};

export const obtenerMisTickets = async (req, res) => {
    try {
        const usuario_id = req.usuario.id || req.usuario.id_usuario || req.usuario.sub;
        const tickets = await IncidenteModel.listarIncidentesUsuario(usuario_id);
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener incidentes', error: error.message });
    }
};

export const obtenerTodosTicketsAdmin = async (req, res) => {
    try {
        const tickets = await IncidenteModel.listarTodosIncidentes();
        res.status(200).json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener todos los incidentes', error: error.message });
    }
};

export const actualizarTicket = async (req, res) => {
    try {
        const { id_incidente } = req.params;
        const { estado, respuesta } = req.body;

        if (!estado) return res.status(400).json({ success: false, message: 'El estado es obligatorio' });

        await IncidenteModel.actualizarEstadoIncidente(id_incidente, estado, respuesta);
        res.status(200).json({ success: true, message: 'Ticket actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar incidente', error: error.message });
    }
};