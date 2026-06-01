package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO de salida: lo que devuelve la API al exterior.
// La categoría se muestra como texto (nombre), no como objeto anidado.
@Data
public class ProductoDTO {
    private Long idProducto;
    private String nombreProducto;
    private String descripcionDetallada;
    private BigDecimal precioUnitario;
    private Integer stockDisponible;
    private String urlImagen;
    private String categoria;       // Solo el nombre, ej: "Helados"
    private LocalDateTime fechaIngreso;
    private LocalDateTime fechaUltimoRestock;
    private Boolean estaActivo;
}