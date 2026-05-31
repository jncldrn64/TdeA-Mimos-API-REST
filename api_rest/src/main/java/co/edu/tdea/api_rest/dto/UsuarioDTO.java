package co.edu.tdea.api_rest.dto;

import lombok.Data;
import java.time.LocalDateTime;

// DTO de salida: lo que devuelve la API al exterior.
// Regla de oro: password_hash NUNCA aparece aquí.
// El rol se muestra como texto (nombre), no como objeto anidado completo,
// para mantener la respuesta JSON limpia y simple.
@Data
public class UsuarioDTO {
    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;         // Ej: "ADMIN" o "CLIENTE" — solo el nombre
    private String estado;
    private LocalDateTime createdAt;
}