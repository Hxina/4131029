from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    love_code = Column(String, unique=True, index=True, nullable=False)
    author = Column(String, nullable=False)
    beloved = Column(String, nullable=True)
    meet_date = Column(String, nullable=False)
    meet_place = Column(String, nullable=True)
    quote = Column(String, nullable=True)
    story = Column(Text, nullable=False)
    word_count = Column(Integer, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(
        String,
        default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        nullable=False,
    )

    images = relationship("Image", back_populates="story")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    url = Column(String, nullable=False)
    upload_order = Column(Integer, default=0, nullable=False)

    story = relationship("Story", back_populates="images")
