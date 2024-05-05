# example/views.py
import json

from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings

from pymongo import MongoClient
from bson import json_util

# ----------------- Views -----------------
def index(request):
    args = {}
    args['google_maps_api_key'] = settings.GOOGLE_MAPS_API_KEY
    return render(request, 'base.html', args)

# ----------------- API -----------------
def allStation(request):
    client = MongoClient(settings.MONGODB_STATION_URI)
    db = client['CleanedEVstationData']['Allstation']
    data = list(db.find())
    return JsonResponse(parse_json(data), safe=False)

def evCar_data(request):
    # data from --> https://ev-database.org/
    client = MongoClient(settings.MONGODB_CAR_URI)
    db = client['scrape_data']['ev_database_org_simple']
    data = list(db.find())
    return JsonResponse(parse_json(data), safe=False)

# ----------------- Helper Functions -----------------

def parse_json(data):
    return json.loads(json_util.dumps(data))

