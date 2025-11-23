package com.cosmos.survey.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    @GetMapping(value = { "/", "/admin/**", "/s/**" })
    public String redirect() {
        return "forward:/index.html";
    }
}
