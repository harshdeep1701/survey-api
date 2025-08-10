package com.cosmos.survey.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cosmos.survey.dto.SurveyResponseSaveRequest;
import com.cosmos.survey.dto.SurveyUploadRequest;
import com.cosmos.survey.entity.SurveyResponse;
import com.cosmos.survey.service.SurveyResponseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/surveys/{surveyId}/responses")
public class SurveyResponseController {
    private final SurveyResponseService surveyResponseService;

    public SurveyResponseController(SurveyResponseService surveyResponseService) {
        this.surveyResponseService = surveyResponseService;
    }

    @Operation(
    summary = "Submit survey response",
    description = "Submit a survey response with optional file attachment.",
    requestBody = @RequestBody(
        required = true,
        content = @Content(
            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
            schema = @Schema(implementation = SurveyUploadRequest.class),
            encoding = {
                @Encoding(name = "response", contentType = "application/json")
            }
        )
    ),
    responses = {
        @ApiResponse(responseCode = "200", description = "Survey response submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    }
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SurveyResponse> submitResponse(
            @PathVariable("surveyId") Long surveyId,
            @RequestPart("response") SurveyResponseSaveRequest response,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        surveyResponseService.submitResponse(surveyId, response, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<SurveyResponse>> getResponses(@PathVariable("surveyId") Long surveyId) {
        return ResponseEntity.ok(surveyResponseService.getResponses(surveyId));
    }
}
