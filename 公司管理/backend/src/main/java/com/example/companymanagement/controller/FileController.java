package com.example.companymanagement.controller;

import com.example.companymanagement.dto.Result;
import com.example.companymanagement.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @Autowired
    private FileService fileService;
    
    @PostMapping("/avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
        String url = fileService.uploadAvatar(file);
        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        return Result.success(result);
    }
    
    @GetMapping("/avatar/**")
    public ResponseEntity<byte[]> getAvatar(HttpServletRequest request) throws IOException {
        String requestUri = request.getRequestURI();
        String path = requestUri.replace("/api/files/", "");
        byte[] fileBytes = fileService.getFile(path);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(fileBytes);
    }
}