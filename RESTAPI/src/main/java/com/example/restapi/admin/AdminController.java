package com.example.restapi.admin;


import com.example.restapi.file.FileMeta;
import com.example.restapi.file.FileService;
import com.example.restapi.file.FileStatus;
import com.example.restapi.user.UserRepository;
import com.example.restapi.user.User;
import com.example.restapi.user.UserDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    private final AdminService adminService;



    public AdminController(UserRepository userRepository, AdminService adminService) {
        this.userRepository = userRepository;
        this.adminService = adminService;
    }


    @GetMapping("/files")
    public ResponseEntity<List<FileMetaDto>> listFilesForAdmin(
            @RequestParam(required = false) FileStatus status){

        List<FileMeta> files = adminService.listFilesForAdmin(status);
        List<FileMetaDto> dto = files.stream()
                .map(FileMetaDto::from)
                .toList();
        return ResponseEntity.ok(dto);
    }




    @PostMapping("/files/{id}/approve")
    public ResponseEntity<Void> approve(
            @RequestParam String status,
            @PathVariable Long id
    ) {
        if(status.equals("APPROVED")){
            adminService.changeStatus(id, FileStatus.APPROVED);
        }else if(status.equals("REJECT")){
            adminService.changeStatus(id, FileStatus.REJECTED);
        }else{
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unknown status: " + status
            );
        }

        return ResponseEntity.noContent().build();
    }


    // enable is for logging in
    @PostMapping("/users/disable")
    public ResponseEntity<Void> disable(@RequestParam Long id){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + id));

        user.setEnabled(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/enable")
    public ResponseEntity<Void> enable(@RequestParam Long id){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + id));

        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }


    // block means a user can log in but cannot download any hands yet
    @PostMapping("/users/block")
    public ResponseEntity<Void> blockUser(@RequestParam Long id){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + id));

        user.setBlocked(true);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/unblock")
    public ResponseEntity<Void> unblockUser(@RequestParam Long id){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + id));

        user.setBlocked(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers(){
        List<User> users = adminService.listUsers();
        List<UserDto> dto = users.stream()
                .map(UserDto::from)
                .toList();
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/users/files")
    public ResponseEntity<List<FileMetaDto>> listAllFilesByUser(@RequestParam() String username){

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User nicht gefunden: " + username));

        List<FileMeta> files = adminService.allFilesUploadedByUser(user);
        List<FileMetaDto> dto = files.stream()
                .map(FileMetaDto::from)
                .toList();
        return ResponseEntity.ok(dto);
    }
}
