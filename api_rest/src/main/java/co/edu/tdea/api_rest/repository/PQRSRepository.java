package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.PQRS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PQRSRepository extends JpaRepository<PQRS, Long> {

    // Todas las PQRS de un usuario específico
    // SQL generado: SELECT * FROM PQRS WHERE usuario_id = ?
    List<PQRS> findByUsuario_IdUsuario(Long idUsuario);

    // Filtra por estado: 'abierto', 'cerrado', etc.
    List<PQRS> findByEstado(String estado);

    // Todas las PQRS asociadas a una venta específica
    List<PQRS> findByVenta_Id(Long ventaId);
}