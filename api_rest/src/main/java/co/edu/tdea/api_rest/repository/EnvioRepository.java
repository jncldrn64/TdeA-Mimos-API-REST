package co.edu.tdea.api_rest.repository;

import co.edu.tdea.api_rest.entity.Envio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Long> {

    // Busca el envío asociado a una venta específica.
    // Una venta tiene como máximo un envío, por eso devuelve Optional.
    Optional<Envio> findByVenta_Id(Long ventaId);

    // Busca todos los envíos en un estado determinado.
    // Útil para que el admin filtre por 'preparando', 'despachado', etc.
    List<Envio> findByEstadoEnvio(String estadoEnvio);
}