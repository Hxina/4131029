from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import stories

Base.metadata.create_all(bind=engine)

app = FastAPI(title="4131029 API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://4131029.xyz",
    "http://4131029.xyz",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stories.router)
