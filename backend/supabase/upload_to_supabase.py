from supabase import create_client, Client
import os
import uuid
from dotenv import load_dotenv

load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def upload_receipt(data: dict):
    # Insert into receipts table
    receipt_id = str(uuid.uuid4())
    receipt = {
        "id": receipt_id,
        "store_name": data["store_name"],
        "date": data["date"],
        "location": data["location"]
    }

    supabase.table("receipts").insert(receipt).execute()

    # Insert items
    items = []
    for item in data["items"]:
        items.append({
            "id": str(uuid.uuid4()),
            "receipt_id": receipt_id,
            "product_name": item["product_name"],
            "total_price": item["total_price"],
            "weight": item.get("weight"),
            "unit_price": item.get("unit_price")
        })

    supabase.table("items").insert(items).execute()
