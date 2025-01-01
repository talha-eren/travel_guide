from pymongo import MongoClient
import json
from bson import json_util
from datetime import datetime

# MongoDB bağlantı URI'si
MONGODB_URI = "mongodb+srv://vtysproje123:vtys323@sarslan.smmxa.mongodb.net/deneme?retryWrites=true&w=majority&appName=sarslan"

def connect_to_mongodb():
    try:
        client = MongoClient(MONGODB_URI)
        db = client.deneme  # veritabanı adı
        # Test connection
        client.server_info()
        return db
    except Exception as e:
        print(f"Bağlantı hatası: {e}")
        return None

def inspect_collection(collection):
    """Koleksiyonu incele ve istatistikleri göster"""
    print(f"\n=== {collection.name} Koleksiyonu ===")
    
    # Döküman sayısı
    doc_count = collection.count_documents({})
    print(f"Toplam döküman sayısı: {doc_count}")
    
    if doc_count > 0:
        # Örnek bir döküman göster
        sample_doc = collection.find_one()
        print("\nÖrnek döküman yapısı:")
        print(json.dumps(json.loads(json_util.dumps(sample_doc)), indent=2, ensure_ascii=False))
        
        # Alan istatistikleri
        print("\nAlan istatistikleri:")
        fields = set()
        for doc in collection.find().limit(100):  # İlk 100 dökümanı kontrol et
            fields.update(doc.keys())
        
        for field in sorted(fields):
            if field != '_id':
                distinct_count = len(collection.distinct(field))
                print(f"- {field}: {distinct_count} farklı değer")

def main():
    db = connect_to_mongodb()
    if db is None:
        return
    
    print("=== MongoDB Veritabanı İnceleme ===")
    print(f"Veritabanı: {db.name}")
    
    # Tüm koleksiyonları listele
    collections = db.list_collection_names()
    print(f"\nKoleksiyonlar: {', '.join(collections)}")
    
    # Her koleksiyonu incele
    for collection_name in collections:
        collection = db[collection_name]
        inspect_collection(collection)

if __name__ == "__main__":
    main() 