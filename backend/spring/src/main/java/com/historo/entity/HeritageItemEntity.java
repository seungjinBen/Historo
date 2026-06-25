package com.historo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "heritage_items")
public class HeritageItemEntity {

    @Id
    private String id;

    private String name;
    private String imagePath;

    @Column(columnDefinition = "TEXT")
    private String docentText;

    private String source;
    private String sourceUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "heritage_event_id")
    private HeritageEventEntity heritageEvent;

    protected HeritageItemEntity() {}

    public HeritageItemEntity(String id, String name, String imagePath,
                              String docentText, String source, String sourceUrl) {
        this.id = id;
        this.name = name;
        this.imagePath = imagePath;
        this.docentText = docentText;
        this.source = source;
        this.sourceUrl = sourceUrl;
    }

    void setHeritageEvent(HeritageEventEntity heritageEvent) {
        this.heritageEvent = heritageEvent;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getImagePath() { return imagePath; }
    public String getDocentText() { return docentText; }
    public String getSource() { return source; }
    public String getSourceUrl() { return sourceUrl; }
}
