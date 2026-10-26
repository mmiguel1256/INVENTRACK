package com.inventrack.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Pruebas Unitarias de Seguridad JWT - Fase DevOps Testing")
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Clave secreta en Base64 para pruebas unitarias
        String secretClavePruebas = "NTM2NzU2NkI1OTcwMzNzNjc2Mzk3OTJGNkIyRjQ1MjgwNDgrNEQ2MjUxNmU1NDY4NTdtNWE3MTM0NzQ3";
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", secretClavePruebas);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000); // 1 hora
    }

    @Test
    @DisplayName("DevOps Quality Gate 1: Validación de token vacío o nulo")
    void testValidarTokenVacioDebeRetornarFalse() {
        boolean esValido = jwtUtils.validateJwtToken("");
        assertFalse(esValido, "Un token vacío debe ser rechazado inmediatamente");
    }

    @Test
    @DisplayName("Un token nulo debe ser rechazado")
    void testValidarTokenNuloDebeRetornarFalse() {
        assertFalse(jwtUtils.validateJwtToken(null));
    }

    @Test
    @DisplayName("DevOps Quality Gate 2: Validación de token malicioso o corrupto")
    void testValidarTokenCorruptoDebeRetornarFalse() {
        boolean esValido = jwtUtils.validateJwtToken("token.falso.corrupto123");
        assertFalse(esValido, "Cualquier token alterado o corrupto debe retornar false");
    }

    @Test
    @DisplayName("Un token firmado debe validarse y conservar el correo del usuario")
    void testTokenGeneradoDebeValidarseYRecuperarUsuario() {
        UserDetailsImpl user = new UserDetailsImpl(
                42L,
                "operario@inventrack.com",
                "password-hash",
                List.of(new SimpleGrantedAuthority("ROLE_OPERARIO")),
                true);
        TestingAuthenticationToken authentication =
                new TestingAuthenticationToken(user, null, user.getAuthorities());

        String token = jwtUtils.generateJwtToken(authentication);

        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("operario@inventrack.com", jwtUtils.getUserNameFromJwtToken(token));
    }
}
