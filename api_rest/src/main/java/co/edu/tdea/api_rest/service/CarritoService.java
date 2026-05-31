package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CarritoDTO;
import co.edu.tdea.api_rest.entity.Carrito;
import co.edu.tdea.api_rest.repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;

    private CarritoDTO toDTO(Carrito carrito) {
        CarritoDTO dto = new CarritoDTO();
        dto.setIdCarrito(carrito.getIdCarrito());
        dto.setUsuarioId(carrito.getUsuario().getIdUsuario());
        dto.setCreadoAt(carrito.getCreadoAt());
        return dto;
    }

    public List<CarritoDTO> listarTodos() {
        return carritoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<CarritoDTO> buscarPorId(Long id) {
        return carritoRepository.findById(id).map(this::toDTO);
    }

    public CarritoDTO crear(Carrito carrito) {
        Carrito guardado = carritoRepository.save(carrito);
        return toDTO(guardado);
    }

    public void eliminar(Long id) {
        carritoRepository.deleteById(id);
    }
}