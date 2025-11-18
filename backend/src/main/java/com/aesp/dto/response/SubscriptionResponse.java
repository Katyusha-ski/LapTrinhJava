package com.aesp.dto.response;

import com.aesp.enums.PaymentMethod;
import com.aesp.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {
    
    private Long id;
    
    private Long learnerId;
    
    private String learnerName;
    
    private Long packageId;
    
    private String packageName;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private SubscriptionStatus status;
    
    private BigDecimal paymentAmount;
    
    private PaymentMethod paymentMethod;
    
    private LocalDate paymentDate;
    
    private LocalDateTime createdAt;
}
