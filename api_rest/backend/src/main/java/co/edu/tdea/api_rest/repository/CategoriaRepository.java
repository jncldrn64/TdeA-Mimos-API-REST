package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// @Repository indica a Spring que esta interfaz se encarga de los datos
@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // Spring Boot generará la implementación por detrás al compilar.
    // El tipo Long corresponde al idCategoria.
}