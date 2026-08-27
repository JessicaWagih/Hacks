
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, ForeignKey, Text, Float
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "sqlite:///./lost_and_found.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, nullable=False)
    reporter_contact = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    date_time = Column(DateTime, nullable=False)
    photo_path = Column(String, nullable=True)
    created_at = Column(DateTime)

    matches = relationship("Match", back_populates="lost_item")


class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, nullable=False)
    reporter_contact = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    date_time = Column(DateTime, nullable=False)
    photo_path = Column(String, nullable=False)  # required for found items
    created_at = Column(DateTime)

    matches = relationship("Match", back_populates="found_item")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    score = Column(Float)  # 0.0 - 1.0, how confident the match is
    created_at = Column(DateTime)

    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")
    messages = relationship("ChatMessage", back_populates="match")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    sender_role = Column(String)  # "lost_reporter" or "found_reporter"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime)

    match = relationship("Match", back_populates="messages")


LOCATION_CONTACTS = {
    "library": {"name": "Campus Library Front Desk", "phone": "555-0100", "email": "library@school.edu"},
    "gym": {"name": "Athletic Center Office", "phone": "555-0101", "email": "gym@school.edu"},
    "cafeteria": {"name": "Dining Services", "phone": "555-0102", "email": "dining@school.edu"},
}


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
