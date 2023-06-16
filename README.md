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
