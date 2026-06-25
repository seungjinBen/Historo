package com.historo.controller;

import com.historo.dto.HeritageResponse;
import com.historo.service.DataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HeritageController {

    private final DataService dataService;

    public HeritageController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/heritage")
    public HeritageResponse getHeritage() {
        return dataService.getHeritage();
    }
}
