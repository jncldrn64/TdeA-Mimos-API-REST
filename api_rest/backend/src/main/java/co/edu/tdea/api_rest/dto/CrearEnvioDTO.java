package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.time.LocalDateTime;

// DTO de entrada para POST /api/envios.
// estadoEnvio lo asigna la DB con DEFAULT 'preparando' — no se recibe aquí.
// idEnvio lo genera la DB — tampoco se recibe.
@Data
public class CrearEnvioDTO {
    private Long ventaId;
    private String direccion;
    private String ciudad;
    private LocalDateTime fechaEntregaEstimada;  // Puede enviarse null al crear
}