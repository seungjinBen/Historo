package com.historo.controller;

import com.historo.dto.Tree;
import com.historo.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TreeController {

    private final DataService dataService;

    public TreeController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/trees/{eventId}")
    public ResponseEntity<Tree> getTree(@PathVariable String eventId) {
        Tree tree = dataService.getTree(eventId);
        if (tree == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tree);
    }
}
