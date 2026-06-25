package com.historo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {

    @Id
    private String id;

    private String title;

    @Column(name = "event_year")
    private int year;

    private String king;
    private String era;
    private String category;
    private String status;
    private String source;
    private String sillokUrl;

    @Column(columnDefinition = "TEXT")
    private String factCard;

    @Column(columnDefinition = "TEXT")
    private String factContext;

    private String characterName;

    @Column(columnDefinition = "TEXT")
    private String characterAppearance;

    protected Event() {}

    public Event(String id, String title, int year, String king, String era,
                 String category, String status, String source, String sillokUrl,
                 String factCard, String factContext,
                 String characterName, String characterAppearance) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.king = king;
        this.era = era;
        this.category = category;
        this.status = status;
        this.source = source;
        this.sillokUrl = sillokUrl;
        this.factCard = factCard;
        this.factContext = factContext;
        this.characterName = characterName;
        this.characterAppearance = characterAppearance;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public int getYear() { return year; }
    public String getKing() { return king; }
    public String getEra() { return era; }
    public String getCategory() { return category; }
    public String getStatus() { return status; }
    public String getSource() { return source; }
    public String getSillokUrl() { return sillokUrl; }
    public String getFactCard() { return factCard; }
    public String getFactContext() { return factContext; }
    public String getCharacterName() { return characterName; }
    public String getCharacterAppearance() { return characterAppearance; }
}
