import json
import os
from flask import Flask, request, jsonify , send_from_directory
import sqlite3
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)
DB = "users.db"
COLLECTION = None
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Create table
def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)")
init_db()

@app.route("/")
@app.route("/frontend", methods=["GET"])
def frontend():
    return send_from_directory("frontend", "index.html")

@app.route("/api/list/<category>")
def list_category(category):
    valid_categories = ["projects", "Instruments", "fields"]
    if category not in valid_categories:
        return jsonify({"error": "Invalid category"}), 400

    file_path = os.path.join(BASE_DIR, f"{category}.json")

    if not os.path.isfile(file_path):
        return jsonify({"error": f"{category}.json not found"}), 404

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        random_data = random.sample(data, min(4, len(data)))
        return jsonify(random_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    try:
        with sqlite3.connect(DB) as conn:
            conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        return jsonify({"status": "success"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Username already exists"}), 400
    
@app.route("/collection", methods=["GET", "POST"])
def collection():
    global COLLECTION
    if request.method == "GET":
        if COLLECTION is None:
            return jsonify({"status": "error", "message": "Collection not set"}), 400
        return jsonify(COLLECTION)
    elif request.method == "POST":
        data = request.get_json()
        COLLECTION = data
        return jsonify({"status": "success", "message": "Collection updated"})

@app.route("/api/search")
def search():
    query = request.args.get("q", "").lower().strip()
    if not query:
        return jsonify({"error": "Empty query"}), 400

    results = {}

    categories = {
        "projects": "projects.json",
        "fields": "fields.json",
        "Instruments": "Instruments.json"
    }

    for category, filename in categories.items():
        path = os.path.join(BASE_DIR, filename)
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    items = json.load(f)
                    # Match query against common title/description fields
                    filtered = [
                        item for item in items if any(
                            query in str(item.get(field, "")).lower()
                            for field in ["title", "name", "Instrument Title", "description", "Description", "longDesc"]
                        )
                    ]
                    results[category] = filtered
            except Exception as e:
                results[category] = []
        else:
            results[category] = []

    print("Search results for", query, ":", results)
    return jsonify(results)


if __name__ == "__main__":
    # read in the json database (TOBE DONE to make this an endpoint)


    app.run(host= "158.39.74.21", port=80, debug=True)
