# # Modified backend endpoint to support both author and reviewer verification

from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF
import io

import asyncio  # Import asyncio for adding delay
import json
import random


app = FastAPI()

# frontend port (8081 in your case)
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081"
]

# for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


class User(BaseModel):
    id: int
    name: str
    email: str
    score: int = 0  # Default score is 0

# bulk request model
class BulkRequest(BaseModel):
    role: str  # 'author' or 'reviewer'
    users: List[User]

@app.post("/bulk-verify")
async def bulk_verify(request: BulkRequest):
    """
    Endpoint to process bulk users (authors or reviewers) and populate their score field.
    Simulates a throttle by adding a 500ms delay.
    """
    updated_users = []

    for user in request.users:
        # Example logic
        if request.role == "author":
            user.score = random.randint(0, 100)
        elif request.role == "reviewer":
            user.score = random.randint(0, 100)
        else:
            user.score = -1  # Default score

        updated_users.append(user)

     # Simulate a delay
    await asyncio.sleep(1)

    return {"role": request.role, "users": updated_users}


class TrustReportRequest(BaseModel):
    authors: List[User]
    reviewers: List[User]

@app.post("/export-pdf")
async def export_pdf(data: TrustReportRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    

    pdf.cell(200, 10, txt="Trust Score Report", ln=True, align='C')
    pdf.ln(10)

    pdf.cell(200, 10, txt="Authors:", ln=True)
    for author in data.authors:
        pdf.cell(200, 10, txt=f"{author.name} ({author.email}) - Score: {author.score}", ln=True)

    pdf.ln(5)
    pdf.cell(200, 10, txt="Reviewers:", ln=True)
    for reviewer in data.reviewers:
        pdf.cell(200, 10, txt=f"{reviewer.name} ({reviewer.email}) - Score: {reviewer.score}", ln=True)

    # Return PDF as bytes
    buffer = io.BytesIO()
    pdf.output(buffer)
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=trust-report.pdf"
        }
    )


@app.post("/verify")
async def verify_payload(request: Request):
    data = await request.json()
    json_data = json.dumps(data)
    print("Received verification:", json_data)
    return {"status": "ok", "received": json_data}


