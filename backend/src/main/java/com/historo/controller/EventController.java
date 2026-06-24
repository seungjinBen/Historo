package com.historo.controller;

import com.historo.dto.EventsResponse;
import com.historo.service.DataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EventController {

    private final DataService dataService;

    public EventController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/events")
    public EventsResponse getEvents() {
        return dataService.getEvents();
    }
}
