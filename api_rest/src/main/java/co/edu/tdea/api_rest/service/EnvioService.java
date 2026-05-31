package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CrearEnvioDTO;
import co.edu.tdea.api_rest.dto.EnvioDTO;
import co.edu.tdea.api_rest.entity.Envio;
import co.edu.tdea.api_rest.entity.Venta;
import co.edu.tdea.api_rest.repository.EnvioRepository;
import co.edu.tdea.api_rest.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnvioService {

    private final EnvioRepository envioRepository;
    private final VentaRepository ventaRepository;

    private EnvioDTO toDTO(Envio e) {
        EnvioDTO dto = new EnvioDTO();
        dto.setIdEnvio(e.getIdEnvio());
        dto.setVentaId(e.getVenta().getId());   // Extraemos solo el ID de la venta
        dto.setDireccion(e.getDireccion());
        dto.setCiudad(e.getCiudad());
        dto.setEstadoEnvio(e.getEstadoEnvio());
        dto.setFechaDespacho(e.getFechaDespacho());
        dto.setFechaEntregaEstimada(e.getFechaEntregaEstimada());
        dto.setFechaEntregaReal(e.getFechaEntregaReal());
        return dto;
    }

    public List<EnvioDTO> listarTodos() {
        return envioRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EnvioDTO> buscarPorId(Long id) {
        return envioRepository.findById(id).map(this::toDTO);
    }

    // Busca el envío asociado a una venta específica
    public Optional<EnvioDTO> buscarPorVenta(Long ventaId) {
        return envioRepository.findByVenta_Id(ventaId).map(this::toDTO);
    }

    // Filtra envíos por estado: 'preparando', 'despachado', 'entregado'
    public List<EnvioDTO> listarPorEstado(String estado) {
        return envioRepository.findByEstadoEnvio(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EnvioDTO crear(CrearEnvioDTO datos) {
        // Regla de negocio: la venta debe existir
        Venta venta = ventaRepository.findById(datos.getVentaId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Venta no encontrada con id: " + datos.getVentaId()));

        // Regla de negocio: una venta no puede tener dos envíos
        if (envioRepository.findByVenta_Id(datos.getVentaId()).isPresent()) {
            throw new IllegalArgumentException(
                    "Ya existe un envío registrado para la venta id: " + datos.getVentaId());
        }

        Envio nuevo = new Envio();
        nuevo.setVenta(venta);
        nuevo.setDireccion(datos.getDireccion());
        nuevo.setCiudad(datos.getCiudad());
        nuevo.setFechaEntregaEstimada(datos.getFechaEntregaEstimada());
        // fechaDespacho y fechaEntregaReal nacen null — se actualizan después

        return toDTO(envioRepository.save(nuevo));
    }

    public void eliminar(Long id) {
        envioRepository.deleteById(id);
    }
}