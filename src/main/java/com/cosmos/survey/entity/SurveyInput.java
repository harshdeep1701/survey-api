package com.cosmos.survey.entity;


import java.util.List;

import com.cosmos.survey.entity.types.InputType;
import com.fasterxml.jackson.annotation.JsonIgnore;

// Removed import of deprecated org.hibernate.type.EnumType

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
public class SurveyInput {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "survey_id", nullable = false)
    @JsonIgnore
    private Survey survey;

    private String label;

    @Enumerated(jakarta.persistence.EnumType.STRING)
    private InputType type; // TEXT, CHECKBOX, RADIO, DROPDOWN, FILE

    private boolean required;
    private int orderIndex; // Position in the form

    // For dropdown, radio, checkbox options
    @ElementCollection
    private List<String> options;
}
