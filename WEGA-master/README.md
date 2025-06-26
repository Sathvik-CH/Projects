
# WEGA

This project is a web-based application that allows users to place orders for medicines,locate nearby hospitals,book appointment,video call with doctor. The application consists of a frontend for user interaction and a backend server for handling requests and storing order data in MongoDB.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)

## Features
- Users can place orders for medicines by specifying the name, quantity, customer details, and address.
- Orders are stored in a MongoDB database.
- Book an appointment to consultt with doctor by specifying date   and health problem
- Telemedicine - video call with doctor to see whether the disease can cured at home
- we can also locate nearby hospitals 
- Basic form validation to ensure all fields are filled.
- Error handling for form submission and server issues.
## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, Flask (Python)
- Database: MongoDB
- Additional Libraries: CORS, bcryptjs, JSON Web Token
## Installation

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Python 3](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/)

## Usage
1.Download the code from the repository

2.Install Backend Dependencies: Navigate to the backend directory and install dependencies:
- npm install
- npm init -y
- pip install flask pymongo flask-cors
  
3.Set Up MongoDB:

   - Start MongoDB locally or provide the connection string for a remote database.
- Make sure the database named wega-telemedicine and the collection orders are created.
  
4.Run the Backend: 
- Start the flask server:
   python3 med1.py in vs code
- run the Node.js server:
   npm Start
  
5.Serve the Frontend:

- Open login.html in a web browser or use a local server to serve the frontend files.

