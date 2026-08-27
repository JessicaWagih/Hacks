import os
import shutil
import uuid

from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
    status,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from passlib.context import CryptContext
from jose import JWTError, jwt

from database import (
    init_db,
    get_db,
    User,
    LostItem,
    FoundItem,
    Match,
    ChatMessage,
    Notification,
    ContactShare,
    LOCATION_CONTACTS,
)

from schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    Token,
    LostItemOut,
    FoundItemOut,
    MatchOut,
    ChatMessageIn,
    ChatMessageOut,
    NotificationOut,
    ContactShareOut,
)

from matching import find_matches_for_lost_item



# APP

app = FastAPI(
    title="Lost & Found Matcher API",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



# UPLOADS

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)




def save_photo(photo: UploadFile) -> str:

    extension = os.path.splitext(
        photo.filename or ""
    )[1]

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(path, "wb") as buffer:
        shutil.copyfileobj(
            photo.file,
            buffer
        )

    return path




# AUTH

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "CHANGE_THIS_SECRET_KEY"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

security = HTTPBearer()


def hash_password(password: str):

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(
    user_id: int,
):

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except (JWTError, ValueError):

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )



# STARTUP

@app.on_event("startup")
def on_startup():

    init_db()



# HEALTH CHECK

@app.get("/")
def root():

    return {
        "message": "Lost & Found Matcher API is running",
        "version": "2.0.0",
    }



# AUTH ROUTES

@app.post(
    "/auth/signup",
    response_model=UserOut
)
def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):

    existing_user = db.query(User).filter(
        User.email == user_data.email.lower()
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    if len(user_data.password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )

    user = User(
        first_name=user_data.first_name.strip(),
        last_name=user_data.last_name.strip(),
        email=user_data.email.lower(),
        password_hash=hash_password(
            user_data.password
        ),
        phone_number=user_data.phone_number,
        created_at=datetime.utcnow(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.post(
    "/auth/login",
    response_model=Token
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(
        User.email == login_data.email.lower()
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password."
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password."
        )

    token = create_access_token(
        user.id
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@app.get(
    "/auth/me",
    response_model=UserOut
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return current_user



# USER PROFILE
@app.post(
    "/users/profile-picture",
    response_model=UserOut
)
def upload_profile_picture(
    photo: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    current_user.profile_picture = save_photo(
        photo
    )

    db.commit()
    db.refresh(current_user)

    return current_user



# LOST ITEMS

@app.post(
    "/items/lost",
    response_model=LostItemOut
)
def report_lost_item(

    description: str = Form(...),

    location: str = Form(...),

    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),

    place_id: Optional[str] = Form(None),

    address: Optional[str] = Form(None),

    location_name: Optional[str] = Form(None),
    location_phone: Optional[str] = Form(None),
    location_email: Optional[str] = Form(None),
    location_website: Optional[str] = Form(None),

    lost_date: str = Form(...),
    lost_time: str = Form(...),

    photo: Optional[UploadFile] = File(None),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    photo_path = (
        save_photo(photo)
        if photo
        else None
    )

    item = LostItem(

        user_id=current_user.id,

        description=description,

        location=location,

        latitude=latitude,
        longitude=longitude,

        place_id=place_id,

        address=address,

        location_name=location_name,
        location_phone=location_phone,
        location_email=location_email,
        location_website=location_website,

        lost_date=lost_date,
        lost_time=lost_time,

        photo_path=photo_path,

        created_at=datetime.utcnow(),
    )

    db.add(item)
    db.commit()
    db.refresh(item)



    # MATCH AGAINST EXISTING FOUND ITEMS

    all_found = db.query(
        FoundItem
    ).filter(
        FoundItem.user_id != current_user.id
    ).all()

    matches = find_matches_for_lost_item(
        item,
        all_found
    )

    for found_item, score in matches:

        existing = db.query(
            Match
        ).filter_by(
            lost_item_id=item.id,
            found_item_id=found_item.id
        ).first()

        if existing:
            continue

        match = Match(

            lost_item_id=item.id,

            found_item_id=found_item.id,

            score=score,

            status="active",

            created_at=datetime.utcnow(),
        )

        db.add(match)

        db.flush()

        # Notify the person who lost the item.
        notification = Notification(

            user_id=current_user.id,

            match_id=match.id,

            notification_type="match_found",

            title="Potential match found!",

            message=(
                "Someone reported a found item "
                "that may match your lost item."
            ),

            is_read=False,

            created_at=datetime.utcnow(),
        )

        db.add(notification)

        # Also notify the finder.
        finder_notification = Notification(

            user_id=found_item.user_id,

            match_id=match.id,

            notification_type="match_found",

            title="Potential match found!",

            message=(
                "Your found item may belong "
                "to someone who reported an item lost."
            ),

            is_read=False,

            created_at=datetime.utcnow(),
        )

        db.add(finder_notification)

    db.commit()

    return item



# FOUND ITEMS

@app.post(
    "/items/found",
    response_model=FoundItemOut
)
def report_found_item(

    description: str = Form(...),

    location: str = Form(...),

    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),

    place_id: Optional[str] = Form(None),

    address: Optional[str] = Form(None),

    location_name: Optional[str] = Form(None),
    location_phone: Optional[str] = Form(None),
    location_email: Optional[str] = Form(None),
    location_website: Optional[str] = Form(None),

    found_date: str = Form(...),
    found_time: str = Form(...),

    photo: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    photo_path = save_photo(photo)

    item = FoundItem(

        user_id=current_user.id,

        description=description,

        location=location,

        latitude=latitude,
        longitude=longitude,

        place_id=place_id,

        address=address,

        location_name=location_name,
        location_phone=location_phone,
        location_email=location_email,
        location_website=location_website,

        found_date=found_date,
        found_time=found_time,

        photo_path=photo_path,

        created_at=datetime.utcnow(),
    )

    db.add(item)
    db.commit()
    db.refresh(item)


    # MATCH AGAINST EXISTING LOST ITEMS

    all_lost = db.query(
        LostItem
    ).filter(
        LostItem.user_id != current_user.id
    ).all()

    for lost_item in all_lost:

        matches = find_matches_for_lost_item(
            lost_item,
            [item]
        )

        for found_item, score in matches:

            existing = db.query(
                Match
            ).filter_by(
                lost_item_id=lost_item.id,
                found_item_id=item.id
            ).first()

            if existing:
                continue

            match = Match(

                lost_item_id=lost_item.id,

                found_item_id=item.id,

                score=score,

                status="active",

                created_at=datetime.utcnow(),
            )

            db.add(match)

            db.flush()

            # Notify person who lost item.
            lost_notification = Notification(

                user_id=lost_item.user_id,

                match_id=match.id,

                notification_type="match_found",

                title="Your lost item may have been found!",

                message=(
                    "A new found-item report appears "
                    "to match your lost item."
                ),

                is_read=False,

                created_at=datetime.utcnow(),
            )

            db.add(lost_notification)

            # Notify finder.
            finder_notification = Notification(

                user_id=current_user.id,

                match_id=match.id,

                notification_type="match_found",

                title="Potential match found!",

                message=(
                    "Your found item may belong "
                    "to someone who reported it lost."
                ),

                is_read=False,

                created_at=datetime.utcnow(),
            )

            db.add(finder_notification)

    db.commit()

    return item


# GET USER'S LOST ITEMS

@app.get(
    "/items/lost/my",
    response_model=List[LostItemOut]
)
def get_my_lost_items(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    return db.query(
        LostItem
    ).filter(
        LostItem.user_id == current_user.id
    ).order_by(
        LostItem.created_at.desc()
    ).all()



# GET USER'S FOUND ITEMS

@app.get(
    "/items/found/my",
    response_model=List[FoundItemOut]
)
def get_my_found_items(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    return db.query(
        FoundItem
    ).filter(
        FoundItem.user_id == current_user.id
    ).order_by(
        FoundItem.created_at.desc()
    ).all()



# MATCHES

@app.get(
    "/items/lost/{lost_item_id}/matches",
    response_model=List[MatchOut]
)
def get_matches_for_lost_item(

    lost_item_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    lost_item = db.query(
        LostItem
    ).filter(
        LostItem.id == lost_item_id
    ).first()

    if not lost_item:

        raise HTTPException(
            status_code=404,
            detail="Lost item not found"
        )

    if lost_item.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You do not have access to this item."
        )

    return db.query(
        Match
    ).filter(
        Match.lost_item_id == lost_item_id
    ).order_by(
        Match.score.desc()
    ).all()


@app.get(
    "/matches",
    response_model=List[MatchOut]
)
def get_my_matches(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    return db.query(
        Match
    ).join(
        LostItem,
        Match.lost_item_id == LostItem.id
    ).join(
        FoundItem,
        Match.found_item_id == FoundItem.id
    ).filter(
        (
            (LostItem.user_id == current_user.id)
            |
            (FoundItem.user_id == current_user.id)
        )
    ).order_by(
        Match.score.desc()
    ).all()



# LOCATION CONTACTS

@app.get(
    "/locations/{location_name}/contact"
)
def get_location_contact(
    location_name: str
):

    contact = LOCATION_CONTACTS.get(
        location_name.lower().strip()
    )

    if not contact:

        raise HTTPException(
            status_code=404,
            detail=(
                "No contact information found "
                "for this location."
            )
        )

    return contact



# CHAT SECURITY

def verify_match_access(
    match: Match,
    user: User,
):

    lost_user_id = match.lost_item.user_id
    found_user_id = match.found_item.user_id

    if user.id not in (
        lost_user_id,
        found_user_id
    ):

        raise HTTPException(
            status_code=403,
            detail="You are not part of this conversation."
        )



# SEND CHAT MESSAGE

@app.post(
    "/matches/{match_id}/messages",
    response_model=ChatMessageOut
)
def send_message(

    match_id: int,

    message: ChatMessageIn,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    match = db.query(
        Match
    ).filter(
        Match.id == match_id
    ).first()

    if not match:

        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    verify_match_access(
        match,
        current_user
    )

    if not message.content.strip():

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    chat_message = ChatMessage(

        match_id=match_id,

        sender_id=current_user.id,

        content=message.content.strip(),

        created_at=datetime.utcnow(),
    )

    db.add(chat_message)
    db.flush()

    # Find the other user.
    if match.lost_item.user_id == current_user.id:

        other_user_id = match.found_item.user_id

    else:

        other_user_id = match.lost_item.user_id

    notification = Notification(

        user_id=other_user_id,

        match_id=match_id,

        notification_type="new_message",

        title="New message",

        message=(
            f"{current_user.first_name} "
            f"sent you a message."
        ),

        is_read=False,

        created_at=datetime.utcnow(),
    )

    db.add(notification)

    db.commit()
    db.refresh(chat_message)

    return chat_message



# GET CHAT MESSAGES

@app.get(
    "/matches/{match_id}/messages",
    response_model=List[ChatMessageOut]
)
def get_messages(

    match_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    match = db.query(
        Match
    ).filter(
        Match.id == match_id
    ).first()

    if not match:

        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    verify_match_access(
        match,
        current_user
    )

    return db.query(
        ChatMessage
    ).filter(
        ChatMessage.match_id == match_id
    ).order_by(
        ChatMessage.created_at.asc()
    ).all()



# NOTIFICATIONS

@app.get(
    "/notifications",
    response_model=List[NotificationOut]
)
def get_notifications(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    return db.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).all()


@app.get(
    "/notifications/unread-count"
)
def unread_notification_count(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    count = db.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "count": count
    }


@app.patch(
    "/notifications/{notification_id}/read"
)
def mark_notification_read(

    notification_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()

    return {
        "success": True
    }


@app.patch(
    "/notifications/read-all"
)
def mark_all_notifications_read(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    db.query(
        Notification
    ).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update(
        {
            Notification.is_read: True
        }
    )

    db.commit()

    return {
        "success": True
    }


# CONTACT SHARING


@app.post(
    "/matches/{match_id}/share-contact",
    response_model=ContactShareOut
)
def share_contact(

    match_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    match = db.query(
        Match
    ).filter(
        Match.id == match_id
    ).first()

    if not match:

        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    verify_match_access(
        match,
        current_user
    )

    existing = db.query(
        ContactShare
    ).filter_by(
        match_id=match_id,
        shared_by_user_id=current_user.id
    ).first()

    if not existing:

        share = ContactShare(

            match_id=match_id,

            shared_by_user_id=current_user.id,

            shared_at=datetime.utcnow(),
        )

        db.add(share)

        # Notify the other person.
        if match.lost_item.user_id == current_user.id:

            other_user_id = match.found_item.user_id

        else:

            other_user_id = match.lost_item.user_id

        notification = Notification(

            user_id=other_user_id,

            match_id=match_id,

            notification_type="contact_shared",

            title="Contact information shared",

            message=(
                f"{current_user.first_name} "
                "has chosen to share their contact "
                "information with you."
            ),

            is_read=False,

            created_at=datetime.utcnow(),
        )

        db.add(notification)

        db.commit()

    return {
        "shared": True,
        "shared_by_user_id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
    }



# VIEW OTHER USER'S SHARED CONTACT

@app.get(
    "/matches/{match_id}/contact",
    response_model=ContactShareOut
)
def get_shared_contact(

    match_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    match = db.query(
        Match
    ).filter(
        Match.id == match_id
    ).first()

    if not match:

        raise HTTPException(
            status_code=404,
            detail="Match not found"
        )

    verify_match_access(
        match,
        current_user
    )

    # Find a contact share belonging to the OTHER person.
    other_user_id = (
        match.found_item.user_id
        if match.lost_item.user_id == current_user.id
        else match.lost_item.user_id
    )

    share = db.query(
        ContactShare
    ).filter(
        ContactShare.match_id == match_id,
        ContactShare.shared_by_user_id == other_user_id
    ).first()

    if not share:

        return {
            "shared": False,
            "shared_by_user_id": None,
            "first_name": None,
            "last_name": None,
            "email": None,
            "phone_number": None,
        }

    other_user = db.query(
        User
    ).filter(
        User.id == other_user_id
    ).first()

    return {
        "shared": True,
        "shared_by_user_id": other_user.id,
        "first_name": other_user.first_name,
        "last_name": other_user.last_name,
        "email": other_user.email,
        "phone_number": other_user.phone_number,
    }