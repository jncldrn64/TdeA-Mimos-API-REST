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

@Data
@Entity
@Table(name = "CarritoItem")
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Long idItem;

    // Llave foránea hacia el Carrito
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carrito", nullable = false)
    private Carrito carrito;

    // Llave foránea hacia el Producto (Esta es la clase que genera la otra IA)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    // Se usa BigDecimal para manejar dinero de forma precisa y mapear el DECIMAL(10,2)
    @Column(name = "precio_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioSnapshot;
}