package com.inventrack.api.controllers;

import com.inventrack.api.services.MotorPredictivoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/prediccion")
public class MotorPredictivoController {

    @Autowired
    private MotorPredictivoService motorPredictivoService;

    @GetMapping("/espacio-actual")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('GERENTE') or hasRole('OPERARIO')")
    public ResponseEntity<Map<String, Object>> obtenerEspacioActual() {
        return ResponseEntity.ok(motorPredictivoService.calcularEspacioActual());
    }

    @GetMapping("/estimar")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('GERENTE')")
    public ResponseEntity<Map<String, Object>> estimarEspacioFuturo(
            @RequestParam Long productoId, 
            @RequestParam int cantidadProyectada) {
        
        return ResponseEntity.ok(motorPredictivoService.estimarEspacioFuturo(productoId, cantidadProyectada));
    }
}
