package com.historo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "story_trees")
public class StoryTree {

    @Id
    private String eventId;

    @Column(columnDefinition = "LONGTEXT")
    private String treeJson;

    protected StoryTree() {}

    public StoryTree(String eventId, String treeJson) {
        this.eventId = eventId;
        this.treeJson = treeJson;
    }

    public String getEventId() { return eventId; }
    public String getTreeJson() { return treeJson; }
}
