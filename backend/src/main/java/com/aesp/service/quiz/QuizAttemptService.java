package com.aesp.service.quiz;

import com.aesp.entity.Answer;
import com.aesp.entity.Question;
import com.aesp.enums.EnglishLevel;
import com.aesp.enums.QuestionType;
import com.aesp.repository.AnswerRepository;
import com.aesp.repository.QuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizAttemptService {

    private final QuizBankService quizBankService;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public Question pickNextQuestion(EnglishLevel targetLevel, QuestionType questionType, Set<Long> askedQuestionIds) {
        Set<Long> excluded = askedQuestionIds != null ? askedQuestionIds : Collections.emptySet();
        List<Question> candidates = quizBankService.getRandomQuestions(targetLevel, questionType, 1, excluded);
        return candidates.get(0);
    }

    public boolean isAnswerCorrect(Long questionId, Long answerId) {
        Objects.requireNonNull(questionId, "Question id must not be null");
        Objects.requireNonNull(answerId, "Answer id must not be null");

        Answer answer = answerRepository.findByIdAndQuestionId(answerId, questionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Answer %d does not belong to question %d".formatted(answerId, questionId)));
        return answer.isCorrect();
    }

    public QuizAttemptResult evaluateAttempt(List<AttemptAnswer> submittedAnswers) {
        if (submittedAnswers == null || submittedAnswers.isEmpty()) {
            throw new IllegalArgumentException("Submitted answers must not be empty");
        }

        List<QuestionEvaluation> evaluations = new ArrayList<>();
        int correctCount = 0;

        for (AttemptAnswer attempt : submittedAnswers) {
            Question question = questionRepository.findById(attempt.questionId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Question %d not found".formatted(attempt.questionId())));

            Answer answer = answerRepository.findByIdAndQuestionId(attempt.answerId(), question.getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Answer %d not valid for question %d".formatted(attempt.answerId(), question.getId())));

            boolean correct = answer.isCorrect();
            if (correct) {
                correctCount++;
            }
            evaluations.add(new QuestionEvaluation(question.getId(), question.getCefrLevel(), correct));
        }

        int totalQuestions = submittedAnswers.size();
        double accuracy = totalQuestions == 0 ? 0.0 : (double) correctCount / totalQuestions;

        return new QuizAttemptResult(List.copyOf(evaluations), correctCount, totalQuestions, accuracy);
    }

    public record AttemptAnswer(Long questionId, Long answerId) {}

    public record QuestionEvaluation(Long questionId, EnglishLevel level, boolean correct) {}

    public record QuizAttemptResult(List<QuestionEvaluation> evaluations,
                                    int correctAnswers,
                                    int totalQuestions,
                                    double accuracy) {}
}
