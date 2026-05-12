package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.entity.SysLog;
import com.example.companymanagement.mapper.SysLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SysLogService {
    
    @Autowired
    private SysLogMapper sysLogMapper;
    
    public PageDTO<SysLog> list(Long companyId, int pageNum, int pageSize, 
                                LocalDateTime startTime, LocalDateTime endTime, String module) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysLog> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        if (companyId != null) {
            query.eq(SysLog::getCompanyId, companyId);
        }
        
        if (startTime != null) {
            query.ge(SysLog::getCreatedAt, startTime);
        }
        if (endTime != null) {
            query.le(SysLog::getCreatedAt, endTime);
        }
        if (module != null && !module.isEmpty()) {
            query.like(SysLog::getModule, module);
        }
        
        query.orderByDesc(SysLog::getCreatedAt);
        
        List<SysLog> records = sysLogMapper.selectList(query);
        long total = sysLogMapper.selectCount(query);
        
        int start = (pageNum - 1) * pageSize;
        int end = Math.min(start + pageSize, records.size());
        List<SysLog> pageRecords = start < records.size() ? records.subList(start, end) : List.of();
        
        return new PageDTO<>(pageRecords, total, pageSize, pageNum);
    }
    
    @Async
    public void saveLog(Long employeeId, String employeeName, Long companyId, 
                        String module, String operation, HttpServletRequest request, 
                        Integer status, String errorMsg) {
        SysLog log = new SysLog();
        log.setEmployeeId(employeeId);
        log.setEmployeeName(employeeName);
        log.setCompanyId(companyId);
        log.setModule(module);
        log.setOperation(operation);
        log.setIp(getClientIp(request));
        log.setUserAgent(request.getHeader("User-Agent"));
        log.setStatus(status);
        log.setErrorMsg(errorMsg);
        
        sysLogMapper.insert(log);
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
    
    public List<SysLog> getByCompanyIdAndTimeRange(Long companyId, LocalDateTime startTime, LocalDateTime endTime) {
        return sysLogMapper.selectByCompanyIdAndTimeRange(companyId, startTime, endTime);
    }
}