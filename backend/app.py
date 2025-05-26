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
    editor: User
    journal_title: str = "Default Journal Title"  # Optional field with default value
    submission_id: int = 0  # Optional field with default value
    submission_title: str = "Default Submission Title"  # Optional field with default value


class PDF(FPDF):
    def __init__(self, data: TrustReportRequest):
        super().__init__()
        self.data = data
        # self.set_auto_page_break(auto=True, margin=15)
      


    def header(self):
        self.set_font("Arial", "B", 16)
        self.cell(0, 10, "Trust Score Report", border=False, ln=True, align="L")

        self.ln(15)  # Add a line break


        self.set_font("Arial", "B", 11)
        # Article details
        title_str = "Journal title:"
        self.set_xy(10, 20)
        self.cell(40, 6, title_str, ln=False, align="L")  # Adjusted width to 40
        self.set_font("Arial", "", 11)
        self.cell(0, 6, f"{self.data.journal_title}" if hasattr(self.data, 'journal_title') else "Journal Title Not Provided", ln=True, align="L")

        # Submission details
        self.set_font("Arial", "B", 11)
        submission_id_str = "Submission ID:"
        self.cell(40, 6, submission_id_str, ln=False, align="L")  # Adjusted width to 40
        self.set_font("Arial", "", 11)
        self.cell(0, 6, f"{self.data.submission_id}" if self.data.submission_id else "Submission ID Not Provided", ln=True, align="L")

        self.set_font("Arial", "B", 11)
        submission_title_str = "Submission title:"
        self.cell(40, 6, submission_title_str, ln=False, align="L")  # Adjusted width to 40
        self.set_font("Arial", "", 11)
        self.cell(0, 6, f"{self.data.submission_title}" if hasattr(self.data, 'submission_title') else "Submission Title Not Provided", ln=True, align="L")

        # Current date in top-right corner
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
    
    def footer(self):
        # Set the position at the bottom of the page
        self.set_y(-30)  # Adjust the Y position to leave space for the image and text

        # Add the image to the footer
        page_width = self.w
        image_width = 40  # Adjust the width of the image as needed
        x_position = (page_width - image_width) / 2  # Center the image horizontally
        self.image('./image.png', x=x_position, y=self.get_y(), w=image_width)

        # Add footer text
        # self.set_y(-15)
        # self.set_font("Arial", "I", 8)
        # self.cell(0, 10, f"Generated on {datetime.now().strftime('%B %d, %Y')}", 0, 0, "C")


@app.post("/export-pdf")
async def export_pdf(data: TrustReportRequest):
    pdf = PDF(data)
    pdf.add_page()
    
    pdf.ln(20)

    
    # Add Editor information
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Journal Editor:", ln=True)
    pdf.set_font("Arial", "", 11)
    pdf.cell(60, 8, data.editor.name, border=0)
    pdf.cell(80, 8, data.editor.email, border=0)
   
    pdf.ln(10)
    pdf.divider()

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
