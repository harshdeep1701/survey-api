package com.cosmos.survey.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserInput {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "response_id")
    @JsonIgnore
    private SurveyResponse response;

    @ManyToOne
    @JoinColumn(name = "input_id")
    private SurveyInput input;

    @Column(name = "input_value")
    private String value; // For text, selected option, or comma-separated for multiple

    // For file attachment, you may store the file name or path
    private String fileName;
    private String fileType;

    @Lob
    private byte[] fileData;
}
