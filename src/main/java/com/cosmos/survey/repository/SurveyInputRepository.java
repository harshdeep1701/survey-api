package com.cosmos.survey.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cosmos.survey.entity.SurveyInput;

public interface SurveyInputRepository extends JpaRepository<SurveyInput, Long> {}
