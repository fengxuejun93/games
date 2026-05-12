package com.example.companymanagement.dto;

import lombok.Data;

@Data
public class CompanyDTO {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private Integer status;
}