# Routes package init file
from . import health, weather, predict, alerts, external_apis

# Try to import advanced ML routes
try:
    from . import flood_forecast
except ImportError:
    pass
