from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


# AUTH

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    phone_number: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


# LOCATION

class LocationInfo(BaseModel):
    location: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    place_id: Optional[str] = None
    address: Optional[str] = None

    location_name: Optional[str] = None
    location_phone: Optional[str] = None
    location_email: Optional[str] = None
    location_website: Optional[str] = None




# LOST ITEM

class LostItemOut(BaseModel):
    id: int

    user_id: int

    description: str

    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    place_id: Optional[str] = None
    address: Optional[str] = None

    location_name: Optional[str] = None
    location_phone: Optional[str] = None
    location_email: Optional[str] = None
    location_website: Optional[str] = None

    lost_date: str
    lost_time: str

    photo_path: Optional[str] = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



# FOUND ITEM

class FoundItemOut(BaseModel):
    id: int

    user_id: int

    description: str

    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    place_id: Optional[str] = None
    address: Optional[str] = None

    location_name: Optional[str] = None
    location_phone: Optional[str] = None
    location_email: Optional[str] = None
    location_website: Optional[str] = None

    found_date: str
    found_time: str

    photo_path: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



# MATCH

class MatchOut(BaseModel):
    id: int

    score: float

    status: str

    lost_item: LostItemOut
    found_item: FoundItemOut

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



# CHAT

class ChatMessageIn(BaseModel):
    content: str


class ChatMessageOut(BaseModel):
    id: int

    match_id: int
    sender_id: int

    content: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



# NOTIFICATIONS

class NotificationOut(BaseModel):
    id: int

    match_id: Optional[int] = None

    notification_type: str

    title: str
    message: str

    is_read: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



# CONTACT SHARING

class ContactShareOut(BaseModel):
    shared: bool
    shared_by_user_id: Optional[int] = None

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None