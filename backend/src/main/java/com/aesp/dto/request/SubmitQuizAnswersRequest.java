package com.aesp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitQuizAnswersRequest {

    @NotEmpty
    @Valid
    private List<AttemptAnswerPayload> answers;

    @Data
    public static class AttemptAnswerPayload {
        @NotNull
        private Long questionId;

        @NotNull
        private Long answerId;
    }
}
