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
@Table(name = "Envios")
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_envio")
    private Long idEnvio;

    // FK hacia Ventas. Un envío pertenece a una sola venta.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @Column(name = "direccion", nullable = false, length = 300)
    private String direccion;

    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;

    // Estado del envío: 'preparando', 'despachado', 'entregado', etc.
    // insertable = false: la DB asigna DEFAULT 'preparando' en el INSERT.
    // updatable = true (por defecto): sí se puede cambiar después.
    @Column(name = "estado_envio", nullable = false, length = 50,
            insertable = false)
    private String estadoEnvio;

    // Estas tres fechas nacen como NULL y se llenan conforme avanza el proceso.
    // NO tienen DEFAULT en la DB, así que Hibernate sí las incluye en el INSERT
    // (con valor null). Por eso NO llevan insertable = false.
    @Column(name = "fecha_despacho")
    private LocalDateTime fechaDespacho;

    @Column(name = "fecha_entrega_estimada")
    private LocalDateTime fechaEntregaEstimada;

    @Column(name = "fecha_entrega_real")
    private LocalDateTime fechaEntregaReal;
}