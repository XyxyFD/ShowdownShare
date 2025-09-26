package com.example.restapi.file;

import com.example.restapi.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_meta")
public class FileMeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
    @Column(name = "username_hash")
    private String usernameHash;
    @Enumerated(EnumType.STRING)
    private PokerSite site;
    @Column(name = "s3_key")
    private String s3Key;

    @Enumerated(EnumType.STRING)
    private FileStatus status;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;


    public FileMeta() {}

    public FileMeta(User owner, String usernameHash,
                    PokerSite site, String s3Key, FileStatus status, LocalDateTime uploadDate) {
        this.owner = owner;
        this.usernameHash = usernameHash;
        this.site = site;
        this.s3Key = s3Key;
        this.status = status;
        this.uploadDate = uploadDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }


    public String getUsernameHash() {
        return usernameHash;
    }

    public void setUsernameHash(String randomUsername) {
        this.usernameHash = randomUsername;
    }

    public PokerSite getSite() {
        return site;
    }

    public void setSite(PokerSite site) {
        this.site = site;
    }



    public String getS3Key() {
        return s3Key;
    }

    public void setS3Key(String s3Key) {
        this.s3Key = s3Key;
    }

    public FileStatus getStatus() {
        return status;
    }

    public void setStatus(FileStatus status) {
        this.status = status;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    // getters and setters...
}
