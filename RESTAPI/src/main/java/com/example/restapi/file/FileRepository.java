package com.example.restapi.file;

import com.example.restapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface FileRepository extends JpaRepository<FileMeta, Long> {
    List<FileMeta> findByStatus(FileStatus status);

    @Query("""
        select a.file
        from AuditLog a
        where a.user = :user
          and a.action = com.example.restapi.audit.ActionType.UPLOAD
          and a.timestamp = (
              select max(a2.timestamp)
              from AuditLog a2
              where a2.file = a.file
                and a2.user = :user
                and a2.action = com.example.restapi.audit.ActionType.UPLOAD
          )
        order by a.timestamp desc
    """)
    List<FileMeta> findFilesUserUploadedOrderByLastUploadDesc(User user);



}
