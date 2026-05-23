import os
from google.cloud import documentai

# sends receipt to google cloud document ai and it returns raw ocr text
def extract_text_from_image(image_path: str) -> str:
    client = documentai.DocumentProcessorServiceClient(
        client_options={"api_endpoint": f"{os.getenv('GCP_LOCATION')}-documentai.googleapis.com"}
    )
    
    processor_path = client.processor_path(
        os.getenv("GCP_PROJECT_ID"),
        os.getenv("GCP_LOCATION"),
        os.getenv("DOCUMENT_AI_PROCESSOR_ID")
    )
    
    # read image file as binary
    with open(image_path, 'rb') as image_file:
        content = image_file.read()
        
    raw_document = documentai.RawDocument(content=content, mime_type="image/jpeg")
    request = documentai.ProcessRequest(name=processor_path, raw_document=raw_document)
    
    response = client.process_document(request=request)
    
    
    if not response.document.text:
        return "No text found."
    
    return response.document.text.strip()

