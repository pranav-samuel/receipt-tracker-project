from backend.ocr.extract_text import extract_text_from_image
from backend.nlp.parse_receipt import send_text_to_gpt
from backend.supabase.upload_to_supabase import upload_receipt
import json

image_path = r"C:/Users/prana/Downloads/walmartreceipt.jpg"

print("⏳ Extracting text with Google Cloud Vision...")
ocr_text = extract_text_from_image(image_path)
print("✅ Extracted OCR Text:")
print(ocr_text)

print("\n⏳ Sending text to GPT...")
try:
    parsed_text = send_text_to_gpt(ocr_text)
    print("✅ GPT Parsed Data:")
    print(parsed_text)
except Exception as e:
    print("❌ GPT failed:", e)

print("\n⏳ Saving structured receipt data to Supabase...")
with open("structured_receipt.json") as f:
    receipt_data = json.load(f)
upload_receipt(receipt_data)
print("✅ Receipt data uploaded to Supabase successfully!")