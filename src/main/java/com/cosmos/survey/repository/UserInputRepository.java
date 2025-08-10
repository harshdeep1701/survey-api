package com.cosmos.survey.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cosmos.survey.entity.UserInput;

public interface UserInputRepository extends JpaRepository<UserInput, Long> {}