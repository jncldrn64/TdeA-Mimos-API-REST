package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.time.LocalDateTime;

// DTO de salida: muestra el id de la venta como Long,
// no el objeto Venta completo, para mantener la respuesta limpia.
@Data
public class EnvioDTO {
    private Long idEnvio;
    private Long ventaId;       // Solo el ID de la venta, no el objeto completo
    private String direccion;
    private String ciudad;
    private String estadoEnvio;
    private LocalDateTime fechaDespacho;
    private LocalDateTime fechaEntregaEstimada;
    private LocalDateTime fechaEntregaReal;
}