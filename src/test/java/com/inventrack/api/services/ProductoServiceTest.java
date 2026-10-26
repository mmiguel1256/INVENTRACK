package com.inventrack.api.services;

import com.inventrack.api.models.MovimientoInventario;
import com.inventrack.api.models.Producto;
import com.inventrack.api.models.Usuario;
import com.inventrack.api.repositories.MovimientoInventarioRepository;
import com.inventrack.api.repositories.ProductoRepository;
import com.inventrack.api.repositories.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private MovimientoInventarioRepository movimientoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ProductoService productoService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setEmail("operario@inventrack.com");
        SecurityContextHolder.getContext().setAuthentication(
                new TestingAuthenticationToken(usuario.getEmail(), null, "ROLE_OPERARIO"));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void crearProductoConStockInicialRegistraEntrada() {
        Producto nuevoProducto = producto(12);
        when(productoRepository.save(nuevoProducto)).thenReturn(nuevoProducto);
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));

        Producto guardado = productoService.guardarProducto(nuevoProducto);

        assertSame(nuevoProducto, guardado);
        ArgumentCaptor<MovimientoInventario> movimientoCaptor =
                ArgumentCaptor.forClass(MovimientoInventario.class);
        verify(movimientoRepository).save(movimientoCaptor.capture());
        MovimientoInventario movimiento = movimientoCaptor.getValue();
        assertSame(nuevoProducto, movimiento.getProducto());
        assertSame(usuario, movimiento.getUsuario());
        assertEquals("ENTRADA", movimiento.getTipo());
        assertEquals(12, movimiento.getCantidad());
    }

    @Test
    void actualizarStockMenorRegistraSalidaPorLaDiferencia() {
        Producto existente = producto(10);
        Producto detalles = producto(7);
        when(productoRepository.findById(8L)).thenReturn(Optional.of(existente));
        when(productoRepository.save(existente)).thenReturn(existente);
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));

        Producto actualizado = productoService.actualizarProducto(8L, detalles);

        assertSame(existente, actualizado);
        assertEquals(7, actualizado.getStockActual());
        ArgumentCaptor<MovimientoInventario> movimientoCaptor =
                ArgumentCaptor.forClass(MovimientoInventario.class);
        verify(movimientoRepository).save(movimientoCaptor.capture());
        assertEquals("SALIDA", movimientoCaptor.getValue().getTipo());
        assertEquals(3, movimientoCaptor.getValue().getCantidad());
    }

    @Test
    void actualizarProductoSinCambioDeStockNoRegistraMovimiento() {
        Producto existente = producto(10);
        Producto detalles = producto(10);
        when(productoRepository.findById(8L)).thenReturn(Optional.of(existente));
        when(productoRepository.save(existente)).thenReturn(existente);

        productoService.actualizarProducto(8L, detalles);

        verify(movimientoRepository, never()).save(any(MovimientoInventario.class));
    }

    private Producto producto(int stock) {
        Producto producto = new Producto();
        producto.setCodigoSku("SKU-TEST");
        producto.setNombre("Producto de prueba");
        producto.setStockActual(stock);
        producto.setStockMinimo(2);
        return producto;
    }
}
