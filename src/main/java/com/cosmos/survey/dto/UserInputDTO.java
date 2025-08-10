package com.cosmos.survey.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserInputDTO {

    @NotNull
    private Long inputId; // SurveyInput ID

    private String value; // For text, radio, dropdown, checkbox (comma-separated if multiple)

}
