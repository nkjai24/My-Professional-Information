import os
from typing import Dict, Any, List

# ✅ IMPORT REAL PDF LOGIC
from app.pdf_utils import (
    extract_text_from_pdf_bytes,
    clean_text,
    chunk_text
)


class DocumentProcessor:
    def __init__(self):
        pass
    
    def process_document(self, file_path: str, file_extension: str) -> Dict[str, Any]:
        """Process uploaded document and extract content"""
        try:
            content = ""
            chunks: List[Dict[str, str]] = []
            
            # =========================
            # 📄 PDF PROCESSING (FIXED)
            # =========================
            if file_extension == "pdf":
                
                with open(file_path, "rb") as f:
                    raw_bytes = f.read()

                # ✅ Extract real text
                extracted_text = extract_text_from_pdf_bytes(raw_bytes)

                if not extracted_text or len(extracted_text.strip()) < 20:
                    raise ValueError("No valid text found in PDF")

                # ✅ Clean text
                cleaned_text = clean_text(extracted_text)

                # ✅ Split into chunks
                text_chunks = chunk_text(cleaned_text)

                # ✅ Convert to frontend format
                chunks = [
                    {"id": i, "text": chunk}
                    for i, chunk in enumerate(text_chunks)
                ]

                content = cleaned_text

            # =========================
            # 📄 TEXT FILE
            # =========================
            elif file_extension == "txt":
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                chunks = [{"id": 0, "text": content}]

            # =========================
            # 📄 OTHER FILES
            # =========================
            else:
                content = f"Content from {file_extension} file"
                chunks = [{"id": 0, "text": content}]

            return {
                "content": content,
                "chunks": chunks,
                "word_count": len(content.split()),
                "file_type": file_extension
            }
            
        except Exception as e:
            print(f"Error processing document: {e}")
            return {
                "content": "",
                "chunks": [],
                "word_count": 0,
                "file_type": file_extension
            }