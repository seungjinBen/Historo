package com.historo.service;

import com.historo.dto.Comic;
import com.historo.dto.ComicCut;
import com.historo.dto.ComicStoryline;
import com.historo.dto.GalleryItem;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GalleryService {

    private final DataService dataService;

    public GalleryService(DataService dataService) {
        this.dataService = dataService;
    }

    public List<GalleryItem> getAllGalleryItems() {
        List<GalleryItem> items = new ArrayList<>();
        for (Comic comic : dataService.getAllComics()) {
            for (ComicStoryline sl : comic.storylines()) {
                List<GalleryItem.GalleryPanel> panels = sl.cuts().stream()
                        .map(c -> new GalleryItem.GalleryPanel(c.number(), c.description(), c.imageUrl()))
                        .toList();
                items.add(new GalleryItem(
                        comic.id(), comic.title(), sl.id(), sl.pathText(), panels
                ));
            }
        }
        return items;
    }

    public GalleryItem getGalleryItem(String episodeId, String storylineId) {
        Comic comic = dataService.getComic(episodeId);
        if (comic == null) return null;
        for (ComicStoryline sl : comic.storylines()) {
            if (sl.id().equals(storylineId)) {
                List<GalleryItem.GalleryPanel> panels = sl.cuts().stream()
                        .map(c -> new GalleryItem.GalleryPanel(c.number(), c.description(), c.imageUrl()))
                        .toList();
                return new GalleryItem(comic.id(), comic.title(), sl.id(), sl.pathText(), panels);
            }
        }
        return null;
    }
}
