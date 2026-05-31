package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CarritoDTO;
import co.edu.tdea.api_rest.entity.Carrito;
import co.edu.tdea.api_rest.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carritos")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<List<CarritoDTO>> listarTodos() {
        return ResponseEntity.ok(carritoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarritoDTO> buscarPorId(@PathVariable Long id) {
        return carritoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CarritoDTO> crear(@RequestBody Carrito carrito) {
        CarritoDTO creado = carritoService.crear(carrito);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        carritoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}