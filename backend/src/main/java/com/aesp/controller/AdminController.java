package com.aesp.controller;

import com.aesp.dto.response.AdminMetricsResponse;
import com.aesp.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminMetricsResponse> getMetrics() {
        AdminMetricsResponse metrics = adminService.getPlatformMetrics();
        return ResponseEntity.ok(metrics);
    }
}
