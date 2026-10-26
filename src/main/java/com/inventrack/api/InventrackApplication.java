package com.inventrack.api;

import com.inventrack.api.models.BodegaConfig;
import com.inventrack.api.models.Producto;
import com.inventrack.api.models.Rol;
import com.inventrack.api.models.Usuario;
import com.inventrack.api.repositories.BodegaConfigRepository;
import com.inventrack.api.repositories.ProductoRepository;
import com.inventrack.api.repositories.RolRepository;
import com.inventrack.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class InventrackApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventrackApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(
			RolRepository rolRepository, 
			UsuarioRepository usuarioRepository, 
			BodegaConfigRepository bodegaRepository,
			ProductoRepository productoRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Crear Roles si no existen
			Rol adminRole;
			if (rolRepository.findByNombre("ADMINISTRADOR").isEmpty()) {
				adminRole = new Rol();
				adminRole.setNombre("ADMINISTRADOR");
				adminRole.setDescripcion("Acceso total al sistema");
				adminRole = rolRepository.save(adminRole);
			} else {
				adminRole = rolRepository.findByNombre("ADMINISTRADOR").get();
			}

			Rol gerenteRole;
			if (rolRepository.findByNombre("GERENTE").isEmpty()) {
				gerenteRole = new Rol();
				gerenteRole.setNombre("GERENTE");
				gerenteRole.setDescripcion("Gestión y visualización estratégica");
				gerenteRole = rolRepository.save(gerenteRole);
			} else {
				gerenteRole = rolRepository.findByNombre("GERENTE").get();
			}

			Rol operarioRole;
			if (rolRepository.findByNombre("OPERARIO").isEmpty()) {
				operarioRole = new Rol();
				operarioRole.setNombre("OPERARIO");
				operarioRole.setDescripcion("Control operativo de existencias");
				operarioRole = rolRepository.save(operarioRole);
			} else {
				operarioRole = rolRepository.findByNombre("OPERARIO").get();
			}

			// 2. Crear Usuarios de prueba si no existen
			if (!usuarioRepository.existsByEmail("admin@inventrack.com")) {
				Usuario admin = new Usuario();
				admin.setNombreCompleto("Administrador Principal");
				admin.setEmail("admin@inventrack.com");
				admin.setPasswordHash(passwordEncoder.encode("admin123")); // Contraseña: admin123
				admin.setRol(adminRole);
				admin.setEstado(true);
				usuarioRepository.save(admin);
			}

			if (!usuarioRepository.existsByEmail("gerente@inventrack.com")) {
				Usuario gerente = new Usuario();
				gerente.setNombreCompleto("Gerente de Inventario");
				gerente.setEmail("gerente@inventrack.com");
				gerente.setPasswordHash(passwordEncoder.encode("gerente123")); // Contraseña: gerente123
				gerente.setRol(gerenteRole);
				gerente.setEstado(true);
				usuarioRepository.save(gerente);
			}

			if (!usuarioRepository.existsByEmail("operario@inventrack.com")) {
				Usuario operario = new Usuario();
				operario.setNombreCompleto("Operario Almacén");
				operario.setEmail("operario@inventrack.com");
				operario.setPasswordHash(passwordEncoder.encode("operario123")); // Contraseña: operario123
				operario.setRol(operarioRole);
				operario.setEstado(true);
				usuarioRepository.save(operario);
				System.out.println("====== USUARIOS DE PRUEBA CREADOS ======");
				System.out.println("Admin: admin@inventrack.com / admin123");
				System.out.println("Gerente: gerente@inventrack.com / gerente123");
				System.out.println("Operario: operario@inventrack.com / operario123");
				System.out.println("=========================================");
			}

			// 3. Crear Bodega inicial si no existe
			if (bodegaRepository.count() == 0) {
				BodegaConfig bodega = new BodegaConfig();
				bodega.setNombre("Bodega Central Principal");
				bodega.setLargoTotal(new BigDecimal("30.00"));
				bodega.setAnchoTotal(new BigDecimal("20.00"));
				bodega.setAltoTotal(new BigDecimal("6.00"));
				bodegaRepository.save(bodega);
				System.out.println("====== BODEGA CENTRAL REGISTRADA ======");
			}

			// 4. Crear Productos iniciales de prueba si no existen
			if (productoRepository.count() == 0) {
				Producto p1 = new Producto();
				p1.setCodigoSku("MON-34-UW");
				p1.setNombre("Monitor Curvo 34 UltraWide");
				p1.setLargo(new BigDecimal("0.85"));
				p1.setAncho(new BigDecimal("0.25"));
				p1.setAlto(new BigDecimal("0.50"));
				p1.setStockActual(45);
				p1.setStockMinimo(10);
				p1.setEsEstrella(true);
				productoRepository.save(p1);

				Producto p2 = new Producto();
				p2.setCodigoSku("TEC-MEC-RGB");
				p2.setNombre("Teclado Mecánico RGB Blue");
				p2.setLargo(new BigDecimal("0.45"));
				p2.setAncho(new BigDecimal("0.15"));
				p2.setAlto(new BigDecimal("0.05"));
				p2.setStockActual(5);
				p2.setStockMinimo(15); // Stock crítico para disparar alerta
				p2.setEsEstrella(false);
				productoRepository.save(p2);

				Producto p3 = new Producto();
				p3.setCodigoSku("LAP-PRO-16");
				p3.setNombre("Laptop Pro 16 M3 Max");
				p3.setLargo(new BigDecimal("0.36"));
				p3.setAncho(new BigDecimal("0.25"));
				p3.setAlto(new BigDecimal("0.02"));
				p3.setStockActual(28);
				p3.setStockMinimo(8);
				p3.setEsEstrella(true);
				productoRepository.save(p3);

				Producto p4 = new Producto();
				p4.setCodigoSku("SIL-ERG-PRO");
				p4.setNombre("Silla Ergonómica Pro Racing");
				p4.setLargo(new BigDecimal("0.70"));
				p4.setAncho(new BigDecimal("0.70"));
				p4.setAlto(new BigDecimal("1.30"));
				p4.setStockActual(14);
				p4.setStockMinimo(5);
				p4.setEsEstrella(false);
				productoRepository.save(p4);

				Producto p5 = new Producto();
				p5.setCodigoSku("MOU-INA-SIL");
				p5.setNombre("Mouse Inalámbrico Silent");
				p5.setLargo(new BigDecimal("0.12"));
				p5.setAncho(new BigDecimal("0.07"));
				p5.setAlto(new BigDecimal("0.04"));
				p5.setStockActual(3);
				p5.setStockMinimo(20); // Stock crítico para disparar alerta
				p5.setEsEstrella(false);
				productoRepository.save(p5);

				System.out.println("====== PRODUCTOS INICIALES SEMBRADOS ======");
			}
		};
	}
}
