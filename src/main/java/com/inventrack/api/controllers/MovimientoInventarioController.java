package com.inventrack.api.controllers;

import com.inventrack.api.models.MovimientoInventario;
import com.inventrack.api.repositories.MovimientoInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoInventarioController {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @GetMapping
    @PreAuthorize("hasRole('OPERARIO') or hasRole('GERENTE') or hasRole('ADMINISTRADOR')")
    public List<MovimientoInventario> listarMovimientos() {
        return movimientoRepository.findAllWithDetails();
    }
}
