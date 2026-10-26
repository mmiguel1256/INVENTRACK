package com.inventrack.api.repositories;

import com.inventrack.api.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByCodigoSku(String codigoSku);
    Boolean existsByCodigoSku(String codigoSku);
}
