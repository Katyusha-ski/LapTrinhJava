package com.aesp.dto.request;

import com.aesp.enums.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentStatusUpdateRequest {
    @NotNull
    private SubscriptionStatus status;
}
