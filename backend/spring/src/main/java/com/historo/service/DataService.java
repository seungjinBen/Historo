package com.historo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.historo.dto.*;
import com.historo.entity.*;
import com.historo.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DataService {

    private final ObjectMapper mapper;
    private final EventRepository eventRepo;
    private final HeritageEventRepository heritageRepo;
    private final HeritageItemRepository heritageItemRepo;
    private final StoryTreeRepository treeRepo;
    private final KidStoryRepository kidStoryRepo;
    private final ComicRepository comicRepo;

    @Value("${app.s3.base-url}")
    private String s3BaseUrl;

    public DataService(ObjectMapper mapper,
                       EventRepository eventRepo,
                       HeritageEventRepository heritageRepo,
                       HeritageItemRepository heritageItemRepo,
                       StoryTreeRepository treeRepo,
                       KidStoryRepository kidStoryRepo,
                       ComicRepository comicRepo) {
        this.mapper = mapper;
        this.eventRepo = eventRepo;
        this.heritageRepo = heritageRepo;
        this.heritageItemRepo = heritageItemRepo;
        this.treeRepo = treeRepo;
        this.kidStoryRepo = kidStoryRepo;
        this.comicRepo = comicRepo;
    }

    public EventsResponse getEvents() {
        List<EventMeta> events = eventRepo.findAll().stream()
                .map(this::toEventMeta)
                .toList();
        return new EventsResponse(events);
    }

    public HeritageResponse getHeritage() {
        List<HeritageEvent> events = heritageRepo.findAll().stream()
                .map(this::toHeritageEvent)
                .toList();
        return new HeritageResponse(events);
    }

    public Tree getTree(String eventId) {
        return treeRepo.findById(eventId)
                .map(this::toTree)
                .orElse(null);
    }

    public KidStory getKidStory(String eventId) {
        return kidStoryRepo.findById(eventId)
                .map(this::toKidStory)
                .orElse(null);
    }

    private EventMeta toEventMeta(Event e) {
        CharacterInfo character = null;
        if (e.getCharacterName() != null) {
            character = new CharacterInfo(e.getCharacterName(), e.getCharacterAppearance());
        }
        return new EventMeta(
                e.getId(), null, e.getTitle(), e.getYear(), e.getKing(),
                e.getEra(), e.getCategory(), e.getStatus(), e.getSource(),
                e.getSillokUrl(), e.getFactCard(), e.getFactContext(), character
        );
    }

    private HeritageEvent toHeritageEvent(HeritageEventEntity e) {
        // GSI로 이 이벤트에 속한 items 조회
        List<HeritageItem> items = heritageItemRepo.findByHeritageEventId(e.getId()).stream()
                .map(i -> new HeritageItem(
                        i.getId(), i.getName(), i.getImagePath(),
                        i.getDocentText(), i.getSource(), i.getSourceUrl()))
                .toList();
        return new HeritageEvent(e.getId(), e.getTitle(), e.getYear(), e.getSillokUrl(), items);
    }

    private Tree toTree(StoryTree entity) {
        try {
            return mapper.readValue(entity.getTreeJson(), Tree.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tree JSON", e);
        }
    }

    private KidStory toKidStory(KidStoryEntity e) {
        List<String> funFacts;
        try {
            funFacts = mapper.readValue(e.getFunFactsJson(), new TypeReference<>() {});
        } catch (Exception ex) {
            funFacts = List.of();
        }
        return new KidStory(
                e.getEventId(), e.getSource(), e.getSillokUrl(),
                e.isFromSillok(), e.getKidStory(), funFacts
        );
    }

    public Comic getComic(String episodeId) {
        return comicRepo.findById(episodeId)
                .map(this::toComic)
                .orElse(null);
    }

    public List<Comic> getAllComics() {
        return comicRepo.findAll().stream()
                .map(this::toComic)
                .toList();
    }

    private Comic toComic(ComicEntity entity) {
        try {
            Comic comic = mapper.readValue(entity.getComicJson(), Comic.class);
            List<ComicStoryline> resolved = comic.storylines().stream()
                    .map(s -> {
                        List<ComicCut> cuts = s.cuts().stream()
                                .map(c -> c.withImageUrl(toS3Url(c.imagePath())))
                                .toList();
                        return s.withCuts(cuts);
                    })
                    .toList();
            return comic.withStorylines(resolved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse comic JSON", e);
        }
    }

    private String toS3Url(String imagePath) {
        if (imagePath == null) return null;
        String nfd = Normalizer.normalize(imagePath, Normalizer.Form.NFD);
        String encoded = Arrays.stream(nfd.split("/"))
                .map(seg -> UriUtils.encode(seg, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
        return s3BaseUrl + "/" + encoded;
    }
}
