package co.edu.tdea.api_rest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "Usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    // @ManyToOne: "muchos usuarios pueden tener un mismo rol".
    // Es la forma de representar en Java la FK id_rol de la tabla Usuarios.
    //
    // fetch = FetchType.LAZY significa que Hibernate NO carga el objeto Rol
    // automáticamente cuando lees un Usuario. Lo carga solo si lo pides
    // explícitamente. Esto evita consultas innecesarias a la DB.
    @ManyToOne(fetch = FetchType.LAZY)

    // @JoinColumn le dice a Hibernate cuál es la columna FK en la tabla Usuarios
    // que apunta a la PK de la tabla Roles.
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    // unique = true refleja el UNIQUE (email) definido en la tabla SQL.
    // Si intentas guardar dos usuarios con el mismo email, la DB lo rechaza.
    @Column(name = "email", nullable = false, unique = true, length = 200)
    private String email;

    // Este campo NUNCA debe salir en el JSON de respuesta.
    // El DTO se encarga de omitirlo. Aquí solo vive en la entidad interna.
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // Estado del usuario: 'activo' o 'inactivo'. Valor por defecto en DB: 'activo'.
    // insertable = false, updatable = false le dice a Hibernate que no toque
    // esta columna al hacer INSERT ni UPDATE — la DB pone el valor por defecto.
    @Column(name = "estado", nullable = false, length = 50,
            insertable = false, updatable = false)
    private String estado;

    // createdAt tampoco lo manejamos desde Java: la DB lo asigna con GETDATE().
    @Column(name = "created_at", nullable = false,
            insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
}