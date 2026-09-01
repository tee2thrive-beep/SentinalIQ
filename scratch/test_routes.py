import urllib.request
import urllib.error

try:
    urllib.request.urlopen('https://sentinaliq.onrender.com/incidents')
    print('Without /api: SUCCESS')
except urllib.error.HTTPError as e:
    print('Without /api: ERROR', e.code)

try:
    res = urllib.request.urlopen('https://sentinaliq.onrender.com/api/incidents')
    print('With /api: SUCCESS', res.status)
except urllib.error.HTTPError as e:
    print('With /api: ERROR', e.code)
