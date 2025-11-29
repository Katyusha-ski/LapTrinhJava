package com.aesp.service;

import com.aesp.dto.request.SubscriptionRequest;
import com.aesp.dto.response.SubscriptionResponse;
import com.aesp.entity.Learner;
import com.aesp.entity.Package;
import com.aesp.entity.Subscription;
import com.aesp.enums.SubscriptionStatus;
import com.aesp.exception.ResourceNotFoundException;
import com.aesp.repository.LearnerRepository;
import com.aesp.repository.PackageRepository;
import com.aesp.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final LearnerRepository learnerRepository;
    private final PackageRepository packageRepository;
    
    /**
     * Create new subscription after payment
     */
    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest request) {
        Learner learner = learnerRepository.findById(request.getLearnerId())
            .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + request.getLearnerId()));
        
        Package pkg = packageRepository.findById(request.getPackageId())
            .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + request.getPackageId()));
        
        // Check if learner already has active subscription
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findByLearnerIdAndStatus(request.getLearnerId(), SubscriptionStatus.ACTIVE);
        
        // Cancel existing active subscriptions (business rule: only one active subscription per learner)
        for (Subscription activeSub : activeSubscriptions) {
            activeSub.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(activeSub);
        }
        
        Subscription subscription = new Subscription();
        subscription.setLearner(learner);
        subscription.setPackageEntity(pkg);
        subscription.setStartDate(request.getStartDate().atStartOfDay());
        subscription.setEndDate(request.getEndDate().atStartOfDay());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setPaymentAmount(request.getPaymentAmount());
        subscription.setPaymentMethod(request.getPaymentMethod());
        subscription.setPaymentDate(LocalDateTime.now());
        subscription.setCreatedAt(LocalDateTime.now());
        
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        return toResponse(savedSubscription);
    }
    
    /**
     * Get all subscriptions for a learner (history)
     */
    public List<SubscriptionResponse> getSubscriptionsByLearner(Long learnerId) {
        if (!learnerRepository.existsById(learnerId)) {
            throw new ResourceNotFoundException("Learner not found with id: " + learnerId);
        }
        
        List<Subscription> subscriptions = subscriptionRepository.findByLearnerId(learnerId);
        return subscriptions.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get active subscription for a learner
     */
    public SubscriptionResponse getActiveSubscription(Long learnerId) {
        if (!learnerRepository.existsById(learnerId)) {
            throw new ResourceNotFoundException("Learner not found with id: " + learnerId);
        }
        
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findByLearnerIdAndStatus(learnerId, SubscriptionStatus.ACTIVE);
        
        if (activeSubscriptions.isEmpty()) {
            throw new ResourceNotFoundException("No active subscription found for learner id: " + learnerId);
        }
        
        // Return the most recent active subscription
        Subscription activeSubscription = activeSubscriptions.stream()
            .max((s1, s2) -> s1.getCreatedAt().compareTo(s2.getCreatedAt()))
            .orElseThrow();
        
        return toResponse(activeSubscription);
    }
    
    /**
     * Check if learner has active subscription
     */
    public boolean hasActiveSubscription(Long learnerId) {
        if (!learnerRepository.existsById(learnerId)) {
            return false;
        }
        
        List<Subscription> activeSubscriptions = subscriptionRepository
            .findByLearnerIdAndStatus(learnerId, SubscriptionStatus.ACTIVE);
        
        return !activeSubscriptions.isEmpty();
    }
    
    /**
     * Cancel subscription
     */
    @Transactional
    public void cancelSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscriptionRepository.save(subscription);
    }
    
    /**
     * Renew subscription with new end date
     */
    @Transactional
    public SubscriptionResponse renewSubscription(Long subscriptionId, LocalDate newEndDate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));
        
        subscription.setEndDate(newEndDate.atStartOfDay());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        return toResponse(savedSubscription);
    }
    
    /**
     * Get subscription by ID
     */
    public SubscriptionResponse getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        
        return toResponse(subscription);
    }

    /**
     * Admin: list subscriptions with optional filters
     */
    public List<SubscriptionResponse> adminListSubscriptions(Long learnerId, Long packageId, SubscriptionStatus status) {
        List<Subscription> subscriptions;

        if (learnerId != null) {
            if (packageId != null && status != null) {
                Optional<Subscription> opt = subscriptionRepository.findByLearnerWithPackageAndStatus(learnerId, packageId, status);
                subscriptions = opt.map(List::of).orElse(List.of());
            } else if (packageId != null) {
                subscriptions = subscriptionRepository.findByPackageEntity_Id(packageId);
            } else if (status != null) {
                subscriptions = subscriptionRepository.findByStatus(status);
            } else {
                subscriptions = subscriptionRepository.findSubscriptionHistoryByLearner(learnerId);
            }
        } else if (packageId != null) {
            if (status != null) {
                subscriptions = subscriptionRepository.findByStatus(status).stream()
                    .filter(s -> s.getPackageEntity().getId().equals(packageId))
                    .toList();
            } else {
                subscriptions = subscriptionRepository.findByPackageEntity_Id(packageId);
            }
        } else if (status != null) {
            subscriptions = subscriptionRepository.findByStatus(status);
        } else {
            subscriptions = subscriptionRepository.findAll();
        }

        return subscriptions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Admin: update payment/status of a subscription
     * Note: no schema changes; we only update the existing `status` and paymentDate if necessary.
     */
    @Transactional
    public SubscriptionResponse adminUpdatePaymentStatus(Long subscriptionId, SubscriptionStatus newStatus) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        SubscriptionStatus old = subscription.getStatus();

        // If activating this subscription, enforce business rule: only one active subscription per learner
        if (newStatus == SubscriptionStatus.ACTIVE) {
            Long learnerId = subscription.getLearner().getId();
            List<Subscription> activeSubscriptions = subscriptionRepository.findByLearnerIdAndStatus(learnerId, SubscriptionStatus.ACTIVE);
            for (Subscription s : activeSubscriptions) {
                if (!s.getId().equals(subscriptionId)) {
                    s.setStatus(SubscriptionStatus.CANCELLED);
                    subscriptionRepository.save(s);
                }
            }

            subscription.setStatus(SubscriptionStatus.ACTIVE);
            if (subscription.getPaymentDate() == null) {
                subscription.setPaymentDate(LocalDateTime.now());
            }
        } else {
            subscription.setStatus(newStatus);
        }

        Subscription saved = subscriptionRepository.save(subscription);

        // Log the status change for lightweight audit (structured log)
        // (Do not throw if logging fails)
        try {
            org.slf4j.LoggerFactory.getLogger(SubscriptionService.class)
                .info("Admin changed subscription status: subscriptionId={}, from={}, to={}", subscriptionId, old, newStatus);
        } catch (Exception ignored) {}

        return toResponse(saved);
    }
    
    /**
     * Convert entity to response DTO
     */
    private SubscriptionResponse toResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
            .id(subscription.getId())
            .learnerId(subscription.getLearner().getId())
            .learnerName(subscription.getLearner().getUser().getFullName())
            .packageId(subscription.getPackageEntity().getId())
            .packageName(subscription.getPackageEntity().getName())
            .startDate(subscription.getStartDate() == null ? null : subscription.getStartDate().toLocalDate())
            .endDate(subscription.getEndDate() == null ? null : subscription.getEndDate().toLocalDate())
            .status(subscription.getStatus())
            .paymentAmount(subscription.getPaymentAmount())
            .paymentMethod(subscription.getPaymentMethod())
            .paymentDate(subscription.getPaymentDate() == null ? null : subscription.getPaymentDate().toLocalDate())
            .createdAt(subscription.getCreatedAt())
            .build();
    }
}
