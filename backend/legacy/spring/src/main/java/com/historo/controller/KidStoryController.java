package com.historo.controller;

import com.historo.dto.KidStory;
import com.historo.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class KidStoryController {

    private final DataService dataService;

    public KidStoryController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/kidstory/{eventId}")
    public ResponseEntity<KidStory> getKidStory(@PathVariable String eventId) {
        KidStory kidStory = dataService.getKidStory(eventId);
        if (kidStory == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(kidStory);
    }
}
