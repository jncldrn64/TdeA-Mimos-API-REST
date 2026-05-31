package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CrearUsuarioDTO;
import co.edu.tdea.api_rest.dto.UsuarioDTO;
import co.edu.tdea.api_rest.entity.Rol;
import co.edu.tdea.api_rest.entity.Usuario;
import co.edu.tdea.api_rest.repository.RolRepository;
import co.edu.tdea.api_rest.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    // BCrypt es el algoritmo estándar para encriptar contraseñas.
    // Transforma "miPassword123" en algo como "$2a$10$xK9..." de forma
    // irreversible. Si la DB es comprometida, las contraseñas no se exponen.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Convierte la entidad interna a DTO de salida.
    // Nota: rol.getNombre() accede al objeto Rol cargado por la FK.
    private UsuarioDTO toDTO(Usuario u) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(u.getIdUsuario());
        dto.setNombre(u.getNombre());
        dto.setApellido(u.getApellido());
        dto.setEmail(u.getEmail());
        dto.setRol(u.getRol().getNombre());   // Solo el nombre, no el objeto completo
        dto.setEstado(u.getEstado());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<UsuarioDTO> buscarPorId(Long id) {
        return usuarioRepository.findById(id).map(this::toDTO);
    }

    public UsuarioDTO crear(CrearUsuarioDTO datos) {
        // Regla de negocio 1: el email debe ser único.
        if (usuarioRepository.findByEmail(datos.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado: " + datos.getEmail());
        }

        // Regla de negocio 2: el rol indicado debe existir en la DB.
        Rol rol = rolRepository.findById(datos.getIdRol())
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con id: " + datos.getIdRol()));

        // Construimos la entidad a guardar
        Usuario nuevo = new Usuario();
        nuevo.setNombre(datos.getNombre());
        nuevo.setApellido(datos.getApellido());
        nuevo.setEmail(datos.getEmail());
        nuevo.setRol(rol);

        // La contraseña se guarda encriptada — NUNCA en texto plano
        nuevo.setPasswordHash(passwordEncoder.encode(datos.getPassword()));

        Usuario guardado = usuarioRepository.save(nuevo);
        return toDTO(guardado);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}