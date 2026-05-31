package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Spring genera la consulta SQL de este método automáticamente a partir
    // del nombre: "findBy" + "Email" → SELECT * FROM Usuarios WHERE email = ?
    // Lo necesitamos para verificar si un email ya existe antes de registrar.
    Optional<Usuario> findByEmail(String email);
}