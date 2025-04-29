import os
import whisper
import json
from datetime import datetime
from redaction_pipeline2 import RedactionPipeline

# Add ffmpeg to PATH
os.environ["PATH"] = os.pathsep.join([
    os.environ["PATH"],
    r"C:\ffmpeg-2025-04-23-git-25b0a8e295-full_build\bin"
])
class AudioTranscriber:
    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)

    def transcribe_audio(self, audio_path: str, language="en") -> list:
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        result = self.model.transcribe(audio_path, language=language)
        segments = result["segments"]

        transcript_segments = []
        for seg in segments:
            transcript_segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"]
            })

        return transcript_segments

class AudioRedactor:
    def __init__(self):
        self.transcriber = AudioTranscriber()

    def redact_audio(self, audio_path: str):
        print("\U0001F3A7 Transcribing audio...")
        segments = self.transcriber.transcribe_audio(audio_path)

        # Collect all text content
        transcript_text = " ".join(segment["text"] for segment in segments)

        print("\u270F\ufe0f Saving transcript...")
        os.makedirs("outputs", exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join("outputs", f"transcript_{timestamp}.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(segments, f, indent=2)

        print(f"\u2705 Transcript saved at {output_path}")
        return output_path, transcript_text

if __name__ == "__main__":
    audio_file = "Recording (3).m4a"  # Change if needed
    redactor = AudioRedactor()
    output_path, transcript_text = redactor.redact_audio(audio_file)
    print("\nTranscript Text:")
    print(transcript_text)
    pipeline = RedactionPipeline()
    output = pipeline.run_pipeline(transcript_text)

    print(json.dumps(output, indent=2))
