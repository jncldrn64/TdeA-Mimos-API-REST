package co.edu.tdea.api_rest.dto;

import lombok.Data;

// DTO de entrada para POST /api/usuarios
// Solo los campos que el cliente debe enviar.
// id_usuario, estado y created_at los asigna la DB automáticamente.
@Data
public class CrearUsuarioDTO {
    private String nombre;
    private String apellido;
    private String email;
    private String password;    // Contraseña en texto plano — el Service la encripta
    private Long idRol;         // El cliente envía el ID del rol, no el objeto completo
}