package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Attendance;
import com.example.companymanagement.service.AttendanceService;
import com.example.companymanagement.service.ExcelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private ExcelService excelService;
    
    @GetMapping
    public Result<PageDTO<Attendance>> list(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long employeeId) {
        PageDTO<Attendance> page = attendanceService.list(companyId, pageNum, pageSize, startDate, endDate, employeeId);
        return Result.success(page);
    }
    
    @GetMapping("/{id}")
    public Result<Attendance> getById(@PathVariable Long id) {
        Attendance attendance = attendanceService.getById(id);
        return Result.success(attendance);
    }
    
    @PostMapping
    public Result<Attendance> create(@RequestBody Attendance attendance) {
        Attendance created = attendanceService.create(attendance);
        return Result.success("创建成功", created);
    }
    
    @PutMapping("/{id}")
    public Result<Attendance> update(@PathVariable Long id, @RequestBody Attendance attendance) {
        Attendance updated = attendanceService.update(id, attendance);
        return Result.success("更新成功", updated);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return Result.success("删除成功", null);
    }
    
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam Long companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        List<Attendance> attendanceList = attendanceService.getByCompanyIdAndDateRange(companyId, 
                startDate != null ? startDate : LocalDate.now().minusMonths(1), 
                endDate != null ? endDate : LocalDate.now());
        
        byte[] excelBytes = excelService.exportAttendance(attendanceList);
        
        String filename = "考勤记录_" + LocalDate.now().toString() + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}