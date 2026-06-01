package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CrearPQRSDTO;
import co.edu.tdea.api_rest.dto.PQRSDTO;
import co.edu.tdea.api_rest.entity.PQRS;
import co.edu.tdea.api_rest.entity.Usuario;
import co.edu.tdea.api_rest.entity.Venta;
import co.edu.tdea.api_rest.repository.PQRSRepository;
import co.edu.tdea.api_rest.repository.UsuarioRepository;
import co.edu.tdea.api_rest.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PQRSService {

    private final PQRSRepository pqrsRepository;
    private final UsuarioRepository usuarioRepository;
    private final VentaRepository ventaRepository;

    private PQRSDTO toDTO(PQRS p) {
        PQRSDTO dto = new PQRSDTO();
        dto.setIdPqrs(p.getIdPqrs());
        dto.setUsuarioId(p.getUsuario().getIdUsuario());
        dto.setAsunto(p.getAsunto());
        dto.setMensaje(p.getMensaje());
        dto.setEstado(p.getEstado());
        dto.setFechaCreacion(p.getFechaCreacion());
        dto.setRespuesta(p.getRespuesta());
        dto.setFechaRespuesta(p.getFechaRespuesta());

        // ventaId es opcional — solo lo mapeamos si existe
        if (p.getVenta() != null) {
            dto.setVentaId(p.getVenta().getId());
        }
        return dto;
    }

    public List<PQRSDTO> listarTodos() {
        return pqrsRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<PQRSDTO> buscarPorId(Long id) {
        return pqrsRepository.findById(id).map(this::toDTO);
    }

    public List<PQRSDTO> listarPorUsuario(Long usuarioId) {
        return pqrsRepository.findByUsuario_IdUsuario(usuarioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PQRSDTO> listarPorEstado(String estado) {
        return pqrsRepository.findByEstado(estado)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PQRSDTO> listarPorVenta(Long ventaId) {
        return pqrsRepository.findByVenta_Id(ventaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PQRSDTO crear(CrearPQRSDTO datos) {
        // Regla de negocio: el usuario debe existir
        Usuario usuario = usuarioRepository.findById(datos.getUsuarioId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado con id: " + datos.getUsuarioId()));

        // Regla de negocio: si se envía ventaId, la venta debe existir
        Venta venta = null;
        if (datos.getVentaId() != null) {
            venta = ventaRepository.findById(datos.getVentaId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Venta no encontrada con id: " + datos.getVentaId()));
        }

        PQRS nueva = new PQRS();
        nueva.setUsuario(usuario);
        nueva.setVenta(venta);
        nueva.setAsunto(datos.getAsunto());
        nueva.setMensaje(datos.getMensaje());

        return toDTO(pqrsRepository.save(nueva));
    }

    public void eliminar(Long id) {
        pqrsRepository.deleteById(id);
    }
}