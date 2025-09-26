package com.example.restapi;

import com.example.restapi.s3.S3Bucket;
import com.example.restapi.s3.S3Service;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class RestapiApplication {



    public static void main(String[] args) {
        SpringApplication.run(RestapiApplication.class, args);
    }




}
