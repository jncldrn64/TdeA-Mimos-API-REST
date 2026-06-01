package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CarritoItemDTO {
    private Long idItem;
    private Long idCarrito;
    private Long idProducto;
    private Integer cantidad;
    private BigDecimal precioSnapshot;
}