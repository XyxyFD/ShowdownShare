package com.example.restapi.audit;

import com.example.restapi.file.FileMeta;
import com.example.restapi.user.UserRepository;
import com.example.restapi.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    private final UserRepository userRepository;

    public AuditService(AuditRepository auditRepository, UserRepository userRepository) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void logUpload(String username, FileMeta file) {
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setFile(file);
        auditLog.setAction(ActionType.UPLOAD);
        auditLog.setTimestamp(OffsetDateTime.now());

        auditRepository.save(auditLog);

    }



    public void markAsDownloaded(FileMeta file, String username) {
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setFile(file);
        auditLog.setAction(ActionType.DOWNLOAD);
        auditLog.setTimestamp(OffsetDateTime.now());
        auditRepository.save(auditLog);
    }

    @Transactional
    public void logDelete(String username, FileMeta file) {
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setFile(file);
        auditLog.setAction(ActionType.DELETED);
        auditLog.setTimestamp(OffsetDateTime.now());
        auditRepository.save(auditLog);

    }


}
