
# TEST SCRIPT - Load and verify JSON data
import json
import os

data_dir = r"H:\via codos all projects\pvfinalMesandu\ai_travel_system\data"

# Load destinations
with open(os.path.join(data_dir, "destinations.json"), 'r') as f:
    destinations = json.load(f)
    print(f"Loaded {len(destinations['destinations'])} destinations")

# Load hotel data
with open(os.path.join(data_dir, "complete_hotel_data.json"), 'r') as f:
    hotel_data = json.load(f)
    print(f"Loaded hotel data with {len(hotel_data['complete_dataset'])} records")

print("✅ All JSON files loaded successfully!")
