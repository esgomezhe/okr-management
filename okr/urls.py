from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    MissionViewSet, StrategicObjectiveViewSet,
    KeyResultViewSet, ActivityViewSet, TaskViewSet
)

router = routers.DefaultRouter()
router.register(r'missions', MissionViewSet)

missions_router = routers.NestedDefaultRouter(router, r'missions', lookup='mission')
missions_router.register(r'objectives', StrategicObjectiveViewSet, basename='mission-objectives')

objectives_router = routers.NestedDefaultRouter(missions_router, r'objectives', lookup='objective')
objectives_router.register(r'key-results', KeyResultViewSet, basename='objective-key-results')

key_results_router = routers.NestedDefaultRouter(objectives_router, r'key-results', lookup='key_result')
key_results_router.register(r'activities', ActivityViewSet, basename='key-result-activities')

activities_router = routers.NestedDefaultRouter(key_results_router, r'activities', lookup='activity')
activities_router.register(r'tasks', TaskViewSet, basename='activity-tasks')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(missions_router.urls)),
    path('', include(objectives_router.urls)),
    path('', include(key_results_router.urls)),
    path('', include(activities_router.urls)),
] 