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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Usuario que compra
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Usuario comprador;

    // Relación con el Admin que procesa (puede ser null si es venta online directa)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procesado_por")
    private Usuario procesadoPor;

    // Uso de BigDecimal para manejar montos exactos de dinero
    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // La DB asigna la fecha automáticamente (DEFAULT GETDATE())
    @Column(name = "fecha", insertable = false, updatable = false)
    private LocalDateTime fecha;

    // Estado de la venta. insertable=false deja que la DB ponga el DEFAULT 'pendiente'.
    // A diferencia de la fecha, este campo SÍ se puede actualizar después (ej. a 'enviado').
    @Column(name = "estado", insertable = false, length = 50)
    private String estado;

    @Column(name = "cedula_comprador", length = 50)
    private String cedulaComprador;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "referencia_pago", length = 100)
    private String referenciaPago;
}