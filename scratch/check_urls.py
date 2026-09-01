import urllib.request
import re

html = urllib.request.urlopen('https://sentinal-iq-sigma.vercel.app/').read().decode()
js_files = re.findall(r'src="(/assets/[^"]+)"', html)
if js_files:
    js_url = 'https://sentinal-iq-sigma.vercel.app' + js_files[0]
    js_code = urllib.request.urlopen(js_url).read().decode()
    matches = [line for line in js_code.split(';') if 'onrender' in line]
    print('Matches with onrender:', matches[:5])
