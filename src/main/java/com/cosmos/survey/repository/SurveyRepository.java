package com.cosmos.survey.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cosmos.survey.entity.Survey;

public interface SurveyRepository extends JpaRepository<Survey, Long> {}