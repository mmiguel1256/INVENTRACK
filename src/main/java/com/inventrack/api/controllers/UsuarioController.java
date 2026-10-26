package com.inventrack.api.controllers;

import com.inventrack.api.models.Rol;
import com.inventrack.api.models.Usuario;
import com.inventrack.api.repositories.RolRepository;
import com.inventrack.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Rol> listarRoles() {
        return rolRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        if (usuarioRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("El email ya se encuentra registrado");
        }

        String nombreCompleto = (String) body.get("nombreCompleto");
        String rawPassword = (String) body.get("password");
        Long rolId = Long.valueOf(body.get("rolId").toString());

        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Usuario nuevo = new Usuario();
        nuevo.setNombreCompleto(nombreCompleto);
        nuevo.setEmail(email);
        nuevo.setPasswordHash(passwordEncoder.encode(rawPassword));
        nuevo.setRol(rol);
        nuevo.setEstado(true);

        return ResponseEntity.ok(usuarioRepository.save(nuevo));
    }
}
