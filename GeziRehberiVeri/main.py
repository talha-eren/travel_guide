import os
from database import Database
from placeİnfo import placeinfo
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DATABASE_URL=os.getenv("DATABASE_URL")

#Plakaya göre şehir kordinatını alma
def get_location(line_number,file_name):
    try:
        with open(file_name,'r') as file:
            line=file.readlines()
            if 1<= line_number <=len(line):
                return line[line_number-1].strip()
            else:
                return "Geçerli bir şehir kodu giriniz."
    except Exception as e:
        return "Dosya bulunamadı", e
    

if __name__ == "__main__":
    file_name="location.txt"
    line_number=int(input("Şehirin plakasını giriniz:"))
    location=get_location(line_number,file_name)
    database=Database(DATABASE_URL,"deneme")
    print(location)
    place_info=placeinfo(location)
    places_data=place_info.get_data()
    place_info.save_json()
    database.conncet_db()
    database.insertDb("places",places_data)
