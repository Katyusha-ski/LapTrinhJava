package com.aesp.repository;

import com.aesp.entity.Question;
import com.aesp.enums.EnglishLevel;
import com.aesp.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCefrLevel(EnglishLevel level);

    List<Question> findByCefrLevelAndQuestionType(EnglishLevel level, QuestionType questionType);

    long countByCefrLevel(EnglishLevel level);

    boolean existsByQuestionTextIgnoreCase(String questionText);
}
