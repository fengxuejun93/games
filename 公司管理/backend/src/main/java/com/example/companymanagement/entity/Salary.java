package com.example.companymanagement.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("salary")
public class Salary {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long employeeId;
    
    private Long companyId;
    
    private String salaryMonth;
    
    private BigDecimal basicSalary;
    
    private BigDecimal bonus;
    
    private BigDecimal allowance;
    
    private BigDecimal deduction;
    
    private BigDecimal totalSalary;
    
    private Integer status;
    
    private String remark;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.UPDATE)
    private LocalDateTime updatedAt;
}