package com.inventrack.api.repositories;

import com.inventrack.api.models.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    
    @Query("SELECT m FROM MovimientoInventario m JOIN FETCH m.producto JOIN FETCH m.usuario ORDER BY m.id DESC")
    List<MovimientoInventario> findAllWithDetails();
}
