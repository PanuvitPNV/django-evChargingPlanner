# example/urls.py
from django.urls import path

from ev_charging_planner.views import index, allStation, evCar_data

urlpatterns = [
    path('', index, name='index'),
    
    # API
    path('api/all_station', allStation, name='all_station'),
    path('api/ev_car_data', evCar_data, name='ev_car_data'),
]