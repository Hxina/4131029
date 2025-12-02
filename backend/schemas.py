from pydantic import BaseModel
from typing import List, Optional


class ImageBase(BaseModel):
    url: str
    upload_order: int = 0


class ImageCreate(ImageBase):
    pass


class Image(ImageBase):
    id: int
    story_id: int

    class Config:
        orm_mode = True


class StoryBase(BaseModel):
    author: str
    beloved: Optional[str] = None
    meet_date: str
    meet_place: Optional[str] = None
    quote: Optional[str] = None
    story: str


class StoryCreate(StoryBase):
    images: List[ImageCreate] = []


class Story(StoryBase):
    id: int
    love_code: str
    word_count: int
    like_count: int
    view_count: int
    created_at: str
    images: List[Image] = []

    class Config:
        orm_mode = True


class LikeRequest(BaseModel):
    love_code: str
    action: str
