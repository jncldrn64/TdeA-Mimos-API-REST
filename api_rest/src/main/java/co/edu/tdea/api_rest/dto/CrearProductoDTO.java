package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO de entrada para POST /api/productos.
// fechaIngreso y estaActivo los asigna la DB sola — no se reciben aquí.
@Data
public class CrearProductoDTO {
    private String nombreProducto;
    private String descripcionDetallada;
    private BigDecimal precioUnitario;
    private Integer stockDisponible;
    private String urlImagen;
    private Long idCategoria;       // El cliente envía el ID, no el objeto completo
    private LocalDateTime fechaUltimoRestock;
}