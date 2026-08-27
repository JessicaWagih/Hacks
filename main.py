
import os
import shutil
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import (
    init_db, get_db, LostItem, FoundItem, Match, ChatMessage, LOCATION_CONTACTS
)
from schemas import LostItemOut, FoundItemOut, MatchOut, ChatMessageIn, ChatMessageOut
from matching import find_matches_for_lost_item

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Lost & Found Matcher API")

# Allow the frontend (running on a different port/domain) to call this API.
# For the hackathon just leave this wide open; tighten it if you have time.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    init_db()


def save_photo(photo: UploadFile) -> str:
    ext = os.path.splitext(photo.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    return path



# LOST ITEMS

@app.post("/items/lost", response_model=LostItemOut)
def report_lost_item(
    reporter_name: str = Form(...),
    reporter_contact: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date_time: datetime = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    photo_path = save_photo(photo) if photo else None

    item = LostItem(
        reporter_name=reporter_name,
        reporter_contact=reporter_contact,
        description=description,
        location=location,
        date_time=date_time,
        photo_path=photo_path,
        created_at=datetime.utcnow(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Immediately try to find matches among existing found items
    all_found = db.query(FoundItem).all()
    for found_item, score in find_matches_for_lost_item(item, all_found):
        existing = (
            db.query(Match)
            .filter_by(lost_item_id=item.id, found_item_id=found_item.id)
            .first()
        )
        if not existing:
            db.add(Match(
                lost_item_id=item.id,
                found_item_id=found_item.id,
                score=score,
                created_at=datetime.utcnow(),
            ))
    db.commit()

    return item


@app.get("/items/lost/{lost_item_id}/matches", response_model=List[MatchOut])
def get_matches_for_lost_item(lost_item_id: int, db: Session = Depends(get_db)):
    """
    This is the ONLY way a user gets to see found items -
    they must have already reported a lost item, and this only
    returns found items the algorithm actually matched to it.
    """
    matches = db.query(Match).filter_by(lost_item_id=lost_item_id).all()
    return matches



# FOUND ITEMS


@app.post("/items/found", response_model=FoundItemOut)
def report_found_item(
    reporter_name: str = Form(...),
    reporter_contact: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    date_time: datetime = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    photo_path = save_photo(photo)

    item = FoundItem(
        reporter_name=reporter_name,
        reporter_contact=reporter_contact,
        description=description,
        location=location,
        date_time=date_time,
        photo_path=photo_path,
        created_at=datetime.utcnow(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Check this new found item against ALL existing lost items too,
    # in case someone reported losing it before it was found.
    all_lost = db.query(LostItem).all()
    for lost_item in all_lost:
        matches = find_matches_for_lost_item(lost_item, [item])
        for matched_found, score in matches:
            existing = (
                db.query(Match)
                .filter_by(lost_item_id=lost_item.id, found_item_id=item.id)
                .first()
            )
            if not existing:
                db.add(Match(
                    lost_item_id=lost_item.id,
                    found_item_id=item.id,
                    score=score,
                    created_at=datetime.utcnow(),
                ))
    db.commit()

    return item



# ---------------------------------------------------------------------------
# LOCATION CONTACT INFO
# ---------------------------------------------------------------------------

@app.get("/locations/{location_name}/contact")
def get_location_contact(location_name: str):
    contact = LOCATION_CONTACTS.get(location_name.lower().strip())
    if not contact:
        raise HTTPException(status_code=404, detail="No contact info for this location")
    return contact


# ---------------------------------------------------------------------------
# CHAT (between the two matched reporters)
# ---------------------------------------------------------------------------

@app.post("/matches/{match_id}/messages", response_model=ChatMessageOut)
def send_message(match_id: int, message: ChatMessageIn, db: Session = Depends(get_db)):
    match = db.query(Match).filter_by(id=match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    chat_message = ChatMessage(
        match_id=match_id,
        sender_role=message.sender_role,
        content=message.content,
        created_at=datetime.utcnow(),
    )
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    return chat_message


@app.get("/matches/{match_id}/messages", response_model=List[ChatMessageOut])
def get_messages(match_id: int, db: Session = Depends(get_db)):
    return db.query(ChatMessage).filter_by(match_id=match_id).order_by(ChatMessage.created_at).all()
