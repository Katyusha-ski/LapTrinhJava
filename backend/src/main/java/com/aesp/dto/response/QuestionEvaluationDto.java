package com.aesp.dto.response;

import com.aesp.enums.EnglishLevel;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionEvaluationDto {

    @NotNull
    private Long questionId;

    @NotNull
    private EnglishLevel level;

    private boolean correct;
}
