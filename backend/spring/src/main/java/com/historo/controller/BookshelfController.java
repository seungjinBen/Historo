package com.historo.controller;

import com.historo.dto.BookshelfItem;
import com.historo.dto.BookshelfSaveRequest;
import com.historo.service.BookshelfService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookshelf")
public class BookshelfController {

    private final BookshelfService bookshelfService;

    public BookshelfController(BookshelfService bookshelfService) {
        this.bookshelfService = bookshelfService;
    }

    @GetMapping
    public List<BookshelfItem> getMyStories(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return bookshelfService.getMyStories(userId);
    }

    @PostMapping
    public BookshelfItem saveStory(Authentication auth,
                                   @Valid @RequestBody BookshelfSaveRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return bookshelfService.save(userId, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        try {
            bookshelfService.delete(userId, id);
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
