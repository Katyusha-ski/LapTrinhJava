package com.aesp.controller;

import com.aesp.dto.request.PaymentStatusUpdateRequest;
import com.aesp.dto.response.SubscriptionResponse;
import com.aesp.enums.SubscriptionStatus;
import com.aesp.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/subscriptions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubscriptionResponse>> listSubscriptions(
            @RequestParam(required = false) Long learnerId,
            @RequestParam(required = false) Long packageId,
            @RequestParam(required = false) SubscriptionStatus status
    ) {
        List<SubscriptionResponse> list = subscriptionService.adminListSubscriptions(learnerId, packageId, status);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/subscriptions/{id}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubscriptionResponse> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody PaymentStatusUpdateRequest request
    ) {
        SubscriptionResponse updated = subscriptionService.adminUpdatePaymentStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
