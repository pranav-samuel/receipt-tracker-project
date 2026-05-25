import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.ocr.extract_text import extract_text_from_image
from backend.nlp.parse_receipt import send_text_to_gemini

app = FastAPI(title="Spendle")

# allows expo to conncet to server w/ my wifi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# accepts image files from mobile app, runs OCR, returns prefill data w/o supabase yet
@app.post("/api/parse-receipt")
async def parse_receipt_endpoint(file: UploadFile = File(...)):

    # make sure file is proper format
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an image.")

    try:
        # save incoming file to a temp location for processing
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # first, run documentAI OCR
        ocr_text = extract_text_from_image(temp_path)
        if not ocr_text or ocr_text == "No text found.":
            raise ValueError("No text could be extracted from image by Document AI.")
            
        # second, run gemini
        structured_payload = send_text_to_gemini(ocr_text)
        
        # get rid of temp
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        # return json to frontend review dashboard
        return structured_payload

    except Exception as e:
        # if problem with temp, then raise exception
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Server Pipeline Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # run server on port 8000 locally
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)