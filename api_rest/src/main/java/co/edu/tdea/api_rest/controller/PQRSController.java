package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CrearPQRSDTO;
import co.edu.tdea.api_rest.dto.PQRSDTO;
import co.edu.tdea.api_rest.service.PQRSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pqrs")
@RequiredArgsConstructor
public class PQRSController {

    private final PQRSService pqrsService;

    // GET /api/pqrs — lista todas las PQRS (uso admin)
    @GetMapping
    public ResponseEntity<List<PQRSDTO>> listarTodos() {
        return ResponseEntity.ok(pqrsService.listarTodos());
    }

    // GET /api/pqrs/1
    @GetMapping("/{id}")
    public ResponseEntity<PQRSDTO> buscarPorId(@PathVariable Long id) {
        return pqrsService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/pqrs/usuario/1 — todas las PQRS de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PQRSDTO>> listarPorUsuario(
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(pqrsService.listarPorUsuario(usuarioId));
    }

    // GET /api/pqrs/estado/abierto — filtra por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PQRSDTO>> listarPorEstado(
            @PathVariable String estado) {
        return ResponseEntity.ok(pqrsService.listarPorEstado(estado));
    }

    // GET /api/pqrs/venta/1 — PQRS asociadas a una venta
    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<List<PQRSDTO>> listarPorVenta(
            @PathVariable Long ventaId) {
        return ResponseEntity.ok(pqrsService.listarPorVenta(ventaId));
    }

    // POST /api/pqrs
    // JSON sin venta asociada:
    // {"usuarioId":1,"ventaId":null,"asunto":"Problema con mi pedido","mensaje":"El helado llegó derretido"}
    // JSON con venta asociada:
    // {"usuarioId":1,"ventaId":1,"asunto":"Reclamo","mensaje":"No coincide con lo que pedí"}
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearPQRSDTO datos) {
        try {
            PQRSDTO creada = pqrsService.crear(datos);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/pqrs/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pqrsService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}