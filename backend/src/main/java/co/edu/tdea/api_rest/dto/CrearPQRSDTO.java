package co.edu.tdea.api_rest.dto;

import lombok.Data;

// DTO de entrada para POST /api/pqrs.
// estado y fechaCreacion los asigna la DB con DEFAULT — no se reciben aquí.
// respuesta y fechaRespuesta nacen null — tampoco se reciben al crear.
@Data
public class CrearPQRSDTO {
    private Long usuarioId;
    private Long ventaId;       // Opcional — puede enviarse null
    private String asunto;
    private String mensaje;
}