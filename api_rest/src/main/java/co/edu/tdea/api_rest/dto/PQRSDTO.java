package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.time.LocalDateTime;

// DTO de salida. Usuario y Venta se exponen solo como IDs,
// no como objetos completos, para mantener la respuesta limpia.
@Data
public class PQRSDTO {
    private Long idPqrs;
    private Long usuarioId;
    private Long ventaId;           // Puede ser null si no está ligada a una venta
    private String asunto;
    private String mensaje;
    private String estado;
    private LocalDateTime fechaCreacion;
    private String respuesta;       // Null hasta que el admin responda
    private LocalDateTime fechaRespuesta;
}