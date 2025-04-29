import spacy
import re
import json
import numpy as np
from datetime import datetime
from spacy.pipeline import EntityRuler
from langchain_google_genai import ChatGoogleGenerativeAI
from transformers import pipeline
from dotenv import load_dotenv
load_dotenv()
class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle non-serializable types."""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, (np.floating, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, datetime):
            return obj.isoformat()
        if hasattr(obj, 'to_json'):
            return obj.to_json()
        return super().default(obj)

class SensitiveDetector:
    sensitive_patterns = {
        'MENTAL_HEALTH': [
            r'(?i)depression', r'(?i)anxiety', r'(?i)trauma', r'(?i)panic\s*attack',
            r'(?i)bipolar', r'(?i)schizophrenia', r'(?i)eating\s*disorder',
            r'(?i)mental\s*health', r'(?i)therapy', r'(?i)counseling'
        ],
        'PERSONAL_CRISIS': [
            r'(?i)suicidal', r'(?i)self\s*harm', r'(?i)heartbreak', r'(?i)grief',
            r'(?i)divorce', r'(?i)bankruptcy', r'(?i)loss\s*of\s*job',
            r'(?i)financial\s*crisis', r'(?i)debt'
        ],
        'MEDICAL': [
            r'(?i)chronic\s*illness', r'(?i)diagnosis', r'(?i)medication',
            r'(?i)treatment', r'(?i)surgery', r'(?i)hospital', r'(?i)disease',
            r'(?i)cancer', r'(?i)hiv', r'(?i)aids'
        ],
        'ABUSE': [
            r'(?i)abuse', r'(?i)assault', r'(?i)harassment', r'(?i)violence',
            r'(?i)victim', r'(?i)trauma', r'(?i)ptsd', r'(?i)stalking'
        ],
        'BIOMETRIC': [
            r'(?i)fingerprint\s*(id|scan|data)?',
            r'(?i)retina\s*(scan|pattern)',
            r'(?i)iris\s*(scan|pattern|recognition)',
            r'(?i)facial\s*(recognition|scan|data)',
            r'(?i)voice\s*(print|pattern|recognition)',
            r'(?i)dna\s*(profile|sequence|data)',
            r'(?i)palm\s*(print|scan|vein)',
            r'(?i)gait\s*analysis',
            r'(?i)heartbeat\s*pattern'
        ],
        'GENETIC': [
            r'(?i)genetic\s*(profile|data|marker|test)',
            r'(?i)genome\s*(sequence|data)',
            r'(?i)dna\s*test\s*results?',
            r'(?i)chromosom(e|al)\s*(pattern|abnormality)',
            r'(?i)hereditary\s*condition',
            r'(?i)genetic\s*predisposition'
        ],
        'BEHAVIORAL': [
            r'(?i)browsing\s*history',
            r'(?i)search\s*patterns?',
            r'(?i)online\s*behavior',
            r'(?i)purchase\s*history',
            r'(?i)location\s*tracking',
            r'(?i)movement\s*patterns?',
            r'(?i)social\s*media\s*activity',
            r'(?i)device\s*usage\s*patterns?'
        ]
    }

    @staticmethod
    def find_sensitive(text):
        flagged = []
        for category, patterns in SensitiveDetector.sensitive_patterns.items():
            for pattern in patterns:
                for match in re.finditer(pattern, text):
                    context_start = max(0, match.start() - 50)
                    context_end = min(len(text), match.end() + 50)
                    context = text[context_start:context_end]
                    
                    flagged.append({
                        "text": match.group(),
                        "start": match.start(),
                        "end": match.end(),
                        "label": f"SENSITIVE_{category}",
                        "source": "sensitive_pattern",
                        "confidence": 0.95,
                        "context": context
                    })
        return flagged

class RedactionPipeline:
    def __init__(self, model_name="gemini-1.5-pro", version="v1.2"):
        self.model = ChatGoogleGenerativeAI(model=model_name)
        self.version = version
        self.nlp = spacy.load("en_core_web_sm")
        
        # Initialize ML-based NER
        try:
            self.ml_ner = pipeline("ner", model="jean-baptiste/roberta-large-ner-english")
        except Exception as e:
            print(f"Warning: ML-based NER initialization failed: {e}")
            self.ml_ner = None

        # Add custom entity patterns
        ruler = self.nlp.add_pipe("entity_ruler", before="ner")
        patterns = [
            {"label": "EMAIL", "pattern": [{"TEXT": {"REGEX": r"\S+@\S+\.\S+"}}]},
            {"label": "SSN", "pattern": [{"TEXT": {"REGEX": r"\d{3}[-\s]?\d{2}[-\s]?\d{4}"}}]},
            {"label": "CREDIT_CARD", "pattern": [{"TEXT": {"REGEX": r"\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}"}}]},
            {"label": "BANK_ACCOUNT", "pattern": [{"TEXT": {"REGEX": r"\d{8,12}"}}]},
            {"label": "IP_ADDRESS", "pattern": [{"TEXT": {"REGEX": r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"}}]},
            {"label": "DOB", "pattern": [{"TEXT": {"REGEX": r"\d{1,2}[-/]\d{1,2}[-/]\d{2,4}"}}]},
            {"label": "EDUCATIONAL_ORG", "pattern": "Syracuse University"},
            # Enhanced employee identification patterns
            {"label": "EMPLOYEE_ID", "pattern": [
                {"TEXT": {"REGEX": r"(?i)(?:emp(?:loyee)?\s*id:?\s*)?[A-Z]?\d{4,6}"}},
                {"TEXT": {"REGEX": r"(?i)(?:staff\s*no:?\s*)?\d{4,6}"}}
            ]},
            # Enhanced phone number patterns
            {"label": "PHONE_NUMBER", "pattern": [
                {"TEXT": {"REGEX": r"\+?\d{1,3}[-\s]?\d{10}"}},  # International format
                {"TEXT": {"REGEX": r"\+?1?\s*\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}"}},  # US/Canada format
                {"TEXT": {"REGEX": r"\+?[\d]{1,3}\s*\(?[\d]{1,4}\)?[-.\s]?[\d\s]{4,10}"}}  # Generic international
            ]},
            # Enhanced name patterns for full name capture
            {"label": "FULL_NAME", "pattern": [
                {"TEXT": {"REGEX": r"[A-Z][a-z]+(?:\s+(?:d[\'e]\s*)?[A-Z][a-z]+){1,2}"}}
            ]},
            # Passport patterns
            {"label": "PASSPORT_NUMBER", "pattern": [
                {"TEXT": {"REGEX": r"[A-Z]\d{8}"}},  # US
                {"TEXT": {"REGEX": r"\d{9}GBR\d{7}"}},  # UK
                {"TEXT": {"REGEX": r"[A-Z]{2}\d{7}"}},  # EU
                {"TEXT": {"REGEX": r"[A-Z]{2}\d{6}"}}  # CAN
            ]},
            # Driver's license patterns
            {"label": "DRIVERS_LICENSE", "pattern": [
                {"TEXT": {"REGEX": r"[A-Z]\d{7}|[A-Z]\d{8}"}},  # US
                {"TEXT": {"REGEX": r"[A-Z]{5}\d{6}[A-Z]{2}\d{5}"}}  # UK
            ]},
            # Other identification patterns
            {"label": "NATIONAL_ID", "pattern": [{"TEXT": {"REGEX": r"[A-Z]\d{7}[A-Z]|\d{9}[A-Z]"}}]},
            {"label": "VIN", "pattern": [{"TEXT": {"REGEX": r"[A-HJ-NPR-Z\d]{17}"}}]},
            {"label": "LICENSE_PLATE", "pattern": [{"TEXT": {"REGEX": r"[A-Z0-9]{5,8}"}}]},
            {"label": "MEDICAL_RECORD", "pattern": [{"TEXT": {"REGEX": r"MRN\d{6}|PHR\d{8}"}}]},
            {"label": "INSURANCE_ID", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{3}\d{9}|\d{12}"}}]},
            {"label": "PROFESSIONAL_LICENSE", "pattern": [{"TEXT": {"REGEX": r"[A-Z]{2,4}\d{6,8}"}}]},
        ]
        ruler.add_patterns(patterns)

        # Add custom pipeline components for better entity detection
        if "custom_sentencizer" not in self.nlp.pipe_names:
            self.nlp.add_pipe("sentencizer")

        self.json_encoder = CustomJSONEncoder()

    def _get_ml_entities(self, text):
        """Get entities using ML-based NER model"""
        if not self.ml_ner:
            return []

        try:
            ml_entities = self.ml_ner(text)
            processed_entities = []
            
            for ent in ml_entities:
                processed_entities.append({
                    "text": ent["word"],
                    "label": ent["entity"],
                    "start": ent["start"],
                    "end": ent["end"],
                    "source": "ml_ner",
                    "confidence": ent["score"]
                })
            
            return processed_entities
        except Exception as e:
            print(f"Warning: ML-based NER failed: {e}")
            return []

    def preprocess(self, user_input: str):
        # Get cached result if available
        cache_key = hash(user_input)
        if hasattr(self, '_cache') and cache_key in self._cache:
            return self._cache[cache_key]

        doc = self.nlp(user_input)
        redacted_text = user_input
        redacted_entities = []

        # Process employee IDs first
        emp_id_pattern = r'(?i)(?:emp(?:loyee)?\s*id:?\s*)([A-Z]?\d{4,6})'
        for match in re.finditer(emp_id_pattern, redacted_text):
            context_start = max(0, match.start() - 50)
            context_end = min(len(redacted_text), match.end() + 50)
            context = redacted_text[context_start:context_end]
            
            redacted_text = redacted_text.replace(match.group(), f"[EMPLOYEE_ID]")
            redacted_entities.append({
                "text": match.group(1),  # Capture just the ID number
                "label": "EMPLOYEE_ID",
                "start": match.start(),
                "end": match.end(),
                "source": "regex",
                "confidence": 0.95,
                "context": context
            })

        # Process phone numbers
        phone_patterns = [
            r"\+?1?\s*\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}",  # US/Canada
            r"\+?[\d]{1,3}\s*\(?[\d]{1,4}\)?[-.\s]?[\d\s]{4,10}"   # International
        ]
        
        for pattern in phone_patterns:
            for match in re.finditer(pattern, redacted_text):
                phone_text = match.group()
                context_start = max(0, match.start() - 50)
                context_end = min(len(redacted_text), match.end() + 50)
                context = redacted_text[context_start:context_end]
                
                redacted_text = redacted_text.replace(phone_text, "[PHONE_NUMBER]")
                redacted_entities.append({
                    "text": phone_text,
                    "label": "PHONE_NUMBER",
                    "start": match.start(),
                    "end": match.end(),
                    "source": "regex",
                    "confidence": 0.95,
                    "context": context
                })

        # Process full names
        name_pattern = r'[A-Z][a-z]+(?:\s+(?:d[\'e]\s*)?[A-Z][a-z]+){1,2}'
        for match in re.finditer(name_pattern, redacted_text):
            context_start = max(0, match.start() - 50)
            context_end = min(len(redacted_text), match.end() + 50)
            context = redacted_text[context_start:context_end]
            
            redacted_text = redacted_text.replace(match.group(), "[PERSON]")
            redacted_entities.append({
                "text": match.group(),
                "label": "PERSON",
                "start": match.start(),
                "end": match.end(),
                "source": "regex",
                "confidence": 0.9,
                "context": context
            })

        # Process remaining entities using spaCy
        for ent in doc.ents:
            # Skip if entity was already detected
            if any(e["start"] <= ent.start_char and e["end"] >= ent.end_char for e in redacted_entities):
                continue

            if ent.label_ in ["PERSON", "ORG", "GPE", "EMAIL", "DATE", "EDUCATIONAL_ORG"]:
                context_start = max(0, ent.start_char - 50)
                context_end = min(len(user_input), ent.end_char + 50)
                context = user_input[context_start:context_end]

                redacted_text = redacted_text.replace(ent.text, f"[{ent.label_}]")
                redacted_entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "source": "spacy_ner",
                    "confidence": 0.85,
                    "context": context
                })

        # Process sensitive information
        sensitive_hits = SensitiveDetector.find_sensitive(redacted_text)
        for hit in sensitive_hits:
            if not any(e["start"] <= hit["start"] and e["end"] >= hit["end"] for e in redacted_entities):
                snippet = redacted_text[hit['start']:hit['end']]
                redacted_text = redacted_text.replace(snippet, f"[{hit['label']}]")
                redacted_entities.append(hit)

        # Cache the result
        if not hasattr(self, '_cache'):
            self._cache = {}
        self._cache[cache_key] = (redacted_text, redacted_entities)

        return redacted_text, redacted_entities

    def postprocess(self, llm_output: str):
        doc = self.nlp(llm_output)
        redacted_text = llm_output

        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "EMAIL", "DATE", "EDUCATIONAL_ORG"]:
                redacted_text = redacted_text.replace(ent.text, f"[REDACTED_{ent.label_}]")

        redacted_text = re.sub(r"\S+@\S+\.\S+", "[EMAIL]", redacted_text)
        return redacted_text

    def rewrite_prompt(self, text: str):
        prompt = (
            "Please rewrite the following message to preserve its meaning, "
            "but remove or generalize any private or sensitive information:\n\n"
            f"{text}"
        )
        result = self.model.invoke(prompt)
        return result.content

    def log_redaction(self, raw_input, preprocessed, redacted_entities, feedback=None, filename="redaction_log.jsonl"):
        """Log redaction results with custom JSON encoding."""
        summary = self._summarize(redacted_entities)
        
        # Convert any non-serializable types in redacted_entities
        processed_entities = []
        for entity in redacted_entities:
            processed_entity = {}
            for key, value in entity.items():
                if isinstance(value, (np.integer, np.floating, np.ndarray)):
                    processed_entity[key] = self.json_encoder.default(value)
                else:
                    processed_entity[key] = value
            processed_entities.append(processed_entity)

        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "pipeline_version": self.version,
            "raw_input": raw_input,
            "preprocessed_input": preprocessed,
            "redacted_entities": processed_entities,
            "redaction_summary": summary,
            "feedback": feedback
        }

        try:
            with open(filename, "a") as f:
                json_str = json.dumps(log_entry, cls=CustomJSONEncoder)
                f.write(json_str + "\n")
        except Exception as e:
            print(f"Warning: Failed to log redaction: {str(e)}")

    def _process_entity_for_json(self, entity):
        """Process entity dictionary to ensure JSON serializable values."""
        processed = {}
        for key, value in entity.items():
            if isinstance(value, (np.integer, np.floating, np.float32)):
                processed[key] = float(value)
            elif isinstance(value, dict):
                processed[key] = self._process_entity_for_json(value)
            elif isinstance(value, list):
                processed[key] = [self._process_entity_for_json(item) if isinstance(item, dict) 
                                else float(item) if isinstance(item, (np.integer, np.floating, np.float32))
                                else item for item in value]
            else:
                processed[key] = value
        return processed

    def _resolve_overlapping_entities(self, entities):
        """Resolve overlapping entities by keeping the one with higher confidence."""
        resolved = []
        entities = sorted(entities, key=lambda x: (x['start'], -x['confidence']))
        
        def overlaps(a, b):
            return not (a['end'] <= b['start'] or b['end'] <= a['start'])
        
        for entity in entities:
            # Check if this entity overlaps with any already resolved entity
            overlap = False
            for resolved_entity in resolved:
                if overlaps(entity, resolved_entity):
                    overlap = True
                    # If current entity has higher confidence, replace the resolved one
                    if entity['confidence'] > resolved_entity['confidence']:
                        resolved.remove(resolved_entity)
                        resolved.append(entity)
                    break
            if not overlap:
                resolved.append(entity)
        
        return resolved

    def _cross_validate_entities(self, entities):
        """Cross-validate entities using multiple detection methods."""
        validated = []
        
        # Group entities by text
        text_groups = {}
        for entity in entities:
            text = entity['text'].lower()
            if text not in text_groups:
                text_groups[text] = []
            text_groups[text].append(entity)
        
        for text, group in text_groups.items():
            if len(group) > 1:  # Multiple detections of same text
                # Calculate average confidence and most common label
                avg_confidence = sum(e['confidence'] for e in group) / len(group)
                label_counts = {}
                for e in group:
                    label_counts[e['label']] = label_counts.get(e['label'], 0) + 1
                most_common_label = max(label_counts.items(), key=lambda x: x[1])[0]
                
                # If detected by multiple methods with high confidence, boost confidence
                sources = set(e['source'] for e in group)
                if len(sources) > 1:
                    confidence_boost = min(0.05 * len(sources), 0.15)
                else:
                    confidence_boost = 0
                
                # Take the entity with highest confidence and update it
                best_entity = max(group, key=lambda x: x['confidence'])
                best_entity['confidence'] = min(1.0, avg_confidence + confidence_boost)
                best_entity['label'] = most_common_label
                best_entity['cross_validated'] = True
                validated.append(best_entity)
            else:
                validated.append(group[0])
        
        return validated

    def _analyze_context(self, text, entity, window_size=100):
        """Perform advanced contextual analysis for entity validation."""
        start = max(0, entity['start'] - window_size)
        end = min(len(text), entity['end'] + window_size)
        context = text[start:end].lower()
        
        # Strong fictional indicators - if any of these match, entity is definitely fictional
        fictional_indicators = [
            r'(?i)character\s+(?:named|called|in)',
            r'(?i)fictional\s+(?:character|person|name)',
            r'(?i)in\s+(?:the\s+)?(?:book|novel|story|movie|film|show|series|game)',
            r'(?i)played\s+by',
            r'(?i)role\s+of',
            r'(?i)protagonist',
            r'(?i)antagonist',
            r'(?i)hero\s+of',
            r'(?i)villain\s+in',
            r'(?i)main\s+character',
            r'(?i)username',
            r'(?i)player\s+name',
            r'(?i)avatar',
            r'(?i)gamer\s+tag'
        ]

        # Check for definitive fictional context first
        for indicator in fictional_indicators:
            if re.search(indicator, context):
                entity['is_fictional'] = True
                return -1.0  # Strong negative adjustment to ensure rejection
        
        # Context indicators that might invalidate an entity
        invalidating_contexts = {
            'PERSON': [
                r'(?i)imaginary',
                r'(?i)example\s+name',
                r'(?i)sample\s+name',
                r'(?i)placeholder',
                r'(?i)not\s+a\s+real\s+person'
            ],
            'MEDICAL': [
                r'(?i)researching',
                r'(?i)studying',
                r'(?i)article\s+about',
                r'(?i)information\s+on',
                r'(?i)learn\s+about',
                r'(?i)example\s+of',
                r'(?i)symptoms\s+(?:include|are|may)'
            ],
            'BIOMETRIC': [
                r'(?i)example\s+of',
                r'(?i)how\s+to',
                r'(?i)explanation\s+of',
                r'(?i)definition\s+of',
                r'(?i)tutorial'
            ]
        }

        # Context indicators that strengthen entity confidence
        validating_contexts = {
            'PERSON': [
                r'(?i)contacted',
                r'(?i)spoke\s+with',
                r'(?i)met\s+with',
                r'(?i)email\s+from',
                r'(?i)sincerely',
                r'(?i)regards',
                r'(?i)dear\s+\w+',
                r'(?i)signed\s+by',
                r'(?i)according\s+to'
            ],
            'MEDICAL': [
                r'(?i)diagnosed\s+with',
                r'(?i)prescribed',
                r'(?i)treatment\s+for',
                r'(?i)symptoms\s+of',
                r'(?i)medical\s+history',
                r'(?i)patient\s+(?:has|had|shows)',
                r'(?i)doctor\s+(?:said|noted|observed)'
            ],
            'BIOMETRIC': [
                r'(?i)scanned',
                r'(?i)recorded',
                r'(?i)measured',
                r'(?i)captured',
                r'(?i)collected',
                r'(?i)stored',
                r'(?i)database\s+entry'
            ]
        }

        confidence_adjustment = 0.0
        entity_type = entity['label'].split('_')[0]

        # Check invalidating contexts
        if entity_type in invalidating_contexts:
            for pattern in invalidating_contexts[entity_type]:
                if re.search(pattern, context):
                    confidence_adjustment -= 0.2

        # Check validating contexts
        if entity_type in validating_contexts:
            for pattern in validating_contexts[entity_type]:
                if re.search(pattern, context):
                    confidence_adjustment += 0.1

        # Check for proximity to other entities
        related_entities = self._find_related_entities(text, entity, window_size)
        if related_entities:
            confidence_adjustment += min(0.05 * len(related_entities), 0.15)

        return confidence_adjustment

    def _find_related_entities(self, text, entity, window_size):
        """Find entities that might be related to the current entity."""
        doc = self.nlp(text)
        related = []
        
        entity_span = doc.char_span(entity['start'], entity['end'])
        if not entity_span:
            return related

        # Define related entity types
        related_types = {
            'PERSON': ['ORG', 'TITLE', 'EMAIL'],
            'PASSPORT': ['PERSON', 'DOB', 'NATIONAL_ID'],
            'MEDICAL': ['PERSON', 'DOB', 'INSURANCE_ID'],
            'BIOMETRIC': ['PERSON', 'ID', 'MEDICAL_RECORD']
        }

        for ent in doc.ents:
            # Skip if it's the same entity
            if ent.start_char == entity['start'] and ent.end_char == entity['end']:
                continue

            # Check if entity is within window
            if abs(ent.start_char - entity['start']) <= window_size:
                entity_base_type = entity['label'].split('_')[0]
                if entity_base_type in related_types and ent.label_ in related_types[entity_base_type]:
                    related.append({
                        'text': ent.text,
                        'label': ent.label_,
                        'distance': abs(ent.start_char - entity['start'])
                    })

        return related

    def validate_entity(self, entity, context):
        """Enhanced validation with contextual analysis."""
        if not self._validate_format(entity['text'], entity['label']):
            return False

        # Perform contextual analysis
        confidence_adjustment = self._analyze_context(context, entity)
        entity['confidence'] = min(1.0, max(0.0, entity['confidence'] + confidence_adjustment))

        # If confidence drops too low after adjustment, reject the entity
        if entity['confidence'] < 0.6:
            return False

        # Original validation logic
        common_words = {'the', 'and', 'but', 'or', 'if', 'then', 'else', 'while', 'for'}
        
        if entity['label'].startswith('PERSON'):
            if entity['text'].lower() in common_words:
                return False
            if not any(word[0].isupper() for word in entity['text'].split()):
                return False
            if not re.match(r'^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$', entity['text']):
                entity['confidence'] *= 0.8

        elif entity['label'] == 'DATE':
            try:
                datetime.strptime(entity['text'], '%Y-%m-%d')
                return True
            except ValueError:
                try:
                    datetime.strptime(entity['text'], '%d/%m/%Y')
                    return True
                except ValueError:
                    if not re.match(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', entity['text']):
                        return False

        # Add validation for new entity types
        elif entity['label'].startswith('PASSPORT_NUMBER') or entity['label'].startswith('DRIVERS_LICENSE'):
            if not self._validate_id_checksum(entity['text'], entity['label']):
                entity['confidence'] *= 0.7

        return True

    def _validate_id_checksum(self, id_number, id_type):
        """Validate ID numbers using checksum algorithms where applicable."""
        # Implementation would include specific checksum algorithms for different ID types
        # This is a placeholder that could be expanded with actual checksum validation
        return True  # Default to True for now

    def _validate_format(self, text, label):
        """Validate format of specific entity types."""
        patterns = {
            'EMAIL': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            'PHONE': r'^\+?[\d\s\-()]{10,}$',
            'SSN': r'^\d{3}-?\d{2}-?\d{4}$',
            'CREDIT_CARD': r'^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$'
        }
        
        if label in patterns:
            return bool(re.match(patterns[label], text.strip()))
        return True

    def run_pipeline(self, raw_input, feedback: dict = None):
        """Enhanced pipeline with better fictional character handling, streamlined redaction, and LLM processing."""
        # Initial preprocessing and entity detection
        preprocessed_input, redactions = self.preprocess(raw_input)
        
        # Process entities for JSON serialization
        processed_redactions = [self._process_entity_for_json(entity) for entity in redactions]
        
        # Cross-validate and resolve entities
        cross_validated_entities = self._cross_validate_entities(processed_redactions)
        resolved_entities = self._resolve_overlapping_entities(cross_validated_entities)
        
        # Validate entities with enhanced context analysis
        validated_redactions = []
        for entity in resolved_entities:
            if self.validate_entity(entity, entity.get('context', '')):
                # Skip entities marked as fictional
                if not entity.get('is_fictional', False):
                    validated_redactions.append(entity)
        
        # Create redacted text
        validated_preprocessed = raw_input
        for entity in validated_redactions:
            validated_preprocessed = validated_preprocessed.replace(
                entity['text'], f"[{entity['label']}]"
            )

        # Log the redaction process
        self.log_redaction(raw_input, validated_preprocessed, validated_redactions, feedback=feedback)

        # Process through LLM with an enhanced prompt
        prompt = (
            "Given the following text where sensitive information has been redacted, "
            "please provide a response that:\n\n"
            "1. Acknowledges and respects the redacted information\n"
            "2. Maintains the context and meaning of the original message\n"
            "3. Provides a natural, coherent response\n"
            "4. Uses consistent redaction formatting - always use [TYPE] format, e.g., [PERSON], [EMAIL], [PHONE_NUMBER]\n"
            "5. Treats privacy and security as top priorities\n\n"
            f"Text: {validated_preprocessed}\n\n"
            "Important: When referring to redacted information, always use the exact format [TYPE] as shown in the text. "
            "Do not use variations like [redacted] or (redacted).\n\n"
            "Please provide your response:"
        )
        
        try:
            llm_response = self.model.invoke(prompt)
            llm_output = llm_response.content
            # Light post-processing for any missed patterns
            safe_output = self._light_postprocess(llm_output)
        except Exception as e:
            safe_output = f"Error processing LLM response: {str(e)}"
            llm_output = None

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "pipeline_version": self.version,
            "raw_input": raw_input,
            "preprocessed_input": validated_preprocessed,
            "llm_output": safe_output,
            "original_llm_response": llm_output,
            "redacted_entities": validated_redactions,
            "redaction_summary": self._summarize(validated_redactions),
            "validation_stats": {
                "total_entities_detected": len(redactions),
                "entities_after_validation": len(validated_redactions),
                "fictional_entities_filtered": len([e for e in resolved_entities if e.get('is_fictional', False)]),
                "confidence_distribution": {
                    "high": sum(1 for e in validated_redactions if e['confidence'] >= 0.9),
                    "medium": sum(1 for e in validated_redactions if 0.7 <= e['confidence'] < 0.9),
                    "low": sum(1 for e in validated_redactions if e['confidence'] < 0.7)
                }
            },
            "feedback": feedback,
            "prompt_used": prompt
        }

    def _light_postprocess(self, text):
        """Light postprocessing to catch any obviously missed patterns."""
        # Only check for obvious PII patterns that might have been generated
        patterns = [
            (r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]'),
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]'),
            (r'\b\d{3}[-]?\d{2}[-]?\d{4}\b', '[SSN]')
        ]
        
        result = text
        for pattern, replacement in patterns:
            result = re.sub(pattern, replacement, result)
        
        return result

    def _summarize(self, redacted_entities):
        summary = {}
        for ent in redacted_entities:
            summary[ent["label"]] = summary.get(ent["label"], 0) + 1
        return summary