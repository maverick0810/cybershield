from paddleocr import PaddleOCR
from redaction_pipeline2 import RedactionPipeline
import json
# Initialize OCR model (English + numbers)
ocr = PaddleOCR(use_angle_cls=True, lang='en') 

def extract_text(image_path):
    result = ocr.ocr(image_path, cls=True)
    extracted_text = ""
    for line in result[0]:
        extracted_text += line[1][0] + "\n"
    return extracted_text

# Usage
text = extract_text(r'resume.png')
print(text)
pipeline = RedactionPipeline()
output = pipeline.run_pipeline(text)

# print(json.dumps(output, indent=2))
print(output["llm_output"])