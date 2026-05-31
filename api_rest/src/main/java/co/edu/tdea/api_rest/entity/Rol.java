package co.edu.tdea.api_rest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

// @Data es de Lombok: genera automáticamente getters, setters,
// toString() y constructores por debajo. Nos ahorra 50 líneas de código repetitivo.
@Data

// @Entity le dice a Hibernate (el traductor): "esta clase representa una tabla en la DB".
@Entity

// @Table indica el nombre exacto de la tabla en SQL Server.
@Table(name = "Roles")
public class Rol {

    // @Id marca este campo como la Clave Primaria (PK).
    @Id
    
    // @GeneratedValue indica que el valor lo genera la DB sola (el IDENTITY en SQL).
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long idRol;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "descripcion", length = 200)
    private String descripcion;
}