package com.inventrack.api.controllers;

import com.inventrack.api.models.Producto;
import com.inventrack.api.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    @PreAuthorize("hasRole('OPERARIO') or hasRole('GERENTE') or hasRole('ADMINISTRADOR')")
    public List<Producto> listarProductos() {
        return productoService.obtenerTodos();
    }

    @PostMapping
    @PreAuthorize("hasRole('OPERARIO') or hasRole('ADMINISTRADOR')")
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoService.guardarProducto(producto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto detalles) {
        try {
            Producto actualizado = productoService.actualizarProducto(id, detalles);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OPERARIO') or hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
