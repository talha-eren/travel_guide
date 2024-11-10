import os
from database import Database
from placeİnfo import placeinfo
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DATABASE_URL=os.getenv("DATABASE_URL")

if __name__ == "__main__":
    database=Database(DATABASE_URL,"gezi_rehberi")
    place_info=placeinfo("41.0082,28.9784")
    places_data=place_info.get_data()
    database.conncet_db()
    database.insertDb("Cities",places_data)
