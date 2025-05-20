# # Modified backend endpoint to support both author and reviewer verification

from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF
import io
from datetime import datetime


import asyncio  # Import asyncio for adding delay
import json
import random


app = FastAPI()

# frontend port
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
    score: int = 0  # Default score

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
            user.score = 0  # Default score

        updated_users.append(user)

     # Simulate a delay
    await asyncio.sleep(1)

    return {"role": request.role, "users": updated_users}


class TrustReportRequest(BaseModel):
    authors: List[User]
    reviewers: List[User]


class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 16)
        self.cell(0, 10, "Trust Score Report", border=False, ln=True, align="C")

         # Current date in top-right corner
        self.set_font("Arial", "", 11)
        date_str = datetime.now().strftime("%B %d, %Y")
        self.set_xy(150, 10)
        self.cell(0, 10, date_str, ln=True, align="R")

        self.ln(10)

    def divider(self):
        self.set_draw_color(169, 169, 169)  # grey
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def add_table(self, title, users):
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, f"{title}:", ln=True)

        # Table header
        self.set_font("Arial", "B", 11)
        self.cell(60, 8, "Name", border=1)
        self.cell(80, 8, "Email", border=1)
        self.cell(30, 8, "Score", border=1, ln=True)

        # Table rows
        self.set_font("Arial", "", 11)
        for user in users:
            self.cell(60, 8, user.name, border=1)
            # Add mailto link
            email_link = f"mailto:{user.email}"
            email_width = 80
            self.cell(email_width, 8, user.email, border=1, ln=0)
            x, y = self.get_x() - email_width, self.get_y()
            self.link(x, y, email_width, 8, email_link)

            self.cell(30, 8, str(user.score), border=1, ln=True)
        self.ln(5)


@app.post("/export-pdf")
async def export_pdf(data: TrustReportRequest):
    pdf = PDF()
    pdf.add_page()

    # Add Authors table
    pdf.add_table("Authors", data.authors)
    # pdf.divider()

    # Add Reviewers table
    pdf.add_table("Reviewers", data.reviewers)

    # Return PDF as bytes
    buffer = io.BytesIO()
    pdf.output(buffer)
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=trust-report.pdf"}
    )


@app.post("/verify")
async def verify_payload(request: Request):
    data = await request.json()
    json_data = json.dumps(data)
    print("Received verification:", json_data)
    return {"status": "ok", "received": json_data}
