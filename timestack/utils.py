# Find a JSON parser
try:
    import json
    _parse_json = lambda s: json.loads(s)
    _build_json = lambda s: json.dumps(s)
except ImportError:
    try:
        import simplejson as json
        _parse_json = lambda s: json.loads(s)
    	_build_json = lambda s: json.dumps(s)
    except ImportError:
        # For Google AppEngine
        from django.utils import simplejson as json
        _parse_json = lambda s: json.loads(s)
    	_build_json = lambda s: json.dumps(s)

try:
    from xml.etree import cElementTree as ElementTree
except ImportError:
    try:
        import cElementTree as ElementTree
    except ImportError:
        try:
            from xml.etree import ElementTree
        except ImportError:
            from elementtree import ElementTree