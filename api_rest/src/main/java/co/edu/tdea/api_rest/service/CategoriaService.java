package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.CategoriaDTO;
import co.edu.tdea.api_rest.entity.Categoria;
import co.edu.tdea.api_rest.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    // Inyectamos el repositorio que creaste en el paso anterior
    private final CategoriaRepository categoriaRepository;

    // Método interno para mapear Entity a DTO
    private CategoriaDTO toDTO(Categoria categoria) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setIdCategoria(categoria.getIdCategoria());
        dto.setNombre(categoria.getNombre());
        dto.setDescripcion(categoria.getDescripcion());
        return dto;
    }

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<CategoriaDTO> buscarPorId(Long id) {
        return categoriaRepository.findById(id).map(this::toDTO);
    }

    public CategoriaDTO crear(Categoria categoria) {
        Categoria guardada = categoriaRepository.save(categoria);
        return toDTO(guardada);
    }

    public Optional<CategoriaDTO> actualizar(Long id, Categoria datos) {
        return categoriaRepository.findById(id).map(existente -> {
            existente.setNombre(datos.getNombre());
            existente.setDescripcion(datos.getDescripcion());
            return toDTO(categoriaRepository.save(existente));
        });
    }

    public void eliminar(Long id) {
        categoriaRepository.deleteById(id);
    }
}