package com.example.restapi.admin;

import com.example.restapi.file.FileMeta;
import com.example.restapi.file.FileRepository;
import com.example.restapi.file.FileStatus;
import com.example.restapi.user.UserRepository;
import com.example.restapi.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {

    private final FileRepository fileRepository;

    private final UserRepository userRepository;

    public AdminService(FileRepository fileRepository, UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    public List<FileMeta> listFilesForAdmin(FileStatus status) {
        if (status == null) return fileRepository.findAll();
        return fileRepository.findByStatus(status);
    }

    public void changeStatus(Long id, FileStatus status){
        FileMeta file = fileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("File not found: " + id));
        file.setStatus(status);
        fileRepository.save(file);

    }
    public List<User> listUsers(){
        return userRepository.findAll();
    }

    public List<FileMeta> allFilesUploadedByUser(User user){
        return fileRepository.findFilesUserUploadedOrderByLastUploadDesc(user);
    }

}
