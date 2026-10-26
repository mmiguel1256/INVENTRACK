package com.inventrack.api.services;

import com.inventrack.api.models.BodegaConfig;
import com.inventrack.api.models.Producto;
import com.inventrack.api.repositories.BodegaConfigRepository;
import com.inventrack.api.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MotorPredictivoService {

    @Autowired
    private BodegaConfigRepository bodegaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public Map<String, Object> calcularEspacioActual() {
        BodegaConfig bodega = bodegaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Configuración de bodega no encontrada"));
        
        List<Producto> productos = productoRepository.findAll();
        
        BigDecimal volumenOcupado = BigDecimal.ZERO;
        for (Producto p : productos) {
            if (p.getStockActual() != null && p.getStockActual() > 0 && p.getVolumen() != null) {
                BigDecimal volumenProductoTotal = p.getVolumen().multiply(BigDecimal.valueOf(p.getStockActual()));
                volumenOcupado = volumenOcupado.add(volumenProductoTotal);
            }
        }

        BigDecimal capacidadTotal = bodega.getCapacidadVolumetrica();
        BigDecimal volumenDisponible = capacidadTotal.subtract(volumenOcupado);
        
        // Evitar números negativos si hay sobrecupo teórico
        if (volumenDisponible.compareTo(BigDecimal.ZERO) < 0) {
            volumenDisponible = BigDecimal.ZERO;
        }

        double porcentajeOcupado = (volumenOcupado.doubleValue() / capacidadTotal.doubleValue()) * 100;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("capacidadTotal", capacidadTotal);
        resultado.put("volumenOcupado", volumenOcupado);
        resultado.put("volumenDisponible", volumenDisponible);
        resultado.put("porcentajeOcupado", porcentajeOcupado);
        
        return resultado;
    }

    public Map<String, Object> estimarEspacioFuturo(Long productoId, int cantidadProyectada) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                
        Map<String, Object> estadoActual = calcularEspacioActual();
        BigDecimal volumenOcupadoActual = (BigDecimal) estadoActual.get("volumenOcupado");
        BigDecimal capacidadTotal = (BigDecimal) estadoActual.get("capacidadTotal");
        
        // Calcular la diferencia de volumen que aportará la nueva cantidad
        int diferenciaCantidad = cantidadProyectada - (producto.getStockActual() != null ? producto.getStockActual() : 0);
        BigDecimal impactoVolumetrico = producto.getVolumen().multiply(BigDecimal.valueOf(diferenciaCantidad));
        
        BigDecimal nuevoVolumenOcupado = volumenOcupadoActual.add(impactoVolumetrico);
        BigDecimal nuevoVolumenDisponible = capacidadTotal.subtract(nuevoVolumenOcupado);
        
        double nuevoPorcentajeOcupado = (nuevoVolumenOcupado.doubleValue() / capacidadTotal.doubleValue()) * 100;

        Map<String, Object> estimacion = new HashMap<>();
        estimacion.put("nuevoVolumenOcupado", nuevoVolumenOcupado);
        estimacion.put("nuevoVolumenDisponible", nuevoVolumenDisponible);
        estimacion.put("nuevoPorcentajeOcupado", nuevoPorcentajeOcupado);
        estimacion.put("impactoVolumetrico", impactoVolumetrico);
        
        return estimacion;
    }
}
