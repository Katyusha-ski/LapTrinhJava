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
public class QuizBankService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public Question getQuestion(Long questionId) {
        Objects.requireNonNull(questionId, "Question id must not be null");
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question %d not found".formatted(questionId)));
    }

    public List<Question> getQuestionsByLevel(EnglishLevel level) {
        Objects.requireNonNull(level, "English level must not be null");
        return questionRepository.findByCefrLevel(level);
    }

    public Question getRandomQuestion(EnglishLevel level, QuestionType type) {
        List<Question> candidates = getRandomQuestions(level, type, 1, Collections.emptySet());
        return candidates.get(0);
    }

    public List<Question> getRandomQuestions(EnglishLevel level, QuestionType type, int limit, Set<Long> excludedIds) {
        Objects.requireNonNull(level, "English level must not be null");
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than zero");
        }

        List<Question> pool = type != null
                ? questionRepository.findByCefrLevelAndQuestionType(level, type)
                : questionRepository.findByCefrLevel(level);

        if (excludedIds != null && !excludedIds.isEmpty()) {
            pool = pool.stream()
                    .filter(question -> !excludedIds.contains(question.getId()))
                    .toList();
        }

        if (pool.isEmpty()) {
            throw new EntityNotFoundException("No questions available for level %s".formatted(level));
        }

        if (pool.size() <= limit) {
            return List.copyOf(pool);
        }

        List<Question> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, limit);
    }

    public Map<EnglishLevel, Long> getQuestionCountsByLevel() {
        Map<EnglishLevel, Long> counts = new EnumMap<>(EnglishLevel.class);
        for (EnglishLevel level : EnglishLevel.values()) {
            counts.put(level, questionRepository.countByCefrLevel(level));
        }
        return counts;
    }

    public List<Answer> getAnswersForQuestion(Long questionId) {
        Objects.requireNonNull(questionId, "Question id must not be null");
        ensureQuestionExists(questionId);
        return answerRepository.findByQuestionId(questionId);
    }

    public boolean hasMinimumCoveragePerLevel(int minimumPerLevel) {
        if (minimumPerLevel <= 0) {
            throw new IllegalArgumentException("Minimum per level must be greater than zero");
        }
        return Arrays.stream(EnglishLevel.values())
                .allMatch(level -> questionRepository.countByCefrLevel(level) >= minimumPerLevel);
    }

    @Transactional
    public Question saveQuestion(Question question) {
        Objects.requireNonNull(question, "Question must not be null");
        if (question.getAnswers() != null) {
            long correctCount = question.getAnswers().stream()
                    .peek(answer -> answer.setQuestion(question))
                    .filter(Answer::isCorrect)
                    .count();
            if (correctCount == 0) {
                throw new IllegalArgumentException("Question must have at least one correct answer");
            }
        }
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question existing = getQuestion(questionId);
        questionRepository.delete(Objects.requireNonNull(existing));
    }

    private void ensureQuestionExists(Long questionId) {
        Objects.requireNonNull(questionId, "Question id must not be null");
        if (!questionRepository.existsById(questionId)) {
            throw new EntityNotFoundException("Question %d not found".formatted(questionId));
        }
    }
}
