package com.example.companymanagement.dto;

import lombok.Data;

@Data
public class DepartmentDTO {
    private Long id;
    private Long companyId;
    private String name;
    private Long parentId;
    private Integer status;
}