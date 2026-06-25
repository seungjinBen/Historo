package com.historo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "comics")
public class ComicEntity {

    @Id
    private String episodeId;

    @Column(columnDefinition = "TEXT")
    private String comicJson;

    protected ComicEntity() {}

    public ComicEntity(String episodeId, String comicJson) {
        this.episodeId = episodeId;
        this.comicJson = comicJson;
    }

    public String getEpisodeId() { return episodeId; }
    public String getComicJson() { return comicJson; }
}
