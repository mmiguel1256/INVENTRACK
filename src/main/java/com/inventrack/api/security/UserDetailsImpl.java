package com.inventrack.api.security;

import com.inventrack.api.models.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean activo;

    public UserDetailsImpl(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities, boolean activo) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.activo = activo;
    }

    public static UserDetailsImpl build(Usuario usuario) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre().toUpperCase());
        return new UserDetailsImpl(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPasswordHash(),
                Collections.singletonList(authority),
                usuario.getEstado());
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return email; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return activo; }
}
