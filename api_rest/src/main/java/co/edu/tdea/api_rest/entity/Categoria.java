package co.edu.tdea.api_rest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

// @Data de Lombok nos ahorra escribir getters, setters y constructores
@Data
// @Entity y @Table le dicen a Hibernate que esta clase es la tabla "Categorias"
@Entity
@Table(name = "Categorias")
public class Categoria {

    // @Id indica que es la llave primaria (PK)
    @Id
    // GenerationType.IDENTITY significa que SQL Server genera el número (auto-incremento)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long idCategoria;

    // nullable = false significa que en SQL es un campo NOT NULL
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}