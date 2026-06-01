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
@Table(name = "Productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    // FK opcional hacia Categorias. nullable = true porque la tabla
    // permite que un producto no tenga categoría asignada (NULL en SQL).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = true)
    private Categoria categoria;

    @Column(name = "nombre_producto", nullable = false, length = 200)
    private String nombreProducto;

    @Column(name = "descripcion_detallada", length = 1000)
    private String descripcionDetallada;

    // BigDecimal es el tipo correcto para dinero en Java.
    // Nunca uses double o float para precios — tienen errores de precisión.
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "stock_disponible", nullable = false)
    private Integer stockDisponible;

    @Column(name = "url_imagen", length = 500)
    private String urlImagen;

    // La DB asigna estos valores con DEFAULT GETDATE() / NULL.
    // insertable = false, updatable = false: Hibernate no los toca.
    @Column(name = "fecha_ingreso", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_ultimo_restock")
    private LocalDateTime fechaUltimoRestock;

    // BIT en SQL Server → Boolean en Java.
    // DEFAULT 1 en la DB significa que todo producto nuevo nace activo.
    // Mismo patrón que estado/createdAt en Usuario: la DB lo asigna sola.
    @Column(name = "esta_activo", nullable = false,
            insertable = false, updatable = false)
    private Boolean estaActivo;
}