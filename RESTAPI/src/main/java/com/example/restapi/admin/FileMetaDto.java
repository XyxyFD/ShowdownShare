package com.example.restapi.admin;

import com.example.restapi.file.FileMeta;
import org.springframework.util.StringUtils;

public record FileMetaDto(
        Long id,
        String filename,
        String ownerUsername,
        String status,
        String uploadDate
) {

    public static FileMetaDto from(FileMeta f) {
        String displayName = StringUtils.getFilename(f.getS3Key()); // holt "HH_2025-08-10.zip"
        if (displayName == null) displayName = f.getS3Key();
        return new FileMetaDto(
                f.getId(),
                displayName,
                f.getOwner().getUsername(),
                f.getStatus().name(),
                f.getUploadDate().toString()
        );
    }
}