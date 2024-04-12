# example/views.py
import json
from datetime import datetime

from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import render
from django.views.generic import TemplateView
from django.conf import settings

from pymongo import MongoClient
from bson import json_util


# ----------------- Views -----------------

def GoogleMaps(request):
    args = {}
    args['google_maps_api_key'] = settings.GOOGLE_MAPS_API_KEY

    return render(request, 'GoogleMaps.html', args)


# ----------------- API -----------------

def allStation(request):
    client = MongoClient(settings.MONGODB_URI)
    db = client['CleanedEVstationData']['Allstation']
    data = list(db.find())

    return JsonResponse(parse_json(data), safe=False)


def evCar_data(request):

    # data from --> https://ev-database.org/

    if request.method == 'GET':

        data = [
            {
                "brand": "BMW",
                "model": "iX3",
                "useable_capacity": "74.0 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "BYD",
                "model": "ATTO 3",
                "useable_capacity": "60.5 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "BYD",
                "model": "HAN",
                "useable_capacity": "85.4 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "Nissan",
                "model": "Leaf",
                "useable_capacity": "39.0 kWh",
                "charging_port": ["Type2", "CHAdeMO"],
            },
            {
                "brand": "Tesla",
                "model": "Model 3",
                "useable_capacity": "57.5 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "Tesla",
                "model": "Model Y",
                "useable_capacity": "57.5 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "Tesla",
                "model": "Model S Dual Motor",
                "useable_capacity": "95.0 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
            {
                "brand": "Tesla",
                "model": "Model S Plaid",
                "useable_capacity": "95.0 kWh",
                "charging_port": ["Type2", "CCS2"],
            },
        ]

        return JsonResponse(data, safe=False)

# ----------------- Helper Functions -----------------

def parse_json(data):
    return json.loads(json_util.dumps(data))

