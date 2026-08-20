package CitySet_Backend;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "http://localhost:5173")
public class GrievanceController {

    private final GrievanceRepository grievanceRepository;

    public GrievanceController(GrievanceRepository grievanceRepository) {
        this.grievanceRepository = grievanceRepository;
    }

    @GetMapping
    public List<Grievance> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    @PostMapping
    public Grievance createGrievance(@RequestBody Grievance grievance) {
        return grievanceRepository.save(grievance);
    }

    @PutMapping("/{id}/status")
    public Grievance updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));

        grievance.setStatus(status);

        return grievanceRepository.save(grievance);
    }

    @DeleteMapping("/{id}")
    public void deleteGrievance(@PathVariable Long id) {
        grievanceRepository.deleteById(id);
    }
}