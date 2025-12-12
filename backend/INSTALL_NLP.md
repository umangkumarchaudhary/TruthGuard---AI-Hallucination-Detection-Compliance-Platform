# Installing NLP Dependencies

## Quick Install

After installing base requirements, install NLP dependencies:

```bash
cd backend
pip install -r requirements.txt
```

The requirements.txt now includes all NLP dependencies.

## Manual Install (if needed)

```bash
pip install spacy>=3.7.0
pip install transformers>=4.35.0
pip install sentence-transformers>=2.2.0
pip install nltk>=3.8.0
pip install openai>=1.0.0
pip install beautifulsoup4>=4.12.0
pip install requests>=2.31.0
```

## Download spaCy Model (Optional)

For better NLP, download spaCy English model:

```bash
python -m spacy download en_core_web_sm
```

**Note:** This is optional - the current implementation works without it.

## Verify Installation

```bash
python -c "import spacy; import transformers; import nltk; print('✅ All NLP libraries installed')"
```

## Test Detection System

```bash
python test_detection.py
```

This will test all detection services.

