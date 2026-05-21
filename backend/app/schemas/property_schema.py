from pydantic import BaseModel, Field
from typing import Literal, Optional

class PropertyCreate(BaseModel):
    title: str = Field(..., min_length=5)
    intent: Literal["Sale", "Rent"] = Field(...)
    price: float = Field(..., gt=0)
    location: str = Field(..., description="La ville")
    neighborhood: Optional[str] = Field("Targa", description="Le quartier spécifique") 
    type: str = Field(...)
    bedrooms: int = Field(0, ge=0)
    bathrooms: int = Field(0, ge=0) 
    area_sqm: int = Field(..., gt=0)
    status: str = Field("available") 
    features: str = Field(..., description="Détails techniques pour l'IA")