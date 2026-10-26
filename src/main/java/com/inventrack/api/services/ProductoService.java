package com.inventrack.api.services;

import com.inventrack.api.models.MovimientoInventario;
import com.inventrack.api.models.Producto;
import com.inventrack.api.models.Usuario;
import com.inventrack.api.repositories.MovimientoInventarioRepository;
import com.inventrack.api.repositories.ProductoRepository;
import com.inventrack.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardarProducto(Producto producto) {
        Producto guardado = productoRepository.save(producto);

        // Si se crea con stock inicial > 0, registrar movimiento de ENTRADA
        if (guardado.getStockActual() != null && guardado.getStockActual() > 0) {
            registrarMovimiento(guardado, "ENTRADA", guardado.getStockActual());
        }

        return guardado;
    }

    public Producto actualizarProducto(Long id, Producto detallesProducto) {
        return productoRepository.findById(id).map(producto -> {
            int stockAnterior = producto.getStockActual() != null ? producto.getStockActual() : 0;
            int nuevoStock = detallesProducto.getStockActual() != null ? detallesProducto.getStockActual() : stockAnterior;
            int delta = nuevoStock - stockAnterior;

            producto.setNombre(detallesProducto.getNombre());
            producto.setLargo(detallesProducto.getLargo());
            producto.setAncho(detallesProducto.getAncho());
            producto.setAlto(detallesProducto.getAlto());
            producto.setStockActual(nuevoStock);
            producto.setStockMinimo(detallesProducto.getStockMinimo());
            producto.setEsEstrella(detallesProducto.getEsEstrella());

            Producto actualizado = productoRepository.save(producto);

            // Registrar movimiento de auditoría si hubo cambio en las unidades
            if (delta > 0) {
                registrarMovimiento(actualizado, "ENTRADA", delta);
            } else if (delta < 0) {
                registrarMovimiento(actualizado, "SALIDA", Math.abs(delta));
            }

            return actualizado;
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }

    private void registrarMovimiento(Producto producto, String tipo, int cantidad) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null && auth.isAuthenticated()) ? auth.getName() : "admin@inventrack.com";
            
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario == null) {
                usuario = usuarioRepository.findAll().stream().findFirst().orElse(null);
            }

            if (usuario != null) {
                MovimientoInventario mov = new MovimientoInventario();
                mov.setProducto(producto);
                mov.setUsuario(usuario);
                mov.setTipo(tipo);
                mov.setCantidad(cantidad);
                movimientoRepository.save(mov);
            }
        } catch (Exception e) {
            System.err.println("Aviso al registrar movimiento de inventario: " + e.getMessage());
        }
    }
}
