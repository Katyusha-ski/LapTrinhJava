package com.aesp.controller;

import com.aesp.dto.request.AdaptiveAssessmentRequest;
import com.aesp.dto.request.StartQuizAttemptRequest;
import com.aesp.dto.request.SubmitQuizAnswersRequest;
import com.aesp.dto.response.AdaptiveAssessmentResponse;
import com.aesp.dto.response.QuestionEvaluationDto;
import com.aesp.dto.response.QuizAttemptResultResponse;
import com.aesp.dto.response.StartQuizAttemptResponse;
import com.aesp.dto.request.SubmitQuizAnswersRequest.AttemptAnswerPayload;
import com.aesp.entity.Answer;
import com.aesp.entity.Question;
import com.aesp.enums.EnglishLevel;
import com.aesp.enums.QuestionType;
import com.aesp.service.LearnerService;
import com.aesp.service.quiz.AdaptiveTestingService;
import com.aesp.service.quiz.QuizAttemptService;
import com.aesp.service.quiz.QuizBankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private static final int DEFAULT_QUESTION_COUNT = 10;

    private final QuizBankService quizBankService;
    private final QuizAttemptService quizAttemptService;
    private final AdaptiveTestingService adaptiveTestingService;
    private final LearnerService learnerService;

    @PostMapping("/attempts/start")
    public ResponseEntity<StartQuizAttemptResponse> startAttempt(
            @Valid @RequestBody StartQuizAttemptRequest request) {

        EnglishLevel targetLevel = resolveTargetLevel(request);
        QuestionType questionType = Optional.ofNullable(request.getQuestionType())
                .orElse(QuestionType.MULTIPLE_CHOICE);
        int questionCount = Optional.ofNullable(request.getQuestionCount())
                .filter(count -> count > 0)
                .orElse(DEFAULT_QUESTION_COUNT);
        Set<Long> excludedIds = request.getExcludeQuestionIds() != null
                ? new HashSet<>(request.getExcludeQuestionIds())
                : Collections.emptySet();

        List<Question> questions = quizBankService.getRandomQuestions(
                targetLevel,
                questionType,
                questionCount,
                excludedIds);

        List<StartQuizAttemptResponse.QuestionItem> questionItems = questions.stream()
                .map(this::mapQuestion)
                .toList();

        StartQuizAttemptResponse response = StartQuizAttemptResponse.builder()
                .targetLevel(targetLevel)
                .questionType(questionType)
                .questionCount(questionItems.size())
                .questions(questionItems)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/attempts/submit")
    public ResponseEntity<QuizAttemptResultResponse> submitAnswers(
            @Valid @RequestBody SubmitQuizAnswersRequest request) {

        List<QuizAttemptService.AttemptAnswer> attemptAnswers = request.getAnswers().stream()
                .map(this::toAttemptAnswer)
                .toList();

        QuizAttemptService.QuizAttemptResult result = quizAttemptService.evaluateAttempt(attemptAnswers);
        QuizAttemptResultResponse response = mapAttemptResult(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assessment")
    public ResponseEntity<AdaptiveAssessmentResponse> fetchAdaptiveResult(
            @Valid @RequestBody AdaptiveAssessmentRequest request) {

        QuizAttemptService.QuizAttemptResult attemptResult = toAttemptResult(request.getAttemptResult());

        AdaptiveTestingService.AdaptiveAssessmentResult assessment = adaptiveTestingService.estimateLevel(
                request.getStartingLevel(),
                attemptResult);

        AdaptiveAssessmentResponse response = AdaptiveAssessmentResponse.builder()
                .startingLevel(assessment.startingLevel())
                .baselineLevel(assessment.baselineLevel())
                .recommendedLevel(assessment.recommendedLevel())
                .totalQuestions(assessment.totalQuestions())
                .correctAnswers(assessment.correctAnswers())
                .accuracy(assessment.accuracy())
                .build();

        return ResponseEntity.ok(response);
    }

    private EnglishLevel resolveTargetLevel(StartQuizAttemptRequest request) {
        if (request.getTargetLevel() != null) {
            return request.getTargetLevel();
        }
                if (request.getLearnerId() != null) {
                        EnglishLevel learnerLevel = learnerService.getLearnerById(request.getLearnerId()).getEnglishLevel();
                        if (learnerLevel != null) {
                                return learnerLevel;
                        }
                }
                return EnglishLevel.B1;
    }

    private StartQuizAttemptResponse.QuestionItem mapQuestion(Question question) {
        List<Answer> answers = quizBankService.getAnswersForQuestion(question.getId());
        List<StartQuizAttemptResponse.AnswerOption> options = answers.stream()
                .map(answer -> new StartQuizAttemptResponse.AnswerOption(
                        answer.getId(),
                        answer.getAnswerText()))
                .toList();
        return new StartQuizAttemptResponse.QuestionItem(
                question.getId(),
                question.getQuestionText(),
                question.getCefrLevel(),
                question.getTopicArea(),
                options);
    }

    private QuizAttemptService.AttemptAnswer toAttemptAnswer(AttemptAnswerPayload payload) {
        return new QuizAttemptService.AttemptAnswer(payload.getQuestionId(), payload.getAnswerId());
    }

    private QuizAttemptResultResponse mapAttemptResult(QuizAttemptService.QuizAttemptResult result) {
        List<QuestionEvaluationDto> evaluations = result.evaluations().stream()
                .map(evaluation -> new QuestionEvaluationDto(
                        evaluation.questionId(),
                        evaluation.level(),
                        evaluation.correct()))
                .toList();

        return QuizAttemptResultResponse.builder()
                .evaluations(evaluations)
                .correctAnswers(result.correctAnswers())
                .totalQuestions(result.totalQuestions())
                .accuracy(result.accuracy())
                .build();
    }

    private QuizAttemptService.QuizAttemptResult toAttemptResult(AdaptiveAssessmentRequest.AttemptResultPayload payload) {
        List<QuizAttemptService.QuestionEvaluation> evaluations = payload.getEvaluations().stream()
                .map(evaluation -> new QuizAttemptService.QuestionEvaluation(
                        evaluation.getQuestionId(),
                        evaluation.getLevel(),
                        evaluation.isCorrect()))
                .toList();

        return new QuizAttemptService.QuizAttemptResult(
                evaluations,
                payload.getCorrectAnswers(),
                payload.getTotalQuestions(),
                payload.getAccuracy());
    }
}
