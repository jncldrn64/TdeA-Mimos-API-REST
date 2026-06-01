package co.edu.tdea.api_rest.service;

import co.edu.tdea.api_rest.dto.RolDTO;
import co.edu.tdea.api_rest.entity.Rol;
import co.edu.tdea.api_rest.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;

    private RolDTO toDTO(Rol rol) {
        RolDTO dto = new RolDTO();
        dto.setIdRol(rol.getIdRol());
        dto.setNombre(rol.getNombre());
        dto.setDescripcion(rol.getDescripcion());
        return dto;
    }

    public List<RolDTO> listarTodos() {
        return rolRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<RolDTO> buscarPorId(Long id) {
        return rolRepository.findById(id).map(this::toDTO);
    }

    public RolDTO crear(Rol rol) {
        Rol guardado = rolRepository.save(rol);
        return toDTO(guardado);
    }

    public void eliminar(Long id) {
        rolRepository.deleteById(id);
    }
}