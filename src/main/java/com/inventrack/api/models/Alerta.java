package com.inventrack.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "tipo_alerta", length = 50)
    private String tipoAlerta;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "notificada_por_bot")
    private Boolean notificadaPorBot = false;

    @Column(name = "fecha_generacion", insertable = false, updatable = false)
    private LocalDateTime fechaGeneracion;

    public Alerta() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public String getTipoAlerta() { return tipoAlerta; }
    public void setTipoAlerta(String tipoAlerta) { this.tipoAlerta = tipoAlerta; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public Boolean getNotificadaPorBot() { return notificadaPorBot; }
    public void setNotificadaPorBot(Boolean notificadaPorBot) { this.notificadaPorBot = notificadaPorBot; }
    public LocalDateTime getFechaGeneracion() { return fechaGeneracion; }
}
