from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, EpicViewSet, ObjectiveViewSet, OKRViewSet,
    ActivityViewSet, TaskViewSet, LogViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'epics', EpicViewSet)
router.register(r'objectives', ObjectiveViewSet)
router.register(r'okrs', OKRViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'logs', LogViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]