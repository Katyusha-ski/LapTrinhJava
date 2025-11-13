package com.aesp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageRequest {
    @NotBlank(message = "Package name không được null")
    private String name;

    private String description;

    @NotNull(message = "Price không được null")
    @Min(value = 0, message = "Price không được âm")
    private BigDecimal price;

    @NotNull(message = "Duration không được null")
    @Min(value = 1, message = "Duration phải lớn hơn 0")
    private Integer durationDays;

    private List<String> features;

    private Boolean isActive = true;
}
