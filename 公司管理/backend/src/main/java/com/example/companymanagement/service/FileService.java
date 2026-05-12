package com.example.companymanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileService {
    
    @Value("${file.upload-path:./uploads}")
    private String uploadPath;
    
    public String uploadAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("请选择要上传的文件");
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String fileName = UUID.randomUUID().toString() + extension;
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path dirPath = Paths.get(uploadPath, "avatar", dateDir);
        
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }
        
        Path filePath = dirPath.resolve(fileName);
        file.transferTo(filePath.toFile());
        
        return "/api/files/avatar/" + dateDir + "/" + fileName;
    }
    
    public byte[] getFile(String filePath) throws IOException {
        Path path = Paths.get(uploadPath, filePath);
        if (!Files.exists(path)) {
            throw new RuntimeException("文件不存在");
        }
        return Files.readAllBytes(path);
    }
}