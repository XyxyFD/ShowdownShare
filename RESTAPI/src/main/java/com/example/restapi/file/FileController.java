    package com.example.restapi.file;

    import com.example.restapi.audit.AuditService;
    import com.example.restapi.s3.S3Bucket;
    import com.example.restapi.s3.S3Service;
    import jakarta.servlet.http.HttpServletResponse;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;

    import java.io.IOException;
    import java.io.InputStream;
    import java.nio.file.Paths;
    import java.util.List;
    import java.util.Map;
    import java.util.zip.ZipEntry;
    import java.util.zip.ZipOutputStream;

    @RestController
    @RequestMapping("/files")
    public class FileController {


        private final FileService fileService;


        private final S3Service s3Service;

        private final S3Bucket s3Bucket;

        private final AuditService auditService;

        public FileController(FileService fileService, S3Service s3Service, S3Bucket s3Bucket, AuditService auditService) {
            this.fileService = fileService;
            this.s3Service = s3Service;
            this.s3Bucket = s3Bucket;
            this.auditService = auditService;
        }

        @PostMapping("/uploadZip")
        public ResponseEntity<?> uploadZip(
                @RequestParam("zip") MultipartFile zip,
                @RequestParam("username") String hhUsername
        ) throws IOException {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            fileService.processZip(zip, username, hhUsername);
            return ResponseEntity.ok("Zip uploaded and processed");
        }

        @GetMapping("/download/{id}")
        public ResponseEntity<String> downloadFile(@PathVariable Long id) {
            String url = fileService.getPresignedUrl(id);
            return ResponseEntity.ok(url);
        }

        @GetMapping("/unseen/count")
        public ResponseEntity<Map<String, Long>> notDownloadedyet(@RequestParam String username){
            long count = fileService.unseenCount(username);
            return ResponseEntity.ok(Map.of("count", count));
        }


        @GetMapping(value = "/unseen.zip", produces = "application/zip")
        public void downloadUnseenZip(HttpServletResponse resp) throws IOException {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            List<FileMeta> files = fileService.downloadUnseen(username);

            resp.setHeader("Content-Disposition", "attachment; filename=\"unseen-files.zip\"");
            try (ZipOutputStream zos = new ZipOutputStream(resp.getOutputStream())) {
                for (FileMeta meta : files) {
                    try (InputStream in = s3Service.downloadObjectAsStream(s3Bucket.getBucket(), meta.getS3Key())) {
                        String entryName = Paths.get(meta.getS3Key()).getFileName().toString();
                        zos.putNextEntry(new ZipEntry(entryName));
                        in.transferTo(zos);
                        zos.closeEntry();

                        auditService.markAsDownloaded(meta, username);
                    }
                }
                zos.finish();
            }

        }

        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/delete/{id}")
        public ResponseEntity<Void> deleteFileById(@PathVariable Long id) {
            fileService.deleteFile(id);
            return ResponseEntity.noContent().build();
        }


    }
