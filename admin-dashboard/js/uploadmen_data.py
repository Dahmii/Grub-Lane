import requests
menu_data = [
    {
        "name": "The American breakfast 1",
        "price": 13500,
        "menu_id": 2,
        "subcategory": "Early bird Grubs"
    },
    {
        "name": "Caesar Salad",
        "price": 15000,
        "menu_id": 2,
        "subcategory": "Salads"
    },
    {
        "name": "Caesar Salad with grilled chicken",
        "price": 19000,
        "menu_id": 2,
        "subcategory": "Salads"
    },
    {
        "name": "Panzanella",
        "price": 12000,
        "menu_id": 2,
        "subcategory": "Salads"
    },
    {
        "name": "Linguine Alfredo",
        "price": 13500,
        "menu_id": 2,
        "subcategory": "Pasta"
    },
    {
        "name": "Linguine Alfredo with shrimp",
        "price": 23500,
        "menu_id": 2,
        "subcategory": "Pasta"
    },
    {
        "name": "Sweet and sour chicken served with basmati rice",
        "price": 22000,
        "menu_id": 2,
        "subcategory": "Rice"
    },
    {
        "name": "Pan fried chicken breast, gremolata crumb and Risotto alla Milanese",
        "price": 30000,
        "menu_id": 2,
        "subcategory": "Rice"
    },
    {
        "name": "Mini pancakes, scrambled eggs and sausages",
        "price": 15500,
        "menu_id": 2,
        "subcategory": "Kids Menu"
    },
    {
        "name": "Chicken mac and cheese",
        "price": 11500,
        "menu_id": 2,
        "subcategory": "Kids Menu"
    },
    {
        "name": "Crispy chicken burger served with fries",
        "price": 15000,
        "menu_id": 2,
        "subcategory": "Burgers"
    },
    {
        "name": "The Grub burger served with fries",
        "price": 19500,
        "menu_id": 2,
        "subcategory": "Burgers"
    },
    {
        "name": "The wholesome breakfast",
        "price": 13500,
        "menu_id": 2,
        "subcategory": "Weightwatchers Menu"
    },
    {
        "name": "Oat pancakes or Oat waffles",
        "price": 10000,
        "menu_id": 2,
        "subcategory": "Weightwatchers Menu"
    },
    {
        "name": "Cheese and Tomato Pizza",
        "price": 13500,
        "menu_id": 2,
        "subcategory": "Pizza"
    },
    {
        "name": "Pepperoni Pizza",
        "price": 18000,
        "menu_id": 2,
        "subcategory": "Pizza"
    },
    {
        "name": "Beef Sausage Rolls",
        "price": 1500,
        "menu_id": 2,
        "subcategory": "Savoury Pastry"
    },
    {
        "name": "Chicken Pie",
        "price": 2000,
        "menu_id": 2,
        "subcategory": "Savoury Pastry"
    },
    {
        "name": "Apple Crumble and Custard",
        "price": 7500,
        "menu_id": 2,
        "subcategory": "Dessert"
    },
    {
        "name": "Chocolate Fudge Cake",
        "price": 5500,
        "menu_id": 2,
        "subcategory": "Dessert"
    },
    {
        "name": "Oreo Milkshake",
        "price": 12000,
        "menu_id": 2,
        "subcategory": "Milkshakes"
    },
    {
        "name": "Vanilla Milkshake",
        "price": 9000,
        "menu_id": 2,
        "subcategory": "Milkshakes"
    },
    {
        "name": "Caffe Latte",
        "price": 5000,
        "menu_id": 2,
        "subcategory": "Non-alcoholic Beverages"
    },
    {
        "name": "Espresso",
        "price": 3000,
        "menu_id": 2,
        "subcategory": "Non-alcoholic Beverages"
    },
    {
        "name": "Strawberry Lemonade",
        "price": 11000,
        "menu_id": 2,
        "subcategory": "Mocktails"
    },
    {
        "name": "Virgin Mojito",
        "price": 9000,
        "menu_id": 2,
        "subcategory": "Mocktails"
    },
    {
        "name": "Mojito",
        "price": 10000,
        "menu_id": 2,
        "subcategory": "Cocktails"
    },
    {
        "name": "Sex on the Beach",
        "price": 11000,
        "menu_id": 2,
        "subcategory": "Cocktails"
    },
    {
        "name": "Martini Asti Spumante",
        "price": 25000,
        "menu_id": 2,
        "subcategory": "Wines"
    },
    {
        "name": "Martini Sparkling Rose",
        "price": 25000,
        "menu_id": 2,
        "subcategory": "Wines"
    }
]

URL_ENDPOINT="https://grublanerestaurant.com/api/dish/createDish"

def upload_menu_to_endpoint(menu):
    try:
        
        for item in menu:
            payload = {
                "name": item["name"],
                "price": item["price"],
                "menu_id": item["menu_id"],
                "subcategory": item["subcategory"],

            }
            response=requests.post(URL_ENDPOINT,payload

            )
            if response.status_code ==200:
                print(f"{item["name"]} has been uploaded")
            print(f"{item["name"]}failed")
            print(response.json())

    except:
        raise ValueError(" Failed to upload menu")
    

upload_menu_to_endpoint(menu_data)