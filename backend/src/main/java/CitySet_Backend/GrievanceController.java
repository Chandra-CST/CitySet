package CitySet_Backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "http://localhost:5173")
public class GrievanceController {

    private final GrievanceRepository grievanceRepository;
    private final GrievanceMediaRepository grievanceMediaRepository;

    private final Path uploadDirectory =
            Paths.get("uploads");

    public GrievanceController(
            GrievanceRepository grievanceRepository,
            GrievanceMediaRepository grievanceMediaRepository) {

        this.grievanceRepository = grievanceRepository;
        this.grievanceMediaRepository = grievanceMediaRepository;

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory.", e);
        }
    }

    @GetMapping
    public List<Grievance> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    @PostMapping
    public Grievance createGrievance(
            @RequestBody Grievance grievance) {

        return grievanceRepository.save(grievance);
    }

    @PostMapping(
            value = "/{id}/media",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadMedia(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) {

        try {

            Grievance grievance = grievanceRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Grievance not found"));

            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest()
                        .body("No files were uploaded.");
            }

            if (files.length > 3) {
                return ResponseEntity.badRequest()
                        .body("Maximum 3 files are allowed.");
            }

            for (MultipartFile file : files) {

                if (file.isEmpty()) {
                    continue;
                }

                String contentType = file.getContentType();

                if (contentType == null ||
                        (!contentType.startsWith("image/")
                        && !contentType.equals("video/mp4"))) {

                    return ResponseEntity.badRequest()
                            .body(
                                "Only images and MP4 videos are allowed.");
                }

                if (file.getSize() > 20 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body(
                                "Each file must be smaller than 20 MB.");
                }

                String originalFileName =
                        file.getOriginalFilename();

                String safeFileName =
                        UUID.randomUUID()
                                + "_"
                                + sanitizeFileName(
                                        originalFileName);

                Path filePath =
                        uploadDirectory.resolve(safeFileName);

                Files.copy(
                        file.getInputStream(),
                        filePath);

                GrievanceMedia media =
                        new GrievanceMedia();

                media.setFileName(originalFileName);
                media.setFileType(contentType);
                media.setFilePath(
                        "/uploads/" + safeFileName);
                media.setGrievance(grievance);

                grievanceMediaRepository.save(media);
            }

            return ResponseEntity.ok(
                    grievanceMediaRepository
                            .findByGrievanceId(id));

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save uploaded files.");
        }
    }

    @GetMapping("/{id}/media")
    public List<GrievanceMedia> getGrievanceMedia(
            @PathVariable Long id) {

        return grievanceMediaRepository
                .findByGrievanceId(id);
    }

    @PutMapping("/{id}/status")
    public Grievance updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Grievance grievance = grievanceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Grievance not found"));

        grievance.setStatus(status);

        return grievanceRepository.save(grievance);
    }

    @DeleteMapping("/{id}")
    public void deleteGrievance(
            @PathVariable Long id) {

        grievanceRepository.deleteById(id);
    }

    private String sanitizeFileName(String fileName) {

        if (fileName == null || fileName.isBlank()) {
            return "uploaded-file";
        }

        return Paths.get(fileName)
                .getFileName()
                .toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}