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
    filepath = r"Cave_map.csv"
    df = csv_to_dataframe(filepath)
    if df is not None:
        region = request.args.get('region', '')
        cave_name = request.args.get('cave_name', '')
        if region:
            df = df[df['region'].notna()]
            df = df[df['region'].str.contains(region, case=False)]
        if cave_name:
            df = df[df['cave'].notna()]
            df = df[df['cave'].str.contains(cave_name, case=False)]
        caves = df[['cave', 'latitude', 'longitude', 'region']].dropna().to_dict(orient='records')
        return jsonify(caves)
    else:
        return jsonify([])

@app.route('/get_regions')
def get_regions():
    filepath = r"Cave_map.csv"
    df = csv_to_dataframe(filepath)
    if df is not None:
        regions = df['region'].dropna().unique().tolist()
        return jsonify(regions)
    else:
        return jsonify([])

@app.route('/get_user_location')
def get_user_location():
    location = geocoder.ip('me')
    if location.ok:
        return jsonify({'latitude': location.latlng[0], 'longitude': location.latlng[1]})
    else:
        return jsonify({'latitude': None, 'longitude': None})
    

@app.route('/about')
def about():
    return render_template('about.html')



@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/submit-contact-form', methods=['POST'])
def submit_contact_form():
    name = request.form['name']
    email = request.form['email']
    subject = request.form['subject']
    message = request.form['message']
    
    # Process the form data, send an email, or store it in a database
    
    return 'Thank you for your message!'




if __name__ == '__main__':
    app.run(debug=True)