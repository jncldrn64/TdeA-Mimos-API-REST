package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CrearUsuarioDTO;
import co.edu.tdea.api_rest.dto.UsuarioDTO;
import co.edu.tdea.api_rest.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // GET /api/usuarios — devuelve todos los usuarios (sin password_hash)
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // GET /api/usuarios/3 — devuelve el usuario con id = 3
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/usuarios — registra un nuevo usuario
    // Ejemplo de JSON a enviar:
    // {
    //   "nombre": "Juan",
    //   "apellido": "Pérez",
    //   "email": "juan@mimos.co",
    //   "password": "miClave123",
    //   "idRol": 2
    // }
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearUsuarioDTO datos) {
        try {
            UsuarioDTO creado = usuarioService.crear(datos);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            // Devuelve 400 Bad Request con el mensaje de error como texto
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/usuarios/3 — elimina el usuario con id = 3
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}