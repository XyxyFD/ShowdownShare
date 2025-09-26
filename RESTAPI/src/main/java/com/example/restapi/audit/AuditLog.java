package com.example.restapi.audit;

import com.example.restapi.file.FileMeta;
import com.example.restapi.user.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_audit_user"))
    private User user;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_id", nullable = true,
            foreignKey = @ForeignKey(name = "fk_audit_file"))
    private FileMeta file;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private ActionType action;

    @Column(name = "timestamp", nullable = false, columnDefinition = "timestamp with time zone")
    private OffsetDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public AuditLog setUser(User user) {
        this.user = user;
        return this;
    }

    public FileMeta getFile() {
        return file;
    }

    public AuditLog setFile(FileMeta file) {
        this.file = file;
        return this;
    }


    public AuditLog setAction(ActionType action) {
        this.action = action;
        return this;
    }


    public AuditLog setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
        return this;
    }
}
