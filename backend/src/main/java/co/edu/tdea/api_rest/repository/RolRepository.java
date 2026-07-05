package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// @Repository le dice a Spring que esta interfaz maneja persistencia de datos.
@Repository

// JpaRepository<Rol, Long>: 
// - Rol: la entidad que maneja.
// - Long: el tipo de dato de la Clave Primaria (id_rol).
public interface RolRepository extends JpaRepository<Rol, Long> {
    // Vacío a propósito. Spring implementa los métodos CRUD automáticamente en tiempo de ejecución.
}