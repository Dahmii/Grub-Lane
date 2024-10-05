import requests

# Example data from extracted images
dishes = [
    {"name": "Water PET", "price": 2000},
    {"name": "Latte", "price": 3500},
    {"name": "Cappuccino", "price": 3500},
    {"name": "Chivita Juice", "price": 3000},
    {"name": "Coca-Cola PET", "price": 2500},
    {"name": "Sprite Lemon PET", "price": 2500},
    {"name": "Fanta Orange PET", "price": 2500},
    {"name": "Snickers Milkshake", "price": 8500},
    {"name": "Strawberry Milkshake", "price": 8000},
    {"name": "Banana Milkshake", "price": 6000},
    {"name": "Maltina", "price": 3000},
    {"name": "Oreo Milkshake", "price": 13000},
    {"name": "Boozy Milkshake", "price": 10000},
    {"name": "Vanilla Milkshake", "price": 8500},
    {"name": "Mars Milkshake", "price": 8500},
    {"name": "Spicy Goat Meat", "price": 1600},
    {"name": "Beef Tripe", "price": 1500},
    {"name": "Cow Skin", "price": 1500},
    {"name": "Spicy Beef Chunks", "price": 1350},
    {"name": "Turkey Wing", "price": 49000},
    {"name": "Spicy Snails", "price": 45200},
    {"name": "Grilled Mackerel", "price": 43800},
    {"name": "Fried Hake", "price": 43200},
    {"name": "Chicken", "price": 2200},
    {"name": "Poundo Yam", "price": 1500},
    {"name": "Eba", "price": 1000},
    {"name": "Semovita", "price": 1000},
    {"name": "Oat", "price": 1000},
    {"name": "Assorted Meats Peppersoup", "price": 6500},
    {"name": "Egusi Soup", "price": 5500},
    {"name": "Efo Riro", "price": 5500},
    {"name": "Fish Pepper Soup", "price": 7500},
    {"name": "Ogbono Soup", "price": 7500},
    {"name": "Edikaikong", "price": 7500},
    {"name": "Afang Soup", "price": 47500},
    {"name": "Mixed Vegetable Salad", "price": 4500},
    {"name": "Nigerian Style Salad", "price": 4500},
    {"name": "The Fishy Okra", "price": 10000},
    {"name": "Goat Meat Peppersoup", "price": 7500},
    {"name": "Nigerian Smokey Jollof Rice", "price": 6500},
    {"name": "Beans Pottage", "price": 5500},
    {"name": "Unripe Plantain Pottage", "price": 5500},
    {"name": "Seafood Spaghetti", "price": 19000},
    {"name": "Jollof Bulgur", "price": 8500},
    {"name": "Nigerian Fried Rice with Liver", "price": 7500},
    {"name": "Yam Pottage", "price": 6500},
    {"name": "Beef Sausage Rolls", "price": 1500},
    {"name": "Crépe and Eggs Wrap", "price": 13000},
    {"name": "The Bean Panini", "price": 5000},
    {"name": "Pain Au Chocolat", "price": 3500},
    {"name": "Croissant", "price": 3000},
    {"name": "Baked Beans", "price": 1200},
    {"name": "Spiced Pap", "price": 1000},
    {"name": "Porridge Oats", "price": 1000},
    {"name": "Grilled Tomato", "price": 900},
    {"name": "Custard", "price": 850}
]

# API URL to upload the dishes
api_url = "https://your-api-endpoint.com/dishes"

# Function to upload dishes to the API
def upload_dishes(dishes):
    for dish in dishes:
        response = requests.post(api_url, json=dish)
        if response.status_code == 201:
            print(f"Uploaded: {dish['name']} - {dish['price']}")
        else:
            print(f"Failed to upload: {dish['name']} - Status code: {response.status_code}")