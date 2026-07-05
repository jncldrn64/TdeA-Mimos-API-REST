package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.VentaDTO;
import co.edu.tdea.api_rest.entity.Venta;
import co.edu.tdea.api_rest.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;

    private VentaDTO toDTO(Venta venta) {
        VentaDTO dto = new VentaDTO();
        dto.setId(venta.getId());
        dto.setCompradorId(venta.getComprador().getIdUsuario());
        
        if (venta.getProcesadoPor() != null) {
            dto.setProcesadoPorId(venta.getProcesadoPor().getIdUsuario());
        }
        
        dto.setTotal(venta.getTotal());
        dto.setFecha(venta.getFecha());
        dto.setEstado(venta.getEstado());
        dto.setCedulaComprador(venta.getCedulaComprador());
        dto.setMetodoPago(venta.getMetodoPago());
        dto.setReferenciaPago(venta.getReferenciaPago());
        return dto;
    }

    public List<VentaDTO> listarTodas() {
        return ventaRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<VentaDTO> buscarPorId(Long id) {
        return ventaRepository.findById(id).map(this::toDTO);
    }

    public VentaDTO crear(Venta venta) {
        Venta guardada = ventaRepository.save(venta);
        return toDTO(guardada);
    }
}