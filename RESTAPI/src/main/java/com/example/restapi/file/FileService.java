    package com.example.restapi.file;

    import com.example.restapi.audit.AuditRepository;
    import com.example.restapi.audit.AuditService;
    import com.example.restapi.user.UserRepository;
    import com.example.restapi.s3.S3Bucket;
    import com.example.restapi.s3.S3Service;
    import com.example.restapi.user.User;
    import org.springframework.http.HttpStatus;
    import org.springframework.mock.web.MockMultipartFile;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;
    import org.springframework.web.multipart.MultipartFile;
    import org.springframework.web.server.ResponseStatusException;

    import java.io.ByteArrayOutputStream;
    import java.io.IOException;
    import java.nio.charset.Charset;
    import java.nio.charset.StandardCharsets;
    import java.time.LocalDateTime;
    import java.util.ArrayList;
    import java.util.List;
    import java.util.regex.Pattern;
    import java.util.zip.ZipEntry;
    import java.util.zip.ZipInputStream;

    @Service
    public class FileService {

        private static final Charset DEFAULT_CHARSET = StandardCharsets.UTF_8;


        private final UserRepository userRepository;


        private final FileRepository fileRepository;


        private final S3Service s3Service;


        private final S3Bucket s3Bucket;


        private final UsernameEncoder usernameEncoder;


        private final HandHistoryAnalyzer handHistoryAnalyzer;

        private final AuditRepository auditRepository;
        private final AuditService auditService;

        public FileService(UserRepository userRepository, FileRepository fileRepository,
                           S3Service s3Service, S3Bucket s3Bucket, UsernameEncoder usernameEncoder, HandHistoryAnalyzer handHistoryAnalyzer, AuditRepository auditRepository, AuditService auditService) {
            this.userRepository = userRepository;
            this.fileRepository = fileRepository;
            this.s3Service = s3Service;
            this.s3Bucket = s3Bucket;
            this.usernameEncoder = usernameEncoder;
            this.handHistoryAnalyzer = handHistoryAnalyzer;
            this.auditRepository = auditRepository;
            this.auditService = auditService;
        }

        public void processZip(MultipartFile zip, String loginUsername, String hhUsername) throws IOException {
            List<MultipartFile> files = unzip(zip);

            User userEntity = userRepository.findByUsername(loginUsername)
                    .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + loginUsername));

            String usernameHash = usernameEncoder.encode(hhUsername);

            for (MultipartFile file : files) {
                PokerSite site = handHistoryAnalyzer.determineSite(file.getInputStream());

                byte[] original = file.getBytes();
                byte[] payload = (hhUsername == null || hhUsername.isBlank())
                        ? original                                   // => not anonymize
                        : anonymizeContent(original, hhUsername, usernameHash); // => hashing

                String key = loginUsername + "/" + file.getOriginalFilename();

                FileMeta meta = new FileMeta(
                        userEntity, usernameHash, site, key, FileStatus.PENDING, LocalDateTime.now()
                );
                uploadSingle(payload, meta, loginUsername);
            }
        }

        public void uploadSingle(byte[] bytes, FileMeta meta, String username) {
            s3Service.putObject(s3Bucket.getBucket(), meta.getS3Key(), bytes);
            fileRepository.save(meta);
            auditService.logUpload(username, meta);
        }

        public String getPresignedUrl(Long fileId) {
            FileMeta meta = fileRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
            return s3Service.generatePresignedUrl(s3Bucket.getBucket(), meta.getS3Key());
        }

        public List<FileMeta> downloadUnseen(String username) {
            User user = userRepository
                    .findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            if (user.isBlocked()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to download files");
            }

            return auditRepository.findUnseenFilesByUser(user);
        }
        public long unseenCount(String username){
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            return auditRepository.countUnseenFilesByUser(user);
        }




        private List<MultipartFile> unzip(MultipartFile zipFile) throws IOException {
            List<MultipartFile> files = new ArrayList<>();
            try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (!entry.isDirectory()) {
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        byte[] buffer = new byte[4096];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            baos.write(buffer, 0, len);
                        }

                        MultipartFile file = new MockMultipartFile(
                                entry.getName(),                // fieldName
                                entry.getName(),                // originalFilename
                                "application/octet-stream",     // contentType
                                baos.toByteArray()              // content
                        );
                        files.add(file);
                    }
                    zis.closeEntry();
                }
            }
            return files;
        }

        private byte[] anonymizeContent(byte[] originalBytes, String username, String usernameHash) {
            String text = new String(originalBytes, DEFAULT_CHARSET);


            String escaped = Pattern.quote(username);


            boolean useWordBoundaries = username.matches("^[A-Za-z0-9_]+$");

            String pattern = useWordBoundaries
                    ? "(?<!\\w)" + escaped + "(?!\\w)"
                    : escaped;

            String replaced = text.replaceAll(pattern, usernameHash);
            return replaced.getBytes(DEFAULT_CHARSET);
        }


        public void deleteFile(Long id) {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            FileMeta meta = fileRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("File not found: " + id));

            s3Service.deleteFile(s3Bucket.getBucket(), meta.getS3Key());

            fileRepository.delete(meta);

            auditService.logDelete(username, meta);
        }


    }
