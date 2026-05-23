import json
import os
from dotenv import load_dotenv
load_dotenv()
from backend.ocr.extract_text import extract_text_from_image
from backend.nlp.parse_receipt import send_text_to_gemini
from backend.supabase.upload_to_supabase import upload_receipt

load_dotenv()

IMAGE_PATH = "/Users/pranavsamuel/Downloads/walmart_receipt.png"

def main():
    print("⏳ Step 1: Extracting structural text with Document AI...")
    try:
        ocr_text = extract_text_from_image(IMAGE_PATH)
        print("✅ Extracted OCR Text from Document AI successfully!")
    except Exception as e:
        print(f"❌ Document AI Processing failed: {e}")
        return

    print("\n⏳ Step 2: Normalizing text via Gemini Enterprise...")
    try:
        parsed_receipt_dict = send_text_to_gemini(ocr_text)
        print("✅ Gemini Structured Data successfully parsed using Pydantic!")
    except Exception as e:
        print(f"❌ Gemini processing failed: {e}")
        return

    print("\n⏳ Step 3: Saving relational receipt tables to Supabase...")
    try:
        upload_receipt(parsed_receipt_dict)
        print("🎉 Success! Receipt records and analytical line items are live in Supabase.")
    except Exception as e:
        print(f"❌ Supabase execution failed: {e}")

if __name__ == "__main__":
    main()