# example/urls.py
from django.urls import path

from ev_charging_planner.views import GoogleMaps, allStation, evCar_data, test

urlpatterns = [
    path('', GoogleMaps, name='GoogleMaps'),
    
    # API
    path('api/all_station/', allStation),
    path('api/ev_car_data', evCar_data),
    path('api/test', test),
]