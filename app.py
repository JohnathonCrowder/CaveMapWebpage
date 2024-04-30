from flask import Flask, render_template, jsonify, request
import pandas as pd
import folium
from geopy.distance import geodesic
import geocoder

app = Flask(__name__)

def csv_to_dataframe(filepath):
    try:
        df = pd.read_csv(filepath, on_bad_lines='skip')
        return df
    except FileNotFoundError:
        print(f"File not found: {filepath}")
        return None
    except pd.errors.EmptyDataError:
        print(f"Empty file: {filepath}")
        return None
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_caves')
def get_caves():
    filepath = r"E:\Github\Cave_Map\Cave_map.csv"
    df = csv_to_dataframe(filepath)
    if df is not None:
        caves = df[['cave', 'latitude', 'longitude']].dropna().to_dict(orient='records')
        return jsonify(caves)
    else:
        return jsonify([])

@app.route('/get_user_location')
def get_user_location():
    location = geocoder.ip('me')
    if location.ok:
        return jsonify({'latitude': location.latlng[0], 'longitude': location.latlng[1]})
    else:
        return jsonify({'latitude': None, 'longitude': None})

if __name__ == '__main__':
    app.run(debug=True)