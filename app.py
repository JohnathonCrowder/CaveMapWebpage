from flask import Flask, render_template, request, jsonify
import pandas as pd
import folium
from geopy.distance import geodesic

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

@app.route('/caves')
def get_caves():
    filepath = 'Cave_map.csv'
    df = csv_to_dataframe(filepath)
    if df is not None:
        caves = df[['cave', 'latitude', 'longitude']].to_dict('records')
        return jsonify(caves)
    else:
        return jsonify([])

@app.route('/filter', methods=['POST'])
def filter_caves():
    filepath = 'Cave_map.csv'
    df = csv_to_dataframe(filepath)
    if df is not None:
        search_query = request.form.get('search_query', '')
        distance = float(request.form.get('distance', 0))
        state = request.form.get('state', '')
        country = request.form.get('country', '')

        filtered_caves = df[df['cave'].astype(str).str.lower().str.startswith(search_query.lower())]

        if state != 'All States':
            filtered_caves = filtered_caves[filtered_caves['region'] == state]

        if country != 'All Countries':
            filtered_caves = filtered_caves[filtered_caves['countryCode'] == country]

        if distance > 0:
            user_lat = float(request.form.get('user_lat', 0))
            user_lon = float(request.form.get('user_lon', 0))
            filtered_caves = filtered_caves.loc[filtered_caves.apply(lambda row: geodesic((user_lat, user_lon), (row['latitude'], row['longitude'])).miles <= distance, axis=1)]

        filtered_caves = filtered_caves[['cave', 'latitude', 'longitude']].to_dict('records')
        return jsonify(filtered_caves)
    else:
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)