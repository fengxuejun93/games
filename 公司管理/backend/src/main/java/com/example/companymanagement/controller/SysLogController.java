package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.SysLog;
import com.example.companymanagement.service.ExcelService;
import com.example.companymanagement.service.SysLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class SysLogController {
    
    @Autowired
    private SysLogService sysLogService;
    
    @Autowired
    private ExcelService excelService;
    
    @GetMapping
    public Result<PageDTO<SysLog>> list(
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) String module) {
        PageDTO<SysLog> page = sysLogService.list(companyId, pageNum, pageSize, startTime, endTime, module);
        return Result.success(page);
    }
    
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) throws IOException {
        List<SysLog> logs = sysLogService.getByCompanyIdAndTimeRange(companyId, 
                startTime != null ? startTime : LocalDateTime.now().minusDays(7), 
                endTime != null ? endTime : LocalDateTime.now());
        
        byte[] excelBytes = excelService.exportLogs(logs);
        
        String filename = "系统日志_" + LocalDateTime.now().toString().replace(":", "-") + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}