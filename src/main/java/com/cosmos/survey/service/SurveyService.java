package com.cosmos.survey.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.cosmos.survey.entity.Survey;
import com.cosmos.survey.exception.ResourceNotFoundException;
import com.cosmos.survey.repository.SurveyRepository;

@Service
public class SurveyService {
    private final SurveyRepository surveyRepository;

    public SurveyService(SurveyRepository surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    public Survey createSurvey(Survey survey) {
        survey.getInputs().forEach(input -> input.setSurvey(survey));
        // Ensure the survey inputs are linked to the survey
        return surveyRepository.save(survey);
    }

    public List<Survey> getAllSurveys() {
        return surveyRepository.findAll();
    }

    public Optional<Survey> getSurvey(Long id) {
        return surveyRepository.findById(id);
    }

    public Survey updateSurvey(Long id, Survey updatedSurvey) {
        Survey survey = surveyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Survey not found with id: " + id));
        survey.setTitle(updatedSurvey.getTitle());
        survey.setInputs(updatedSurvey.getInputs());
        return surveyRepository.save(survey);
    }

    public void deleteSurvey(Long id) {
        surveyRepository.deleteById(id);
    }
}

