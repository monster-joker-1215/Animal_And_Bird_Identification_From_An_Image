from flask import Flask, render_template, request, jsonify, url_for
from PIL import Image
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load your Keras model
model_path = r"animal_birds.h5"
model = load_model(model_path, compile=False)
# Load your CSV file
csv_path = r"AnimalBird.csv"
try:
    # Try reading the CSV file with 'utf-8' encoding
    csv = pd.read_csv(csv_path, encoding='utf-8')
except UnicodeDecodeError:
    # If 'utf-8' encoding fails, try 'latin1' encoding
    csv = pd.read_csv(csv_path, encoding='latin1')

@app.route("/")
def splashScreen():
    return render_template("index.html")

@app.route("/speciesPrediction")
def speciesPrediction():
    return render_template("species_prediction.html")

@app.route('/identify_species', methods=['POST'])
def identify_species():
    if 'image' in request.files:
        image = request.files['image']     
        img = Image.open(image.stream)
        img = img.resize((224, 224))
        img_array = img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)       
        answer = model.predict(img_array)
        y_class = answer.argmax(axis=-1)
        y = " ".join(str(x) for x in y_class) 
        y = int(y)
        result = csv[csv['ClassId'] == y]  
        image_path = result['Image'].values[0]
        category = result['Category'].values[0]
        common_name = result['CommonName'].values[0]
        family_name = result['FamilyName'].values[0]
        scientific_name = result['ScientificName'].values[0]
        height = result['Height'].values[0]
        weight = result['Weight'].values[0]
        habitat = result['Habitat'].values[0]
        lifespan = result['Lifespan'].values[0]
        description = result['Description'].values[0]
        
        return jsonify({
            'image': url_for('static', filename=image_path),
            'category': category,
            'common_name': common_name,
            'family_name': family_name,
            'scientific_name': scientific_name,
            'height': height,
            'weight': weight,
            'habitat': habitat,
            'lifespan': lifespan,
            'description': description
        })
    else:
        return jsonify({'error': 'No image received'})

if __name__ == "__main__":
    app.run(debug=True)

