package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VentaDTO {
    private Long id;
    private Long compradorId;
    private Long procesadoPorId; // Será null si la venta es 100% online
    private BigDecimal total;
    private LocalDateTime fecha;
    private String estado;
    private String cedulaComprador;
    private String metodoPago;
    private String referenciaPago;
}