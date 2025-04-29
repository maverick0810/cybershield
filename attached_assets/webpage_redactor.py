from redaction_pipeline2 import RedactionPipeline
from langchain_community.document_loaders import WebBaseLoader
import json
from datetime import datetime
import os

class WebpageRedactor:
    def __init__(self):  # <-- fixed here
        self.redactor = RedactionPipeline()

    def fetch_webpage_text(self, url: str):
        loader = WebBaseLoader(url)
        documents = loader.load()
        full_text = " ".join(doc.page_content for doc in documents)
        return full_text

    def redact_webpage(self, url: str, output_dir="outputs/"):
        raw_text = self.fetch_webpage_text(url)
        # result = self.redactor.run_pipeline(raw_text)

        # timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        # os.makedirs(output_dir, exist_ok=True)

        # output_path = os.path.join(output_dir, f"redacted_webpage_{timestamp}.txt")
        # with open(output_path, "w", encoding="utf-8") as f:
        #     f.write(result["rewritten_output"])

        # print(f"✅ Redacted webpage saved at {output_path}")
        return raw_text


if __name__ == "__main__":
    url = "https://anotepad.com/notes/c36mfksb"
    redactor = WebpageRedactor()
    output = redactor.redact_webpage(url)
    print(output)
    pipeline = RedactionPipeline()
    output = pipeline.run_pipeline(output)

    print(json.dumps(output, indent=2))
    # # Pretty print result (optional)
    # print(json.dumps(output, indent=2))
