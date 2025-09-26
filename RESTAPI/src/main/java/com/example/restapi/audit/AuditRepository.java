package com.example.restapi.audit;

import com.example.restapi.file.FileMeta;
import com.example.restapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AuditRepository extends JpaRepository<AuditLog, Long> {


    @Query("""
           select distinct a.file
           from AuditLog a
           where a.user = :user
             and a.action = com.example.restapi.audit.ActionType.DOWNLOAD
           order by a.timestamp desc
           """)
    List<FileMeta> findDownloadedFilesByUser(User user);

    @Query("""
    select f
    from FileMeta f
    where f.status = com.example.restapi.file.FileStatus.APPROVED
      and f.owner <> :user
      and not exists (
          select 1
          from AuditLog a
          where a.file = f
            and a.user = :user
            and a.action = com.example.restapi.audit.ActionType.DOWNLOAD
      )
      and not exists (
          select 1
          from AuditLog a2
          where a2.file = f
            and a2.user = :user
            and a2.action = com.example.restapi.audit.ActionType.UPLOAD
      )
    order by f.uploadDate desc
    """)
    List<FileMeta> findUnseenFilesByUser(User user);

    @Query("""
    select count(f)
    from FileMeta f
    where f.status = com.example.restapi.file.FileStatus.APPROVED
      and f.owner <> :user
      and not exists (
          select 1
          from AuditLog a
          where a.file = f
            and a.user = :user
            and a.action = com.example.restapi.audit.ActionType.DOWNLOAD
      )
      and not exists (
          select 1
          from AuditLog a2
          where a2.file = f
            and a2.user = :user
            and a2.action = com.example.restapi.audit.ActionType.UPLOAD
      )
    """)
    Long countUnseenFilesByUser(User user);







}
