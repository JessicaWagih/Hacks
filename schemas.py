from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class LostItemOut(BaseModel):
    id: int
    reporter_name: str
    description: str
    location: str
    date_time: datetime
    photo_path: Optional[str] = None

    class Config:
        from_attributes = True


class FoundItemOut(BaseModel):
    id: int
    reporter_name: str
    description: str
    location: str
    date_time: datetime
    photo_path: str

    class Config:
        from_attributes = True


class MatchOut(BaseModel):
    id: int
    score: float
    lost_item: LostItemOut
    found_item: FoundItemOut

    class Config:
        from_attributes = True


class ChatMessageIn(BaseModel):
    sender_role: str  # "lost_reporter" or "found_reporter"
    content: str


class ChatMessageOut(BaseModel):
    id: int
    sender_role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
