from pymongo import MongoClient
import pprint

# MongoDB bağlantı URL'si
MONGODB_URI = "mongodb+srv://vtysproje123:vtys323@sarslan.smmxa.mongodb.net/deneme?retryWrites=true&w=majority&appName=sarslan"

def inspect_mongodb():
    try:
        # MongoDB'ye bağlan
        client = MongoClient(MONGODB_URI)
        db = client.deneme  # veritabanı adı

        # Tüm koleksiyonları listele
        print("\n=== Koleksiyonlar ===")
        collections = db.list_collection_names()
        for collection in collections:
            print(f"\n📁 Koleksiyon: {collection}")
            print("=" * 50)
            
            # Her koleksiyondaki ilk 5 dökümanı göster
            docs = list(db[collection].find().limit(5))
            print(f"Toplam döküman sayısı: {db[collection].count_documents({})}")
            print(f"İlk 5 döküman örneği:")
            for doc in docs:
                pprint.pprint(doc)
                print("-" * 30)

    except Exception as e:
        print(f"Hata oluştu: {e}")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    inspect_mongodb() 