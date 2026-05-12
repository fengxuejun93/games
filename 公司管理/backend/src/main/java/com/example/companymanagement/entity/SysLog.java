package com.example.companymanagement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_log")
public class SysLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long employeeId;
    
    private String employeeName;
    
    private Long companyId;
    
    private String module;
    
    private String operation;
    
    private String ip;
    
    private String userAgent;
    
    private Integer status;
    
    private String errorMsg;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}