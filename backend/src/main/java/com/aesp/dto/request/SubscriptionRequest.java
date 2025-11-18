package com.aesp.dto.request;

import com.aesp.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {
    
    @NotNull(message = "Learner ID is required")
    private Long learnerId;
    
    @NotNull(message = "Package ID is required")
    private Long packageId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotNull(message = "Payment amount is required")
    private BigDecimal paymentAmount;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
