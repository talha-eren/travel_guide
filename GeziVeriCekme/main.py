import requests
import json

#api anahtarı
GOOGLE_API_KEY = ''

#location kordinatlarını yaz
location = "41.0082,28.9784"
radius = 5000
place_type = "tourist_attraction"

# locationa göre yerlerin bilgisi alınma kısmı
url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={place_type}&language=tr&key={GOOGLE_API_KEY}"
response = requests.get(url)
places = response.json().get("results", [])

def geo_get_cityname(lat,lng):
    location_geo=location
    geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&language=tr&key={GOOGLE_API_KEY}"
    geocode_response=requests.get(geocode_url)
    geocode_data=geocode_response.json()


    if geocode_data["status"] == "OK":
        for component in geocode_data["results"][0]["address_components"]:
            if "locality" in component["types"] or "administrative_area_level_1" in component["types"]:
                return component["long_name"]
    return "Şehir adı bulunamadı"


def wikipedia_summary(place_name):
    # Wikipedia api
    wiki_url = f"https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=True&explaintext=True&titles={place_name}&format=json"

    wiki_response = requests.get(wiki_url)

    #İstek kontrolu
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
        return {"title": None, "summary": "Bu yer için  bilgi bulunamadı."}

# Place id ile detaylı sorgu yapma
all_place_details = []
for place in places:
    place_id = place["place_id"]

    #Sorgu
    details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&language=tr&key={GOOGLE_API_KEY}"
    details_response = requests.get(details_url)
    place_details = details_response.json().get("result", {})

    place_photos=place_details.get("photos",[])
    photo_urls=[]

    for photo in place_photos:
        photo_reference=photo["photo_reference"]
        photo_url=f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_API_KEY}"
        photo_urls.append(photo_url)

    map_url = f"https://www.google.com/maps/place/?q=place_id:{place_id}"

    place_name=place_details.get("name")
    wiki_info = wikipedia_summary(place_name)

    location_info= place_details.get("geometry", {}).get("location", {})
    city_name=geo_get_cityname(location_info.get("lat"),location_info.get("lng"))

    #Alınacak bilgilerin kaydedilmesi
    place_info = {
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
        "photo":photo_urls,
        "map":map_url,
    }
    all_place_details.append(place_info)

#Bilgileri Jsona Kaydetme Kısmı
with open("places_details.json", "w", encoding="utf-8") as file:
    json.dump(all_place_details, file, ensure_ascii=False, indent=4)
print(response.json())
print("Veriler 'places_details.json' dosyasına kaydedildi.")
