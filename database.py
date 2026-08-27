from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Float,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = "sqlite:///./lost_and_found.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ============================================================
# USERS
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    phone_number = Column(String(50), nullable=True)
    profile_picture = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False)

    lost_items = relationship(
        "LostItem",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    found_items = relationship(
        "FoundItem",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ============================================================
# LOST ITEMS
# ============================================================

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    description = Column(Text, nullable=False)

    # Human-readable place
    location = Column(String(500), nullable=False)

    # Geographic location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Google/Mapbox/etc. place identifier
    place_id = Column(String(255), nullable=True)

    # Optional address returned by location API
    address = Column(String(500), nullable=True)

    # Location contact information
    location_name = Column(String(255), nullable=True)
    location_phone = Column(String(100), nullable=True)
    location_email = Column(String(255), nullable=True)
    location_website = Column(String(500), nullable=True)

    # Separate date/time
    lost_date = Column(String(20), nullable=False)
    lost_time = Column(String(20), nullable=False)

    photo_path = Column(String(500), nullable=True)

    created_at = Column(DateTime, nullable=False)

    user = relationship(
        "User",
        back_populates="lost_items"
    )

    matches = relationship(
        "Match",
        back_populates="lost_item",
        cascade="all, delete-orphan"
    )


# ============================================================
# FOUND ITEMS
# ============================================================

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    description = Column(Text, nullable=False)

    location = Column(String(500), nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    place_id = Column(String(255), nullable=True)

    address = Column(String(500), nullable=True)

    location_name = Column(String(255), nullable=True)
    location_phone = Column(String(100), nullable=True)
    location_email = Column(String(255), nullable=True)
    location_website = Column(String(500), nullable=True)

    found_date = Column(String(20), nullable=False)
    found_time = Column(String(20), nullable=False)

    photo_path = Column(String(500), nullable=False)

    created_at = Column(DateTime, nullable=False)

    user = relationship(
        "User",
        back_populates="found_items"
    )

    matches = relationship(
        "Match",
        back_populates="found_item",
        cascade="all, delete-orphan"
    )


# ============================================================
# MATCHES
# ============================================================

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)

    lost_item_id = Column(
        Integer,
        ForeignKey("lost_items.id"),
        nullable=False
    )

    found_item_id = Column(
        Integer,
        ForeignKey("found_items.id"),
        nullable=False
    )

    score = Column(Float, nullable=False)

    status = Column(
        String(50),
        default="active",
        nullable=False
    )

    created_at = Column(DateTime, nullable=False)

    lost_item = relationship(
        "LostItem",
        back_populates="matches"
    )

    found_item = relationship(
        "FoundItem",
        back_populates="matches"
    )

    messages = relationship(
        "ChatMessage",
        back_populates="match",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="match",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint(
            "lost_item_id",
            "found_item_id",
            name="unique_lost_found_match"
        ),
    )


# ============================================================
# CHAT MESSAGES
# ============================================================

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    match_id = Column(
        Integer,
        ForeignKey("matches.id"),
        nullable=False
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    created_at = Column(DateTime, nullable=False)

    match = relationship(
        "Match",
        back_populates="messages"
    )


# ============================================================
# NOTIFICATIONS
# ============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    match_id = Column(
        Integer,
        ForeignKey("matches.id"),
        nullable=True
    )

    notification_type = Column(
        String(100),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )

    match = relationship(
        "Match",
        back_populates="notifications"
    )


# ============================================================
# CONTACT SHARING
# ============================================================

class ContactShare(Base):
    __tablename__ = "contact_shares"

    id = Column(Integer, primary_key=True, index=True)

    match_id = Column(
        Integer,
        ForeignKey("matches.id"),
        nullable=False
    )

    shared_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    shared_at = Column(
        DateTime,
        nullable=False
    )


# ============================================================
# FALLBACK LOCATION CONTACTS
# ============================================================

LOCATION_CONTACTS = {
    "library": {
        "name": "Campus Library Front Desk",
        "phone": "555-0100",
        "email": "library@school.edu",
        "website": None,
    },
    "gym": {
        "name": "Athletic Center Office",
        "phone": "555-0101",
        "email": "gym@school.edu",
        "website": None,
    },
    "cafeteria": {
        "name": "Dining Services",
        "phone": "555-0102",
        "email": "dining@school.edu",
        "website": None,
    },
}


# ============================================================
# DATABASE
# ============================================================

def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()