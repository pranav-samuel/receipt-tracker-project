from datetime import datetime
import os
from google.cloud import vision

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:\\Users\\prana\\OneDrive\\Desktop\\Documents\\GitHub\\eco-impact-tracker\\googlevisionsa.json"

def extract_text_from_image(image_path: str) -> str:
    client = vision.ImageAnnotatorClient()
    with open(image_path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    annotations = response.text_annotations
    if not annotations:
        return "No text found"
    return annotations[0].description.strip()

