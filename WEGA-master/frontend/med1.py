from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Configure MongoDB client
client = MongoClient("mongodb://localhost:27017/")  # Replace with your MongoDB connection string if hosted elsewhere
db = client["wega-telemedicine"]  # Database name
orders_collection = db["orders"]  # Collection name

@app.route('/order', methods=['POST'])
def order():
    data = request.json
    medicine_name = data.get('medicineName')
    quantity = data.get('quantity')
    customer_name = data.get('customerName')
    address = data.get('address')

    if not all([medicine_name, quantity, customer_name, address]):
        return jsonify({'error': 'All fields are required.'}), 400

    # Create a document to insert
    order_data = {
        'medicineName': medicine_name,
        'quantity': quantity,
        'customerName': customer_name,
        'address': address
    }

    # Insert the order into MongoDB
    result = orders_collection.insert_one(order_data)

    return jsonify({'message': 'Order placed successfully!', 'orderId': str(result.inserted_id)}), 200

@app.route('/orders', methods=['GET'])
def get_orders():
    # Fetch all orders from MongoDB
    all_orders = list(orders_collection.find({}, {'_id': 0}))  # Don't include MongoDB's default `_id` field
    return jsonify(all_orders), 200

if __name__ == '__main__':
    app.run(debug=True)
