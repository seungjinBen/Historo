package com.historo.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "heritage_events")
public class HeritageEventEntity {

    @Id
    private String id;

    private String title;

    @Column(name = "event_year")
    private String year;

    private String sillokUrl;

    @OneToMany(mappedBy = "heritageEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "item_order")
    private List<HeritageItemEntity> heritageItems = new ArrayList<>();

    protected HeritageEventEntity() {}

    public HeritageEventEntity(String id, String title, String year, String sillokUrl) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.sillokUrl = sillokUrl;
    }

    public void addItem(HeritageItemEntity item) {
        heritageItems.add(item);
        item.setHeritageEvent(this);
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getYear() { return year; }
    public String getSillokUrl() { return sillokUrl; }
    public List<HeritageItemEntity> getHeritageItems() { return heritageItems; }
}
