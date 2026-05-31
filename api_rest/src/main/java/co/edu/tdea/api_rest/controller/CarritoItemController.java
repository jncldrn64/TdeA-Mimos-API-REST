package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CarritoItemDTO;
import co.edu.tdea.api_rest.entity.CarritoItem;
import co.edu.tdea.api_rest.service.CarritoItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito-items")
@RequiredArgsConstructor
public class CarritoItemController {

    private final CarritoItemService carritoItemService;

    // Obtener todos los artículos de un carrito específico
    @GetMapping("/carrito/{idCarrito}")
    public ResponseEntity<List<CarritoItemDTO>> listarPorCarrito(@PathVariable Long idCarrito) {
        return ResponseEntity.ok(carritoItemService.listarPorCarrito(idCarrito));
    }

    // Agregar un artículo al carrito
    @PostMapping
    public ResponseEntity<CarritoItemDTO> agregarItem(@RequestBody CarritoItem item) {
        CarritoItemDTO creado = carritoItemService.agregarItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // Eliminar un artículo del carrito
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarItem(@PathVariable Long id) {
        carritoItemService.eliminarItem(id);
        return ResponseEntity.noContent().build();
    }
}
