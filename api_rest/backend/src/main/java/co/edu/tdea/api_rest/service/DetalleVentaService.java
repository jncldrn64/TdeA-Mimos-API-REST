package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.DetalleVentaDTO;
import co.edu.tdea.api_rest.entity.DetalleVenta;
import co.edu.tdea.api_rest.repository.DetalleVentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DetalleVentaService {

    private final DetalleVentaRepository detalleVentaRepository;

    private DetalleVentaDTO toDTO(DetalleVenta detalle) {
        DetalleVentaDTO dto = new DetalleVentaDTO();
        dto.setId(detalle.getId());
        dto.setVentaId(detalle.getVenta().getId());
        dto.setProductoId(detalle.getProducto().getIdProducto());
        dto.setCantidad(detalle.getCantidad());
        dto.setPrecioUnitario(detalle.getPrecioUnitario());
        return dto;
    }

    // Busca todos los detalles que pertenecen a una venta específica
    public List<DetalleVentaDTO> listarPorVenta(Long idVenta) {
        return detalleVentaRepository.findAll()
                .stream()
                .filter(d -> d.getVenta().getId().equals(idVenta))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DetalleVentaDTO agregarDetalle(DetalleVenta detalle) {
        DetalleVenta guardado = detalleVentaRepository.save(detalle);
        return toDTO(guardado);
    }
}