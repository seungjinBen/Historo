package com.historo.init;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.historo.entity.*;
import com.historo.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ObjectMapper mapper;
    private final EventRepository eventRepo;
    private final HeritageEventRepository heritageRepo;
    private final HeritageItemRepository heritageItemRepo;
    private final StoryTreeRepository treeRepo;
    private final KidStoryRepository kidStoryRepo;
    private final ComicRepository comicRepo;

    public DataInitializer(ObjectMapper mapper,
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

    @Override
    public void run(String... args) throws Exception {
        // DynamoDB에는 cheap count()가 없으므로 scan 1건으로 초기화 여부 확인
        boolean alreadyLoaded = eventRepo.findAll().stream().findFirst().isPresent();
        if (alreadyLoaded) {
            log.info("DB already initialized, skipping data load");
            return;
        }

        log.info("Loading initial data into DynamoDB...");
        try { loadEvents(); } catch (Exception e) { log.error("Failed to load events", e); }
        try { loadHeritage(); } catch (Exception e) { log.error("Failed to load heritage", e); }
        try { loadTrees(); } catch (Exception e) { log.error("Failed to load trees", e); }
        try { loadKidStories(); } catch (Exception e) { log.error("Failed to load kid stories", e); }
        try { loadComics(); } catch (Exception e) { log.error("Failed to load comics", e); }
        log.info("Data initialization complete");
    }

    private void loadEvents() throws Exception {
        JsonNode root = readJson("data/events.json");
        int count = 0;
        for (JsonNode node : root.get("events")) {
            JsonNode ch = node.get("character");
            eventRepo.save(new Event(
                    node.get("id").asText(),
                    node.get("title").asText(),
                    node.get("year").asInt(),
                    textOrNull(node, "king"),
                    textOrNull(node, "era"),
                    textOrNull(node, "category"),
                    textOrNull(node, "status"),
                    textOrNull(node, "source"),
                    textOrNull(node, "sillokUrl"),
                    textOrNull(node, "factCard"),
                    textOrNull(node, "factContext"),
                    ch != null ? textOrNull(ch, "name") : null,
                    ch != null ? textOrNull(ch, "appearance") : null
            ));
            count++;
        }
        log.info("Loaded {} events", count);
    }

    private void loadHeritage() throws Exception {
        JsonNode root = readJson("data/heritage.json");
        int eventCount = 0, itemCount = 0;
        for (JsonNode node : root.get("events")) {
            String eventId = node.get("id").asText();
            HeritageEventEntity entity = new HeritageEventEntity(
                    eventId,
                    node.get("title").asText(),
                    textOrNull(node, "year"),
                    textOrNull(node, "sillokUrl")
            );
            heritageRepo.save(entity);
            eventCount++;

            if (node.has("heritageItems")) {
                for (JsonNode item : node.get("heritageItems")) {
                    HeritageItemEntity itemEntity = new HeritageItemEntity(
                            item.get("id").asText(),
                            item.get("name").asText(),
                            textOrNull(item, "imagePath"),
                            textOrNull(item, "docentText"),
                            textOrNull(item, "source"),
                            textOrNull(item, "sourceUrl")
                    );
                    itemEntity.setHeritageEventId(eventId);
                    heritageItemRepo.save(itemEntity);
                    itemCount++;
                }
            }
        }
        log.info("Loaded {} heritage events, {} items", eventCount, itemCount);
    }

    private void loadTrees() throws Exception {
        JsonNode events = readJson("data/events.json").get("events");
        int count = 0;
        for (JsonNode ev : events) {
            String eventId = ev.get("id").asText();
            ClassPathResource res = new ClassPathResource("data/trees/" + eventId + ".json");
            if (res.exists()) {
                try (InputStream is = res.getInputStream()) {
                    String json = new String(is.readAllBytes());
                    treeRepo.save(new StoryTree(eventId, json));
                    count++;
                }
            }
        }
        log.info("Loaded {} story trees", count);
    }

    private void loadKidStories() throws Exception {
        JsonNode events = readJson("data/events.json").get("events");
        int count = 0;
        for (JsonNode ev : events) {
            String eventId = ev.get("id").asText();
            ClassPathResource res = new ClassPathResource("data/kidstory/" + eventId + ".json");
            if (res.exists()) {
                JsonNode node = mapper.readTree(res.getInputStream());
                kidStoryRepo.save(new KidStoryEntity(
                        eventId,
                        textOrNull(node, "source"),
                        textOrNull(node, "sillokUrl"),
                        node.has("fromSillok") && node.get("fromSillok").asBoolean(),
                        textOrNull(node, "kidStory"),
                        node.has("funFacts") ? mapper.writeValueAsString(node.get("funFacts")) : "[]"
                ));
                count++;
            }
        }
        log.info("Loaded {} kid stories", count);
    }

    private void loadComics() throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        var resources = resolver.getResources("classpath:data/comics/*.json");
        int count = 0;
        for (var res : resources) {
            try (InputStream is = res.getInputStream()) {
                String json = new String(is.readAllBytes());
                JsonNode node = mapper.readTree(json);
                String episodeId = node.get("id").asText();
                comicRepo.save(new ComicEntity(episodeId, json));
                count++;
            }
        }
        log.info("Loaded {} comics", count);
    }

    private JsonNode readJson(String path) throws Exception {
        try (InputStream is = new ClassPathResource(path).getInputStream()) {
            return mapper.readTree(is);
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode val = node.get(field);
        return (val != null && !val.isNull()) ? val.asText() : null;
    }
}
