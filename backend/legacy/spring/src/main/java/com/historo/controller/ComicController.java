package com.historo.controller;

import com.historo.dto.Comic;
import com.historo.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ComicController {

    private final DataService dataService;

    public ComicController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/comics")
    public List<Comic> getAllComics() {
        return dataService.getAllComics();
    }

    @GetMapping("/comics/{episodeId}")
    public ResponseEntity<Comic> getComic(@PathVariable String episodeId) {
        Comic comic = dataService.getComic(episodeId);
        if (comic == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(comic);
    }
}
