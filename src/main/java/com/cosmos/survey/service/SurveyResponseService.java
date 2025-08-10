package com.cosmos.survey.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cosmos.survey.dto.SurveyResponseSaveRequest;
import com.cosmos.survey.dto.UserInputDTO;
import com.cosmos.survey.entity.Survey;
import com.cosmos.survey.entity.SurveyInput;
import com.cosmos.survey.entity.SurveyResponse;
import com.cosmos.survey.entity.UserInput;
import com.cosmos.survey.entity.types.InputType;
import com.cosmos.survey.repository.SurveyRepository;
import com.cosmos.survey.repository.SurveyResponseRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class SurveyResponseService {
    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyRepository surveyRepository;

    public SurveyResponseService(SurveyResponseRepository surveyResponseRepository, SurveyRepository surveyRepository) {
        this.surveyResponseRepository = surveyResponseRepository;
        this.surveyRepository = surveyRepository;
    }

    @Transactional
    public SurveyResponse submitResponse(Long surveyId, SurveyResponseSaveRequest request, MultipartFile files) {
        Survey survey = findSurveyOrThrow(surveyId);
        SurveyResponse response = createSurveyResponse(survey);

        Map<Long, UserInputDTO> inputDtoMap = mapUserInputsById(request);
        List<UserInput> userInputs = buildUserInputs(survey, inputDtoMap, response, files);

        response.setUserInputs(userInputs);
        return saveSurveyResponse(response);
    }

    private Survey findSurveyOrThrow(Long surveyId) {
        return surveyRepository.findById(surveyId)
                .orElseThrow(() -> new EntityNotFoundException("Survey not found"));
    }

    private SurveyResponse createSurveyResponse(Survey survey) {
        SurveyResponse response = new SurveyResponse();
        response.setSurvey(survey);
        return response;
    }

    private Map<Long, UserInputDTO> mapUserInputsById(SurveyResponseSaveRequest request) {
        return request.getUserInputs().stream()
                .collect(Collectors.toMap(UserInputDTO::getInputId, Function.identity()));
    }

    private List<UserInput> buildUserInputs(Survey survey, Map<Long, UserInputDTO> inputDtoMap, SurveyResponse response,
            MultipartFile file) {
        List<UserInput> userInputs = new ArrayList<>();
        for (SurveyInput input : survey.getInputs()) {
            UserInputDTO dto = inputDtoMap.get(input.getId());
            validateRequiredInput(input, dto);
            if (dto != null) {
                userInputs.add(createUserInput(input, dto, response, file));
            }
        }
        return userInputs;
    }

    private void validateRequiredInput(SurveyInput input, UserInputDTO dto) {
        if (!input.isRequired())
            return;

        boolean missing = false;
        switch (input.getType()) {
            case TEXT:
            case RADIO:
            case DROPDOWN:
            case CHECKBOX:
            case FILE:
                if (dto == null || dto.getValue() == null || dto.getValue().trim().isEmpty()) {
                    missing = true;
                }
                break;
        }
        if (missing) {
            throw new IllegalArgumentException("Required input missing for: " + input.getLabel());
        }
    }

    private UserInput createUserInput(SurveyInput input, UserInputDTO dto, SurveyResponse response,
            MultipartFile file) {
        UserInput userInput = new UserInput();
        userInput.setInput(input);
        userInput.setValue(dto.getValue());
        userInput.setResponse(response);
        if (InputType.FILE.equals(input.getType())) {
            if (file != null) {
                userInput.setFileName(file.getOriginalFilename());
                userInput.setFileType(file.getContentType());
                try {
                    userInput.setFileData(file.getBytes());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to read file data for: " + file.getOriginalFilename(), e);
                }
            }
        }

        return userInput;
    }

    private SurveyResponse saveSurveyResponse(SurveyResponse response) {
        return surveyResponseRepository.save(response);
    }

    public List<SurveyResponse> getResponses(Long surveyId) {
        return surveyResponseRepository.findAll().stream()
                .filter(resp -> resp.getSurvey().getId().equals(surveyId))
                .collect(Collectors.toList());
    }
}
