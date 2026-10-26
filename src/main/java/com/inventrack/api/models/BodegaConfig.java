package com.inventrack.api.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bodega_config")
public class BodegaConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(name = "largo_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal largoTotal;
    
    @Column(name = "ancho_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal anchoTotal;
    
    @Column(name = "alto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal altoTotal;
    
    @Column(name = "capacidad_volumetrica", insertable = false, updatable = false, precision = 12, scale = 2)
    private BigDecimal capacidadVolumetrica;

    public BodegaConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public BigDecimal getLargoTotal() { return largoTotal; }
    public void setLargoTotal(BigDecimal largoTotal) { this.largoTotal = largoTotal; }
    public BigDecimal getAnchoTotal() { return anchoTotal; }
    public void setAnchoTotal(BigDecimal anchoTotal) { this.anchoTotal = anchoTotal; }
    public BigDecimal getAltoTotal() { return altoTotal; }
    public void setAltoTotal(BigDecimal altoTotal) { this.altoTotal = altoTotal; }
    public BigDecimal getCapacidadVolumetrica() { return capacidadVolumetrica; }
}
