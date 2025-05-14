from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProjectMembersViewSet, EpicViewSet,
    ObjectiveViewSet, OKRViewSet, ActivityViewSet, 
    TaskViewSet, LogViewSet, CommentViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'project-members', ProjectMembersViewSet, basename='project-members')
router.register(r'epics', EpicViewSet, basename='epics')
router.register(r'objectives', ObjectiveViewSet, basename='objectives')
router.register(r'okrs', OKRViewSet, basename='okrs')
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'logs', LogViewSet, basename='logs')
router.register(r'comments', CommentViewSet, basename='comments')

urlpatterns = [
    path('', include(router.urls)),
]
# Puedes filtrar proyectos por tipo: /okrs/projects/?tipo=mision o /okrs/projects/?tipo=proyecto