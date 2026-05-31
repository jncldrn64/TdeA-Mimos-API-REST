package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CarritoItemDTO;
import co.edu.tdea.api_rest.entity.CarritoItem;
import co.edu.tdea.api_rest.repository.CarritoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoItemService {

    private final CarritoItemRepository carritoItemRepository;

    private CarritoItemDTO toDTO(CarritoItem item) {
        CarritoItemDTO dto = new CarritoItemDTO();
        dto.setIdItem(item.getIdItem());
        dto.setIdCarrito(item.getCarrito().getIdCarrito());
        dto.setIdProducto(item.getProducto().getIdProducto());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioSnapshot(item.getPrecioSnapshot());
        return dto;
    }

    public List<CarritoItemDTO> listarPorCarrito(Long idCarrito) {
        // Filtra los ítems que pertenezcan al id del carrito especificado
        return carritoItemRepository.findAll()
                .stream()
                .filter(item -> item.getCarrito().getIdCarrito().equals(idCarrito))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CarritoItemDTO agregarItem(CarritoItem item) {
        CarritoItem guardado = carritoItemRepository.save(item);
        return toDTO(guardado);
    }

    public void eliminarItem(Long idItem) {
        carritoItemRepository.deleteById(idItem);
    }
}