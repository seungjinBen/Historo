package com.historo.controller;

import com.historo.dto.GalleryItem;
import com.historo.service.GalleryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping
    public List<GalleryItem> getAll() {
        return galleryService.getAllGalleryItems();
    }

    @GetMapping("/{episodeId}/{storylineId}")
    public ResponseEntity<GalleryItem> getOne(@PathVariable String episodeId,
                                               @PathVariable String storylineId) {
        GalleryItem item = galleryService.getGalleryItem(episodeId, storylineId);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }
}
