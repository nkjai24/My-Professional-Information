# file: app/pdf_utils.py
from typing import List
import io
import re
import fitz  # PyMuPDF

def extract_text_from_pdf_bytes(b: bytes) -> str:
    """
    Extract all text from a PDF (given raw bytes).
    Uses PyMuPDF for good extraction quality.
    """
    try:
        doc = fitz.open(stream=io.BytesIO(b), filetype="pdf")
    except Exception as e:
        raise ValueError(f"Invalid PDF data: {e}")

    texts = []
    for page in doc:
        try:
            texts.append(page.get_text("text"))
        except Exception:
            texts.append("")
    return "\n".join(texts).strip()

def clean_text(s: str) -> str:
    """
    Normalize whitespace in extracted text.
    """
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"\n\s*\n+", "\n\n", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s.strip()

def chunk_text(text: str, max_chars: int = 2000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks of ~max_chars characters.
    Splits on paragraphs/sentences where possible.
    """
    if not text:
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    cur = ""
    for p in paragraphs:
        if len(cur) + len(p) + 2 <= max_chars:
            cur += (("\n\n" if cur else "") + p)
        else:
            if cur:
                chunks.append(cur)
            if len(p) <= max_chars:
                cur = p
            else:
                # force split long paragraph into smaller slices
                for i in range(0, len(p), max_chars - overlap):
                    chunks.append(p[i:i+max_chars])
                cur = ""
    if cur:
        chunks.append(cur)
    return chunks
