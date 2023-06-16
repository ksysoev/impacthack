# impacthack

## Register a shop:

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "shopId": "1",
  "shopName": "ImpactHack Shop",
  "latitude": 51.1234,
  "longitude": -0.9876,
  "products": [
    { "name": "Side Mirrors", "category": "Exterior" },
    { "name": "Engine Oil", "category": "Maintenance" },
    { "name": "Spark Plugs", "category": "Ignition" },
    { "name": "Air Filter", "category": "Filters" },
    { "name": "Brake Pads", "category": "Brakes" }
  ]
}' http://localhost:8000/shops
```

## Search for shops with a specific product:

```bash
curl http://localhost:8000/search/Side%20Mirrors
```

## Get categories of a shop by shopId:

```bash
curl http://localhost:8000/shop/1/categories
```

## Get all categories:

```bash
curl http://localhost:8000/categories
```

## Get all shops within a given range:

```bash
curl http://localhost:8000/shops/range/51.1234/-0.9876/5
```


## Search

The search function is an controller that searches for shops based on the specified search criteria.

Request
The search function expects a GET request with the following query parameters:

- latitude (required): The latitude of the user's location.
- longitude (required): The longitude of the user's location.
- radius (optional): The search radius in kilometers (default is 10km).
- category (optional): The category of the shops to search for.
- name (optional): The name of the shops to search for.
- sortby (optional): The field to sort the search results by, possible values distance, rating, reliability (default is distance).
- pay_by_card (optional): Whether the shop accepts card payments.
- product (optional): The product to search for.
- brand (optional): The brand to search for.


```bash
curl 'http://localhost:8000/search?longitude=101.7309175&latitude=3.223186&radius=10&sortby=distance&brand=bmw&pay_by_card=1'
```