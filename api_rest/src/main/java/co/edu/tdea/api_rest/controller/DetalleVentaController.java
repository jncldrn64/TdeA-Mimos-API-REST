package co.edu.tdea.api_rest.controller;

import co.edu.tdea.api_rest.dto.DetalleVentaDTO;
import co.edu.tdea.api_rest.entity.DetalleVenta;
import co.edu.tdea.api_rest.service.DetalleVentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalle-ventas")
@RequiredArgsConstructor
public class DetalleVentaController {

    private final DetalleVentaService detalleVentaService;

    @GetMapping("/venta/{idVenta}")
    public ResponseEntity<List<DetalleVentaDTO>> listarPorVenta(@PathVariable Long idVenta) {
        return ResponseEntity.ok(detalleVentaService.listarPorVenta(idVenta));
    }

    @PostMapping
    public ResponseEntity<DetalleVentaDTO> agregarDetalle(@RequestBody DetalleVenta detalle) {
        DetalleVentaDTO creado = detalleVentaService.agregarDetalle(detalle);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}