package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CrearProductoDTO;
import co.edu.tdea.api_rest.dto.ProductoDTO;
import co.edu.tdea.api_rest.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // GET /api/productos — todos los productos (uso admin)
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    // GET /api/productos/activos — solo productos activos (catálogo público)
    @GetMapping("/activos")
    public ResponseEntity<List<ProductoDTO>> listarActivos() {
        return ResponseEntity.ok(productoService.listarActivos());
    }

    // GET /api/productos/categoria/1 — productos de una categoría específica
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<ProductoDTO>> listarPorCategoria(
            @PathVariable Long idCategoria) {
        return ResponseEntity.ok(productoService.listarPorCategoria(idCategoria));
    }

    // GET /api/productos/5
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> buscarPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos
    // Ejemplo de JSON en Postman (Body > raw > JSON):
    // {
    //   "nombreProducto": "Helado de fresa",
    //   "descripcionDetallada": "Helado artesanal con fresas frescas",
    //   "precioUnitario": 8500.00,
    //   "stockDisponible": 50,
    //   "urlImagen": "https://mimos.co/img/fresa.jpg",
    //   "idCategoria": 1,
    //   "fechaUltimoRestock": null
    // }
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearProductoDTO datos) {
        try {
            ProductoDTO creado = productoService.crear(datos);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/productos/5
    // Mismo JSON que el POST, pero ahora actualiza en lugar de crear.
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody CrearProductoDTO datos) {
        try {
            return productoService.actualizar(id, datos)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/productos/5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}