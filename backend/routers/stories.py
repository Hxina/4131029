from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import random

from .. import models, schemas, utils, database

router = APIRouter(prefix="/api/stories", tags=["stories"])


@router.get("/sample", response_model=List[schemas.Story])
def get_sample_stories(limit: int = 25, db: Session = Depends(database.get_db)):
    stories = (
        db.query(models.Story)
        .order_by(models.Story.created_at.desc())
        .limit(limit)
        .all()
    )
    if len(stories) > limit:
        return random.sample(stories, limit)
    return stories


@router.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    count = db.query(models.Story).count()
    total_words = db.query(func.sum(models.Story.word_count)).scalar() or 0
    return {"total_stories": count, "total_word_count": total_words}


@router.post("/", response_model=schemas.Story)
def create_story(story: schemas.StoryCreate, db: Session = Depends(database.get_db)):
    word_count = len(story.story)

    beloved_name = (
        story.beloved if story.beloved and story.beloved.strip() else "心上人"
    )

    meet_place_name = (
        story.meet_place
        if story.meet_place and story.meet_place.strip()
        else "相遇之地"
    )

    db_story = models.Story(
        author=story.author,
        beloved=beloved_name,
        meet_date=story.meet_date,
        meet_place=meet_place_name,
        quote=story.quote,
        story=story.story,
        word_count=word_count,
        love_code="TEMP",
    )
    db.add(db_story)
    db.flush()

    db_story.love_code = utils.generate_love_code(db_story.id)

    for img in story.images:
        db_image = models.Image(
            story_id=db_story.id, url=img.url, upload_order=img.upload_order
        )
        db.add(db_image)

    db.commit()
    db.refresh(db_story)
    return db_story


@router.get("/{love_code}", response_model=schemas.Story)
def get_story(love_code: str, db: Session = Depends(database.get_db)):
    story = (
        db.query(models.Story)
        .filter(models.Story.love_code == love_code.upper())
        .first()
    )
    if not story:
        raise HTTPException(status_code=404, detail="未找到该故事。")

    story.view_count += 1
    db.commit()
    db.refresh(story)

    return story


@router.post("/like")
def like_story(req: schemas.LikeRequest, db: Session = Depends(database.get_db)):
    story = (
        db.query(models.Story)
        .filter(models.Story.love_code == req.love_code.upper())
        .first()
    )
    if not story:
        raise HTTPException(status_code=404, detail="未找到该故事。")

    if req.action == "like":
        story.like_count += 1
    elif req.action == "unlike":
        story.like_count = max(0, story.like_count - 1)

    db.commit()
    db.refresh(story)

    return {"like_count": story.like_count}
