package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CrearProductoDTO;
import co.edu.tdea.api_rest.dto.ProductoDTO;
import co.edu.tdea.api_rest.entity.Categoria;
import co.edu.tdea.api_rest.entity.Producto;
import co.edu.tdea.api_rest.repository.CategoriaRepository;
import co.edu.tdea.api_rest.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    private ProductoDTO toDTO(Producto p) {
        ProductoDTO dto = new ProductoDTO();
        dto.setIdProducto(p.getIdProducto());
        dto.setNombreProducto(p.getNombreProducto());
        dto.setDescripcionDetallada(p.getDescripcionDetallada());
        dto.setPrecioUnitario(p.getPrecioUnitario());
        dto.setStockDisponible(p.getStockDisponible());
        dto.setUrlImagen(p.getUrlImagen());
        dto.setFechaIngreso(p.getFechaIngreso());
        dto.setFechaUltimoRestock(p.getFechaUltimoRestock());
        dto.setEstaActivo(p.getEstaActivo());

        // Si el producto tiene categoría asignada, mostramos su nombre.
        // Si es null (producto sin categoría), dejamos el campo en null.
        if (p.getCategoria() != null) {
            dto.setCategoria(p.getCategoria().getNombre());
        }
        return dto;
    }

    public List<ProductoDTO> listarTodos() {
        return productoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Solo devuelve productos activos — para el catálogo público.
    public List<ProductoDTO> listarActivos() {
        return productoRepository.findByEstaActivoTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductoDTO> listarPorCategoria(Long idCategoria) {
        return productoRepository.findByCategoria_IdCategoria(idCategoria)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProductoDTO> buscarPorId(Long id) {
        return productoRepository.findById(id).map(this::toDTO);
    }

    public ProductoDTO crear(CrearProductoDTO datos) {
        // Regla de negocio: si se envía un idCategoria, debe existir en la DB.
        Categoria categoria = null;
        if (datos.getIdCategoria() != null) {
            categoria = categoriaRepository.findById(datos.getIdCategoria())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Categoría no encontrada con id: " + datos.getIdCategoria()));
        }

        Producto nuevo = new Producto();
        nuevo.setNombreProducto(datos.getNombreProducto());
        nuevo.setDescripcionDetallada(datos.getDescripcionDetallada());
        nuevo.setPrecioUnitario(datos.getPrecioUnitario());
        nuevo.setStockDisponible(datos.getStockDisponible());
        nuevo.setUrlImagen(datos.getUrlImagen());
        nuevo.setCategoria(categoria);
        nuevo.setFechaUltimoRestock(datos.getFechaUltimoRestock());

        return toDTO(productoRepository.save(nuevo));
    }


    public Optional<ProductoDTO> actualizar(Long id, CrearProductoDTO datos) {
        return productoRepository.findById(id).map(existente -> {
            // Resolvemos la categoría primero, antes de modificar la entidad.
            // Si se envía idCategoria, debe existir. Si se envía null, se desvincula.
            if (datos.getIdCategoria() != null) {
                Categoria categoria = categoriaRepository
                        .findById(datos.getIdCategoria())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Categoría no encontrada con id: " + datos.getIdCategoria()));
                existente.setCategoria(categoria);
            } else {
                existente.setCategoria(null);
            }
            existente.setNombreProducto(datos.getNombreProducto());
            existente.setDescripcionDetallada(datos.getDescripcionDetallada());
            existente.setPrecioUnitario(datos.getPrecioUnitario());
            existente.setStockDisponible(datos.getStockDisponible());
            existente.setUrlImagen(datos.getUrlImagen());
            existente.setFechaUltimoRestock(datos.getFechaUltimoRestock());
            // fechaIngreso y estaActivo NO se tocan: updatable=false en la Entity
            // los protege a nivel de Hibernate igualmente, pero dejamos claro el intento.
            return toDTO(productoRepository.save(existente));
        });
    }

    
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}