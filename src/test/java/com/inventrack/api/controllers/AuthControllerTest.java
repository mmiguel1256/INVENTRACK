package com.inventrack.api.controllers;

import com.inventrack.api.dto.JwtResponse;
import com.inventrack.api.dto.LoginRequest;
import com.inventrack.api.repositories.UsuarioRepository;
import com.inventrack.api.security.JwtUtils;
import com.inventrack.api.security.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthController authController;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginCorrectoDevuelveTokenUsuarioYRol() {
        UserDetailsImpl user = new UserDetailsImpl(
                42L,
                "operario@inventrack.com",
                "password-hash",
                List.of(new SimpleGrantedAuthority("ROLE_OPERARIO")),
                true);
        TestingAuthenticationToken authentication =
                new TestingAuthenticationToken(user, null, user.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("signed-token");
        LoginRequest request = loginRequest();

        var response = authController.authenticateUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        JwtResponse body = (JwtResponse) response.getBody();
        assertEquals("signed-token", body.getToken());
        assertEquals(42L, body.getId());
        assertEquals("operario@inventrack.com", body.getEmail());
        assertEquals(List.of("ROLE_OPERARIO"), body.getRoles());
        verify(authenticationManager).authenticate(any());
        verify(jwtUtils).generateJwtToken(authentication);
    }

    @Test
    void credencialesInvalidasSePropaganComoFalloDeAutenticacion() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Credenciales invalidas"));

        assertThrows(
                BadCredentialsException.class,
                () -> authController.authenticateUser(loginRequest()));
    }

    private LoginRequest loginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("operario@inventrack.com");
        request.setPassword("password");
        return request;
    }
}
