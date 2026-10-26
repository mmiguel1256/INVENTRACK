package com.inventrack.api.repositories;

import com.inventrack.api.models.BodegaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodegaConfigRepository extends JpaRepository<BodegaConfig, Long> {
}
