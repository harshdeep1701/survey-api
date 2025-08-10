package com.cosmos.survey.dto;

import io.swagger.v3.oas.annotations.media.Schema;


import org.springframework.web.multipart.MultipartFile;

// This class is ONLY for OpenAPI schema generation
@Schema(name = "SurveyUploadRequest", description = "Multipart request for survey submission")
public class SurveyUploadRequest {

    @Schema(
        description = "Survey JSON payload",
        type = "object",
        format = "application/json"
    )
    private SurveyResponseSaveRequest response;

    @Schema(
        description = "Optional file upload",
        type = "string",
        format = "binary"
    )
    private MultipartFile file;

    public SurveyResponseSaveRequest getResponse() {
        return response;
    }
    public void setResponse(SurveyResponseSaveRequest response) {
        this.response = response;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}

