from django.http import HttpResponsePermanentRedirect

class AppendSlashMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if not request.path_info.endswith('/'):
            new_path = f'{request.path_info}/'
            if request.GET:
                new_path += '?' + request.GET.urlencode()
            return HttpResponsePermanentRedirect(new_path)
        return response