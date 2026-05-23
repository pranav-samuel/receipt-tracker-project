import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field # enforces data types at runtime
from google import genai
from google.genai import types
from backend.extra.output_formatter import save_to_json

# define schema, use pydantic model
class ReceiptItemSchema(BaseModel):
    raw_item_name: str = Field(description="Exactly what the receipt says (e.g., '12 CT LRG EGGS')")
    standard_name: str = Field(description="A clean, generic name (e.g., 'Eggs')")
    category: str = Field(description="Accurate expenditure category (e.g., 'Groceries')")
    quantity: int = Field(description="The number of packs/items purchased on that line row. Usually 1.")
    package_size: int = Field(description="The count of items inside the pack (e.g., 12 for a 12-pack, 24 for a 24-pack). If it's a single item or not specified, default to 1.")
    price: float = Field(description="The total price paid for this line item")

class ReceiptSchema(BaseModel):
    store_name: str = Field(description="The identified name of the store or merchant")
    purchase_date: str = Field(description="The transaction date formatted strictly as YYYY-MM-DD")
    total_amount: float = Field(description="The calculated grand total paid on the receipt")
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
    Identify the store name, transaction date, total amount paid, and every individual item purchased.
    Clean up cryptic shorthand name items into recognizable, standardized items and categorize them accurately.
    
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