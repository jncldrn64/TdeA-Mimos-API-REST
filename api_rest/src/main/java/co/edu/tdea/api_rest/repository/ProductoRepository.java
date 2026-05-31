package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Busca todos los productos de una categoría específica.
    // Spring genera el SQL: SELECT * FROM Productos WHERE id_categoria = ?
    List<Producto> findByCategoria_IdCategoria(Long idCategoria);

    // Busca solo los productos activos (esta_activo = 1).
    // Útil para el catálogo público — no mostrar productos dados de baja.
    List<Producto> findByEstaActivoTrue();
}