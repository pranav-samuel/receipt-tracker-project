import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field # enforces data types at runtime
from google import genai
from google.genai import types
from backend.extra.output_formatter import save_to_json

# define schema, use pydantic model
class ReceiptItemSchema(BaseModel):
    raw_item_name: str = Field(description="Exactly what the receipt says (e.g., 'BELL PEPPER')")
    standard_name: str = Field(description="A clean, generic name (e.g., 'Bell Pepper')")
    category: str = Field(description="Accurate expenditure category (e.g., 'Produce')")
    quantity: int = Field(description="The total combined quantity purchased for this item type.")
    package_size: int = Field(1, description="The count of items inside the pack. Defaults to 1.")
    weight: Optional[float] = Field(None, description="The total weight of the loose produce in kg, if applicable.")
    discount: float = Field(0.00, description="The combined total of all discounts applied directly to this specific item group. Default to 0.00.")
    price: float = Field(description="The complete combined price paid for ALL units of this item after row discounts.")

class ReceiptSchema(BaseModel):
    store_name: str = Field(description="The identified name of the store or merchant")
    purchase_date: str = Field(description="The transaction date formatted strictly as YYYY-MM-DD")
    purchase_time: Optional[str] = Field(None, description="The time of purchase formatted as HH:MM:SS am/pm.")
    location: Optional[str] = Field(None, description="The complete store address/location text.")
    discount_total: float = Field(0.00, description="The grand total of all discounts combined across the entire receipt (including subtotal/basket discounts like corporate promos).")
    total_amount: float = Field(description="The calculated grand total paid on the receipt.")
    items: List[ReceiptItemSchema] = Field(description="List of every item found on the receipt")

# takes raw ocr block and sends it to gemini to contextualize
def send_text_to_gemini(ocr_text: str) -> dict:

    # authenticate with adc
    client = genai.Client(
        vertexai=True,
        project=os.getenv("GCP_PROJECT_ID"),
        location="us-central1"
    )

    prompt = f"""
    Analyze this raw text extracted from a shopping receipt.
    Identify store details, dates, times, item prices, weights, quantities, individual item savings/coupons, and overall total basket savings.
    
    AGGREGATION RULE:
    If the same product type appears multiple times as separate rows on the receipt, you MUST combine them into a single line item entry in your JSON response. 
    Sum up their total quantities and combine their final row prices.
    
    Raw Receipt Text:
    \"\"\"
    {ocr_text}
    \"\"\"
    """

    # make gemini fill out pydantic schema
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReceiptSchema,
        ),
    )

    # get python dict and store as json
    parsed_json = json.loads(response.text)
    
    # save to directory
    save_to_json(parsed_json, "structured_receipt.json")
    return parsed_json