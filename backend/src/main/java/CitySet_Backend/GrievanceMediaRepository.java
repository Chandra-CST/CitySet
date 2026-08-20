package CitySet_Backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GrievanceMediaRepository
        extends JpaRepository<GrievanceMedia, Long> {

    List<GrievanceMedia> findByGrievanceId(Long grievanceId);
}