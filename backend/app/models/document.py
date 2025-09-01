from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class Document(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # MongoDB _id
    filename: str
    content: str
    embedding: Optional[List[float]] = None  # vector representation
    metadata: Optional[dict] = None          # extra info (page, source, etc.)

    class Config:
        populate_by_name = True  # allow both "id" and "_id"
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
