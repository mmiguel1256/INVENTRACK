package com.inventrack.api.controllers;

import com.inventrack.api.models.Alerta;
import com.inventrack.api.repositories.AlertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    @Autowired
    private AlertaRepository alertaRepository;

    @GetMapping
    @PreAuthorize("hasRole('OPERARIO') or hasRole('GERENTE') or hasRole('ADMINISTRADOR')")
    public List<Alerta> listarAlertas() {
        return alertaRepository.findAll();
    }
}
