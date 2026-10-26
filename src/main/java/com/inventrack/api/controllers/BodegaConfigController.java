package com.inventrack.api.controllers;

import com.inventrack.api.models.BodegaConfig;
import com.inventrack.api.repositories.BodegaConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bodega")
public class BodegaConfigController {

    @Autowired
    private BodegaConfigRepository bodegaRepository;

    @GetMapping
    @PreAuthorize("hasRole('OPERARIO') or hasRole('GERENTE') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<BodegaConfig> obtenerConfiguracion() {
        return bodegaRepository.findAll().stream().findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    @PreAuthorize("hasRole('GERENTE') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<BodegaConfig> actualizarConfiguracion(@RequestBody BodegaConfig nuevaConfig) {
        return bodegaRepository.findAll().stream().findFirst().map(bodega -> {
            if (nuevaConfig.getNombre() != null) bodega.setNombre(nuevaConfig.getNombre());
            if (nuevaConfig.getLargoTotal() != null) bodega.setLargoTotal(nuevaConfig.getLargoTotal());
            if (nuevaConfig.getAnchoTotal() != null) bodega.setAnchoTotal(nuevaConfig.getAnchoTotal());
            if (nuevaConfig.getAltoTotal() != null) bodega.setAltoTotal(nuevaConfig.getAltoTotal());
            return ResponseEntity.ok(bodegaRepository.save(bodega));
        }).orElse(ResponseEntity.notFound().build());
    }
}
