FROM python:3.11-slim

WORKDIR /app

COPY app.py .
COPY image.png .

RUN pip install fastapi uvicorn fpdf2

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]