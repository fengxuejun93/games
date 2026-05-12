package com.example.companymanagement.dto;

import lombok.Data;

@Data
public class PositionDTO {
    private Long id;
    private Long companyId;
    private String name;
    private String description;
    private Integer status;
}