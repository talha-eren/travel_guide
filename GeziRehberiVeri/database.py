from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

database_url = os.getenv("DATABASE_URL")


client =MongoClient(database_url)

db = client["gezi_rehberi"]
collection = db["Cities"]

print("Bağlantı başarılı:", client is not None)
