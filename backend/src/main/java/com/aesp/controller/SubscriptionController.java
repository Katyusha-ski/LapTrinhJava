package com.aesp.controller;

import com.aesp.dto.request.SubscriptionRequest;
import com.aesp.dto.response.SubscriptionResponse;
import com.aesp.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    /**
     * Create new subscription after payment
     */
    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(@Valid @RequestBody SubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get all subscriptions for a learner (history)
     */
    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptionsByLearner(@PathVariable Long learnerId) {
        List<SubscriptionResponse> subscriptions = subscriptionService.getSubscriptionsByLearner(learnerId);
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Get active subscription for a learner
     */
    @GetMapping("/learner/{learnerId}/active")
    public ResponseEntity<SubscriptionResponse> getActiveSubscription(@PathVariable Long learnerId) {
        SubscriptionResponse subscription = subscriptionService.getActiveSubscription(learnerId);
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Check if learner has active subscription
     */
    @GetMapping("/learner/{learnerId}/has-active")
    public ResponseEntity<Boolean> hasActiveSubscription(@PathVariable Long learnerId) {
        boolean hasActive = subscriptionService.hasActiveSubscription(learnerId);
        return ResponseEntity.ok(hasActive);
    }
    
    /**
     * Get subscription by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(@PathVariable Long id) {
        SubscriptionResponse subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Cancel subscription
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelSubscription(@PathVariable Long id) {
        subscriptionService.cancelSubscription(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Renew subscription with new end date
     */
    @PutMapping("/{id}/renew")
    public ResponseEntity<SubscriptionResponse> renewSubscription(
            @PathVariable Long id,
            @RequestParam LocalDate newEndDate) {
        SubscriptionResponse response = subscriptionService.renewSubscription(id, newEndDate);
        return ResponseEntity.ok(response);
    }
}
