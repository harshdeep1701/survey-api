package com.cosmos.survey.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cosmos.survey.entity.SurveyResponse;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {}