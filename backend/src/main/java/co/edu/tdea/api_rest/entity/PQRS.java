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
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "PQRS")
public class PQRS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pqrs")
    private Long idPqrs;

    // FK obligatoria hacia Usuarios — toda PQRS pertenece a un usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // FK opcional hacia Ventas — una PQRS puede o no estar ligada a una venta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = true)
    private Venta venta;

    @Column(name = "asunto", nullable = false, length = 200)
    private String asunto;

    @Column(name = "mensaje", nullable = false, length = 1000)
    private String mensaje;

    // La DB asigna DEFAULT 'abierto' — no lo enviamos en el INSERT
    @Column(name = "estado", nullable = false, length = 50,
            insertable = false)
    private String estado;

    // La DB asigna DEFAULT GETDATE() — no lo enviamos en el INSERT
    @Column(name = "fecha_creacion", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    // Nace NULL — el admin lo rellena al gestionar la PQRS
    @Column(name = "respuesta", length = 1000)
    private String respuesta;

    // Nace NULL — se registra cuando el admin responde
    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;
}