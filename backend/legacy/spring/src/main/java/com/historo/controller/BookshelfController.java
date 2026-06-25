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
        String username = (String) auth.getPrincipal();
        return bookshelfService.getMyStories(username);
    }

    @PostMapping
    public BookshelfItem saveStory(Authentication auth,
                                   @Valid @RequestBody BookshelfSaveRequest req) {
        String username = (String) auth.getPrincipal();
        return bookshelfService.save(username, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(Authentication auth, @PathVariable String id) {
        String username = (String) auth.getPrincipal();
        try {
            bookshelfService.delete(username, id);
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
