package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.CrearEnvioDTO;
import co.edu.tdea.api_rest.dto.EnvioDTO;
import co.edu.tdea.api_rest.service.EnvioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/envios")
@RequiredArgsConstructor
public class EnvioController {

    private final EnvioService envioService;

    // GET /api/envios — lista todos los envíos
    @GetMapping
    public ResponseEntity<List<EnvioDTO>> listarTodos() {
        return ResponseEntity.ok(envioService.listarTodos());
    }

    // GET /api/envios/1
    @GetMapping("/{id}")
    public ResponseEntity<EnvioDTO> buscarPorId(@PathVariable Long id) {
        return envioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/envios/venta/3 — envío asociado a la venta con id = 3
    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<EnvioDTO> buscarPorVenta(@PathVariable Long ventaId) {
        return envioService.buscarPorVenta(ventaId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/envios/estado/preparando — filtra por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<EnvioDTO>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(envioService.listarPorEstado(estado));
    }

    // POST /api/envios
    // JSON de prueba (Postman o WriteAllText):
    // {
    //   "ventaId": 1,
    //   "direccion": "Calle 50 # 10-20",
    //   "ciudad": "Medellín",
    //   "fechaEntregaEstimada": null
    // }
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearEnvioDTO datos) {
        try {
            EnvioDTO creado = envioService.crear(datos);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/envios/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        envioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}