import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class placeinfo:
    def __init__(self, location, radius=5000, place_type="tourist_attraction"):
        self.location = location
        self.radius = radius
        self.place_type = place_type
        self.excluded_keywords = ["otel", "hotel", "motel", "inn", "residence", "suit", "hostel", "pansion", "flats","gokart","turizm"]
        self.all_place_details = []

#Şehir adını almak için kullanılan metot
    def geo_get_cityname(self, lat, lng):
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&language=tr&key={GOOGLE_API_KEY}"
        geocode_response = requests.get(geocode_url)
        geocode_data = geocode_response.json()

        if geocode_data["status"] == "OK":
            for component in geocode_data["results"][0]["address_components"]:
                if "locality" in component["types"] or "administrative_area_level_1" in component["types"]:
                    return component["long_name"]
        return "Şehir adı bulunamadı"
    
#Mekan açıklaması almak için kullanılan metot
    def wikipedia_summary(self, place_name):
        wiki_url = f"https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=True&explaintext=True&titles={place_name}&format=json"
        wiki_response = requests.get(wiki_url)

        if wiki_response.status_code != 200:
            return {"title": None, "summary": "Wikipedia API isteği hata."}

        wiki_data = wiki_response.json()
        pages = wiki_data.get("query", {}).get("pages", {})
        page = next(iter(pages.values()))

        if "extract" in page and page["extract"]:
            title = page.get("title", "")
            summary = page["extract"]
            return {"title": title, "summary": summary}
        else:
            return {"title": None, "summary": "Bu yer için bilgi bulunamadı."}
        
#Otel gibi yerleri çekmemek için mekanları filtreleme
    def filter_place(self, places):
        filtered_places = []
        for place in places:
            place_name = place.get('name', '').lower()
            if not any(keyword in place_name for keyword in self.excluded_keywords):
                filtered_places.append(place)
        return filtered_places
    
#Mekan bilgilerini çekme
    def get_place_details(self, filtered_places):
        for place in filtered_places:
            place_id = place["place_id"]

            details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&language=tr&key={GOOGLE_API_KEY}"
            details_response = requests.get(details_url)

            #Döngü bozulmaması için
            if details_response.status_code != 200:
                print(f"API Hatası {place_id} için: {details_response.status_code}")
                continue

            place_details = details_response.json().get("result", {})
            if not place_details:
                print(f"{place_id} için detay bulunamadı.")
                continue

            place_photos = place_details.get("photos", [])
            photo_urls = []

            for photo in place_photos:
                photo_reference = photo["photo_reference"]
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference={photo_reference}&key={GOOGLE_API_KEY}"
                photo_urls.append(photo_url)

            map_url = f"https://www.google.com/maps/place/?q=place_id:{place_id}"
            place_name = place_details.get("name")
            wiki_info = self.wikipedia_summary(place_name)

            location_info = place_details.get("geometry", {}).get("location", {})
            city_name = self.geo_get_cityname(location_info.get("lat"), location_info.get("lng"))

            # Verilerin kaydedilmesi
            place_info = {
                "place_id": place_id,
                "name": place_details.get("name"),
                "address": place_details.get("formatted_address"),
                "city_name": city_name,
                "location": place_details.get("geometry", {}).get("location"),
                "rating": place_details.get("rating"),
                "user_ratings_total": place_details.get("user_ratings_total"),
                "opening_hours": place_details.get("opening_hours", {}).get("weekday_text", []),
                "phone_number": place_details.get("formatted_phone_number"),
                "website": place_details.get("website"),
                "types": place_details.get("types", []),
                "wiki_summary": wiki_info["summary"],
                "photo": photo_urls,
                "map": map_url,
            }

            self.all_place_details.append(place_info)

#Tüm metotların işlemleri yapması
    def get_data(self):
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={self.location}&radius={self.radius}&type={self.place_type}&language=tr&key={GOOGLE_API_KEY}"
        response = requests.get(url)
        places = response.json().get("results", [])

        filtered_places = self.filter_place(places)
        if not filtered_places:
            print("Filtrelenmis yer bulunamadı.")
            return []

        self.get_place_details(filtered_places)
        return self.all_place_details

# Bilgileri Json'a Kaydetme
    def save_json(self):
        with open("places_details.json", "w", encoding="utf-8") as file:
            json.dump(self.all_place_details, file, ensure_ascii=False, indent=4)
        print("Veriler 'places_details.json' dosyasına kaydedildi.")