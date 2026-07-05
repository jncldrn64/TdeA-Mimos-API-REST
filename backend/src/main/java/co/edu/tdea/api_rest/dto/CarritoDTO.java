package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CarritoDTO {
    private Long idCarrito;
    private Long usuarioId;
    private LocalDateTime creadoAt;
}