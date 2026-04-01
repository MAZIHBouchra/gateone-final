from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID

class PropertyCreate(BaseModel):
    """
    Schéma de validation strict pour l'entrée des données.
    """
    title: str = Field(..., min_length=5, description="Titre de l'annonce")
    intent: Literal["Sale", "Rent"] = Field(..., description="Vente ou Location uniquement")
    price: float = Field(..., gt=0, description="Le prix doit être supérieur à 0")
    location: str = Field(..., description="Ville ou quartier")
    type: str = Field(..., description="Type de bien (Villa, Riad, etc.)")
    bedrooms: int = Field(..., ge=0)
    area_sqm: int = Field(..., gt=0)
    features: str = Field(..., description="Caractéristiques techniques pour l'IA")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Villa Royale avec Vue Atlas",
                "intent": "Sale",
                "price": 8500000.0,
                "location": "Palmeraie, Marrakech",
                "type": "Villa",
                "bedrooms": 5,
                "area_sqm": 450,
                "features": "Piscine olympique, marbre italien, domotique complète."
            }
        }