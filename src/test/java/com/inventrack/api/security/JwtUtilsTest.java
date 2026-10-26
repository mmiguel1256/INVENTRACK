package com.inventrack.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

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
    @DisplayName("DevOps Quality Gate 2: Validación de token malicioso o corrupto")
    void testValidarTokenCorruptoDebeRetornarFalse() {
        boolean esValido = jwtUtils.validateJwtToken("token.falso.corrupto123");
        assertFalse(esValido, "Cualquier token alterado o corrupto debe retornar false");
    }
}
