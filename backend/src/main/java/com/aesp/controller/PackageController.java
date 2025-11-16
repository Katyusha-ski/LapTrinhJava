package com.aesp.controller;

import com.aesp.dto.request.PackageRequest;
import com.aesp.dto.response.PackageResponse;
import com.aesp.dto.response.MessageResponse;
import com.aesp.service.PackageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PackageController {

    private final PackageService packageService;

    /** CREATE */
    @PostMapping
    public ResponseEntity<PackageResponse> createPackage(
            @Valid @RequestBody PackageRequest request) {

        PackageResponse response = packageService.createPackage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET ALL */
    @GetMapping
    public ResponseEntity<List<PackageResponse>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    /** GET ONE */
    @GetMapping("/{id}")
    public ResponseEntity<PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    /** UPDATE */
    @PutMapping("/{id}")
    public ResponseEntity<PackageResponse> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request) {

        PackageResponse response = packageService.updatePackage(id, request);
        return ResponseEntity.ok(response);
    }

    /** DELETE */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(new MessageResponse(true, "Xóa package thành công"));
    }

    /** UPDATE STATUS (ACTIVE / INACTIVE) */
    @PatchMapping("/{id}/status")
    public ResponseEntity<PackageResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        return ResponseEntity.ok(packageService.updateStatus(id, active));
    }
}
