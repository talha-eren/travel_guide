from pymongo import MongoClient
from pymongo.server_api import ServerApi

class Database:
    def __init__(self,database_url,db_name):
        self.database_url= database_url
        self.db_name=db_name
        self.client=None
        self.db=None
     
#Database Bağlanma
    def conncet_db(self):
        try:
            self.client =MongoClient(self.database_url,server_api=ServerApi('1'))
            self.db = self.client[self.db_name]
            print(f"{self.db_name} veritabanına bağlantı başarılı")
        except Exception as e:
            print("Bağlantı başarısız",e)
            self.client =None
            self.db=None  

#Database bağlantı kesme                 
    def close_db(self):
        if self.client is not None:
            self.client.close()
            print(f"{self.db_name} veritabanının bağlantısı kapandı.")
        else:
            print("Bağlantı kapalı durumda")

#Koleksiyonu çekme            
    def get_collection(self,collection_name):
        if self.db is not None:
            if isinstance(collection_name, str):
                return self.db[collection_name]
            else:
                print(f"collection_name '{collection_name}' string olmalı.")
                return None
        else:
            print(f"{collection_name} adlı koleksiyona bağlanılamadı.")
            return None
        
#Veri Ekleme        
    def insertDb(self, collection_name, data):
        collection = self.get_collection(collection_name)
        if collection is not None:
            try:
                result = collection.insert_many(data)
                print(f"{len(data)} belge başarıyla eklendi.")
                return result.inserted_ids
            except Exception as e:
                print(f"{collection_name} koleksiyonuna veri eklerken hata oluştu: {e}")    
        return None
