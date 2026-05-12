package com.example.companymanagement.dto;

import lombok.Data;

@Data
public class EmployeeDTO {
    private Long id;
    private Long companyId;
    private Long departmentId;
    private Long positionId;
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    private String avatar;
    private Integer status;
}