package com.historo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "kid_stories")
public class KidStoryEntity {

    @Id
    private String eventId;

    private String source;
    private String sillokUrl;
    private boolean fromSillok;

    @Column(columnDefinition = "TEXT")
    private String kidStory;

    @Column(columnDefinition = "TEXT")
    private String funFactsJson;

    protected KidStoryEntity() {}

    public KidStoryEntity(String eventId, String source, String sillokUrl,
                          boolean fromSillok, String kidStory, String funFactsJson) {
        this.eventId = eventId;
        this.source = source;
        this.sillokUrl = sillokUrl;
        this.fromSillok = fromSillok;
        this.kidStory = kidStory;
        this.funFactsJson = funFactsJson;
    }

    public String getEventId() { return eventId; }
    public String getSource() { return source; }
    public String getSillokUrl() { return sillokUrl; }
    public boolean isFromSillok() { return fromSillok; }
    public String getKidStory() { return kidStory; }
    public String getFunFactsJson() { return funFactsJson; }
}
