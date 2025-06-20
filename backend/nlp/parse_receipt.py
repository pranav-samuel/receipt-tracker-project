import json
import google.generativeai as genai
from dotenv import load_dotenv
import os
import re
from backend.extra.output_formatter import save_to_json

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def clean_gemini_output(text: str) -> str:
    return re.sub(r"^```(?:json)?\n(.+?)\n```$", r"\1", text.strip(), flags=re.DOTALL)

def send_text_to_gpt(ocr_text: str) -> dict:
    prompt = f"""
    You are an expert assistant specializing in interpreting and cleaning grocery receipt data extracted from OCR. 

    Receipts often contain cryptic abbreviations, truncated product names, unclear layouts, and missing information. Your task is to carefully analyze the raw OCR text and infer the correct and complete details of each purchased item.

    For each item on the receipt, extract and normalize the following information:

    - **product_name:** A clear, human-readable product name, expanded from any abbreviations or shorthand.
    - **weight:** The weight of the item in kilograms (kg), if present or inferable; otherwise null.
    - **unit_price:** The price per kilogram or per unit, if present or inferable; otherwise null.
    - **total_price:** The total price paid for that item.
    - **store_name:** The name of the store where the purchase was made, inferred from the receipt header or other contextual clues.
    - **date:** The date of the purchase in YYYY-MM-DD format, inferred from the receipt text.
    - **time:** The time of the purchase in HH:MM:SS am/pm format, inferred from the receipt text. The receipt will most likely have a 24-hour format, so convert it to 12-hour format with am/pm.
    - **location:** The location of the store, if available; otherwise null.
    If some information is missing or unclear, use context clues from surrounding lines or common retail patterns to infer the best possible values.

    Example interpretations:

    Input line: "MILK 2% 1GAL"
    Output: 
    
    "product_name": "Milk, fat 2%, 1 gallon",
    "weight": null,
    "unit_price": null,
    "total_price": 3.99
    

    Input lines:  
    "BAN 1 LB"  
    "$0.89/LB"  
    "0.45"  
    Output: 
    
    "product_name": "Bananas",
    "weight": 0.45,
    "unit_price": 0.89,
    "total_price": 0.40
    

    Input snippet:  
    "STORE: Whole Foods"  
    "DATE: 2025-06-10"
    "TIME": "14:30:24"
    "LOCATION: 8801 OHIO DR PLANO TX 75024"

    Extract "store_name" as "Whole Foods" and "date" as "2025-06-10" "time" as "2:30:24 pm" and "location" as "8801 OHIO DR PLANO TX 75024".

    Please output your response as a JSON object where each entry represents an item purchased, with keys as described above. Also include top-level keys `"store_name"`, `"date"`, `"time"` and `"location"` representing the receipt's metadata.

    Here is the raw OCR text of the receipt:

    {ocr_text}

    ---

    Remember: Be sure to clean and normalize item names, prices, and weights for consistency and accuracy.  
    Return only valid JSON — no extra commentary or markdown formatting.
    """

    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content(prompt)
    cleaned_text = clean_gemini_output(response.text)
    parsed_json = json.loads(cleaned_text)
    save_to_json(parsed_json, "structured_receipt.json")
    return parsed_json
