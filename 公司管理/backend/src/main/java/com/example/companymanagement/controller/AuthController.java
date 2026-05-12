package com.example.companymanagement.controller;

import com.example.companymanagement.dto.LoginDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.dto.UserInfoDTO;
import com.example.companymanagement.service.AuthService;
import com.example.companymanagement.service.EmployeeService;
import com.example.companymanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO dto) {
        Map<String, Object> result = authService.login(dto);
        return Result.success(result);
    }
    
    @GetMapping("/info")
    public Result<UserInfoDTO> getUserInfo(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            Long userId = jwtUtil.getUserId(token);
            UserInfoDTO userInfo = employeeService.getUserInfo(userId);
            return Result.success(userInfo);
        }
        return Result.error(401, "未登录");
    }
    
    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success(null);
    }
}