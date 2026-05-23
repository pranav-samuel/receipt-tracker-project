import os
from supabase import create_client, Client

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ANON_KEY") 

supabase: Client = create_client(url, key)


def upload_receipt(data: dict):
    
    receipt_record = {
        "store_name": data["store_name"],
        "purchase_date": data["purchase_date"],
        "total_amount": data["total_amount"]
    }
    
    # insert into the main 'receipts' table
    receipt_insert = supabase.table("receipts").insert(receipt_record).execute()
    
    if not receipt_insert.data:
        raise RuntimeError("Failed to insert receipt into Supabase.")
         
    # get the auto-generated UUID
    db_receipt_id = receipt_insert.data[0]["id"]

    # add each individual item into list and insert list as receipt_items
    items_to_insert = []
    for item in data["items"]:
        items_to_insert.append({
            "receipt_id": db_receipt_id, # Relational link
            "raw_item_name": item["raw_item_name"],
            "standard_name": item["standard_name"],
            "category": item["category"],
            "package_size": item["package_size"],
            "quantity": item["quantity"],
            "price": item["price"]
        })

    if items_to_insert:
        supabase.table("receipt_items").insert(items_to_insert).execute()