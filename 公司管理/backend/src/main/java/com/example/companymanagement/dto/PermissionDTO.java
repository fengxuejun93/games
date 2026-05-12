package com.example.companymanagement.dto;

import lombok.Data;

@Data
public class PermissionDTO {
    private Long id;
    private String name;
    private String code;
    private Long parentId;
    private Integer type;
    private String path;
    private String icon;
    private Integer sort;
    private Integer status;
}