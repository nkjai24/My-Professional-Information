from fastapi import APIRouter, UploadFile, File, HTTPException
from app.pdf_utils import extract_text_from_pdf_bytes, clean_text, chunk_text

router = APIRouter()

@router.post("/process_pdf")
async def process_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # ✅ Extract text from PDF
        extracted_text = extract_text_from_pdf_bytes(contents)

        if not extracted_text or len(extracted_text.strip()) < 20:
            raise HTTPException(status_code=400, detail="No valid text found in PDF")

        # ✅ Clean text
        cleaned_text = clean_text(extracted_text)

        # ✅ Split into chunks
        chunk_list = chunk_text(cleaned_text)

        # ✅ Format for frontend
        chunks = [
            {"id": i, "text": chunk}
            for i, chunk in enumerate(chunk_list)
        ]

        return {
            "chunks": chunks
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))