package com.example.companymanagement.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoleDTO {
    private Long id;
    private Long companyId;
    private String name;
    private String code;
    private String description;
    private Integer status;
    private List<Long> permissionIds;
}