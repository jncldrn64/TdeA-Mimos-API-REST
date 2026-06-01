package co.edu.tdea.api_rest.dto;

import lombok.Data;

@Data
public class CategoriaDTO {
    private Long idCategoria;
    private String nombre;
    private String descripcion;
}