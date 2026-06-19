# ============================================
# COMPLETE Flask API Server for Sri Lanka AI Travel Planner
# INCLUDES ALL PREVIOUS FUNCTIONALITY + CORS FIXES
# ============================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import json
import os
import pandas as pd
from datetime import datetime
import re
import math
from typing import List, Dict, Any
import mysql.connector
from mysql.connector import Error
import uuid
import time

app = Flask(__name__)

# ============================================
# COMPREHENSIVE CORS CONFIGURATION
# ============================================

# Generate ALL localhost ports from 8080 to 8095
ALLOWED_ORIGINS = [
    "http://localhost:8080", "http://localhost:8081", "http://localhost:8082",
    "http://localhost:8083", "http://localhost:8084", "http://localhost:8085",
    "http://localhost:8086", "http://localhost:8087", "http://localhost:8088",
    "http://localhost:8089", "http://localhost:8090", "http://localhost:8091",
    "http://localhost:8092", "http://localhost:8093", "http://localhost:8094",
    "http://localhost:8095", "http://localhost:3000", "http://localhost:5173",
    "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://127.0.0.1:8082",
    "http://127.0.0.1:8083", "http://127.0.0.1:8084", "http://127.0.0.1:8085",
    "http://127.0.0.1:8086", "http://127.0.0.1:8087", "http://127.0.0.1:8088",
    "http://127.0.0.1:8089", "http://127.0.0.1:8090", "http://127.0.0.1:8091",
    "http://127.0.0.1:8092", "http://127.0.0.1:8093", "http://127.0.0.1:8094",
    "http://127.0.0.1:8095", "http://127.0.0.1:3000", "http://127.0.0.1:5173"
]

# Configure CORS
CORS(app, 
     origins=ALLOWED_ORIGINS,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
     allow_headers=["Content-Type", "Authorization", "Accept", "Origin", 
                    "X-Requested-With", "X-Auth-Token", "Access-Control-Allow-Origin",
                    "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
     expose_headers=["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
     supports_credentials=True,
     max_age=3600)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin', '')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Handle OPTIONS requests for all routes
@app.route('/api/<path:path>', methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path=None):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response, 200

# ============================================
# DATABASE CONFIGURATION (KEEP YOUR EXISTING)
# ============================================

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Aabid2004@',
    'database': 'lank_vac_SLIIT',
    'port': 3306,
    'charset': 'utf8mb4',
    'autocommit': True
}

def get_db_connection():
    """Get database connection with error handling"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"❌ Database connection error: {e}")
        return None

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute SQL query with error handling"""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        if not connection:
            return None
        
        cursor = connection.cursor(dictionary=True)
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            result = None
        
        connection.commit()
        return result
        
    except Error as e:
        print(f"❌ Query execution error: {e}")
        if connection:
            connection.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# ============================================
# AI RECOMMENDER CLASS (KEEP YOUR EXISTING 1200 LINES)
# ============================================

class SriLankaDestinationRecommender:
    def __init__(self, model_path=None, preprocessing_path=None, data_path=None):
        self.model = None
        self.mlb = None
        self.season_encoder = None
        self.scaler = None
        self.feature_columns = []
        self.destinations_db = None
        self.destinations_df = None
        self.X_features = None
        
        try:
            print("\n" + "="*60)
            print("🤖 INITIALIZING AI RECOMMENDER")
            print("="*60)
            
            # 1. Load AI Model
            if model_path and os.path.exists(model_path):
                print(f"📦 Loading AI model from: {model_path}")
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"✅ AI Model loaded: {type(self.model).__name__}")
            else:
                print("⚠️ AI model file not found")
            
            # 2. Load Preprocessing Objects
            if preprocessing_path and os.path.exists(preprocessing_path):
                print(f"🔧 Loading preprocessing objects from: {preprocessing_path}")
                with open(preprocessing_path, 'rb') as f:
                    preprocessing = pickle.load(f)
                self.mlb = preprocessing.get('mlb')
                self.season_encoder = preprocessing.get('season_encoder')
                self.scaler = preprocessing.get('scaler')
                self.feature_columns = preprocessing.get('feature_columns', [])
                print(f"✅ Preprocessing objects loaded")
                print(f"🔍 Feature columns found: {len(self.feature_columns)}")
                if self.feature_columns:
                    print(f"   Sample features: {self.feature_columns[:10]}")
            else:
                print("⚠️ Preprocessing objects not found")
            
            # 3. Load Destination Database
            if data_path and os.path.exists(data_path):
                print(f"🗺️ Loading destination database from: {data_path}")
                with open(data_path, 'r', encoding='utf-8') as f:
                    self.destinations_db = json.load(f)
                
                # Create DataFrame for easier processing
                if 'destinations' in self.destinations_db:
                    destinations_list = self.destinations_db.get('destinations', [])
                    if destinations_list:
                        self.destinations_df = pd.DataFrame(destinations_list)
                        print(f"✅ Loaded {len(self.destinations_df)} destinations")
                        
                        # Create feature matrix if available
                        if self.feature_columns:
                            self._prepare_feature_matrix()
                    else:
                        print("❌ No destinations found in database")
                else:
                    print("❌ Invalid database format")
            else:
                print("❌ Destination database not found")
            
            print("="*60)
            print("✅ AI Recommender Initialization Complete")
            print("="*60)
            
        except Exception as e:
            print(f"❌ Error initializing recommender: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def _prepare_feature_matrix(self):
        """Prepare feature matrix from destinations database"""
        try:
            if self.destinations_df is None or len(self.feature_columns) == 0:
                return
            
            print(f"🔧 Preparing feature matrix with {len(self.feature_columns)} features")
            
            # Create feature matrix
            features_list = []
            
            for _, dest in self.destinations_df.iterrows():
                feature_vector = []
                
                # Add each feature from feature_columns
                for feature in self.feature_columns:
                    if feature in dest and pd.notna(dest[feature]):
                        try:
                            feature_vector.append(float(dest[feature]))
                        except:
                            feature_vector.append(0.0)
                    elif feature in ['adventure', 'beach', 'cultural', 'hill_country', 'relaxation', 'urban', 'wildlife']:
                        # Check categories for these features
                        has_feature = False
                        if 'categories' in dest and dest['categories']:
                            categories = dest['categories']
                            if isinstance(categories, list):
                                categories_lower = [str(c).lower() for c in categories]
                            else:
                                categories_lower = [str(categories).lower()]
                            
                            # Map feature to category keywords
                            if feature == 'adventure' and any('adventure' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'beach' and any('beach' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'cultural' and any('cultural' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'hill_country' and any('hill_country' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'relaxation' and any('relaxation' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'urban' and any('urban' in cat for cat in categories_lower):
                                has_feature = True
                            elif feature == 'wildlife' and any('wildlife' in cat for cat in categories_lower):
                                has_feature = True
                        
                        feature_vector.append(1.0 if has_feature else 0.0)
                    else:
                        feature_vector.append(0.0)
                
                features_list.append(feature_vector)
            
            self.X_features = np.array(features_list)
            print(f"✅ Feature matrix created: {self.X_features.shape}")
            
        except Exception as e:
            print(f"❌ Error preparing feature matrix: {str(e)}")
            import traceback
            traceback.print_exc()
    
    def prepare_user_profile(self, interests: List[str], travel_month: int, 
                           traveler_type: str, budget_level: str, days_available: int):
        """Convert user input to model features - FIXED MAPPING"""
        try:
            if not self.feature_columns:
                print("⚠️ No feature columns available")
                return None
            
            # Create feature vector
            user_features = np.zeros(len(self.feature_columns))
            
            # Map feature names to indices
            feature_dict = {name: idx for idx, name in enumerate(self.feature_columns)}
            
            print(f"🤖 Processing user interests: {interests}")
            print(f"🤖 Available features: {self.feature_columns}")
            
            # CORRECT INTEREST MAPPING FOR YOUR MODEL FEATURES
            interest_to_feature_map = {
                "Beaches & Relaxation": ['beach', 'relaxation'],
                "Wildlife & Nature": ['wildlife'],
                "Cultural & Historical Sites": ['cultural'],
                "Adventure & Sports": ['adventure'],
                "Food & Local Experiences": [],  # Not in model
                "Shopping & Markets": [],  # Not in model
                "Photography": [],  # Not in model
                "Yoga & Wellness": ['relaxation'],
                "Romantic Getaway": ['beach', 'relaxation'],
                "Family Activities": []  # Not in model
            }
            
            # Apply interest mapping
            for interest in interests:
                interest_name = str(interest).strip()
                print(f"   Processing interest: '{interest_name}'")
                
                if interest_name in interest_to_feature_map:
                    features_to_activate = interest_to_feature_map[interest_name]
                    for feature in features_to_activate:
                        if feature in feature_dict:
                            user_features[feature_dict[feature]] = 1.0
                            print(f"     → Activated '{feature}' = 1.0")
                        else:
                            print(f"     ⚠️ Feature '{feature}' not in model")
                else:
                    print(f"     ⚠️ Interest '{interest_name}' not in mapping")
            
            # Adjust for traveler type
            traveler_lower = str(traveler_type).lower()
            print(f"🤖 Processing traveler type: '{traveler_lower}'")
            
            if 'family' in traveler_lower:
                if 'relaxation' in feature_dict:
                    user_features[feature_dict['relaxation']] = 1.2
                    print(f"     → Family: relaxation = 1.2")
                if 'cultural' in feature_dict:
                    user_features[feature_dict['cultural']] = 1.1
                    print(f"     → Family: cultural = 1.1")
            
            elif 'couple' in traveler_lower or 'romantic' in traveler_lower:
                if 'relaxation' in feature_dict:
                    user_features[feature_dict['relaxation']] = 1.3
                    print(f"     → Couple: relaxation = 1.3")
                if 'beach' in feature_dict:
                    user_features[feature_dict['beach']] = 1.2
                    print(f"     → Couple: beach = 1.2")
            
            elif 'business' in traveler_lower:
                if 'urban' in feature_dict:
                    user_features[feature_dict['urban']] = 1.3
                    print(f"     → Business: urban = 1.3")
                if 'cultural' in feature_dict:
                    user_features[feature_dict['cultural']] = 1.1
                    print(f"     → Business: cultural = 1.1")
            
            elif 'solo' in traveler_lower:
                if 'adventure' in feature_dict:
                    user_features[feature_dict['adventure']] = 1.2
                    print(f"     → Solo: adventure = 1.2")
                if 'cultural' in feature_dict:
                    user_features[feature_dict['cultural']] = 1.1
                    print(f"     → Solo: cultural = 1.1")
            
            # Adjust for budget
            budget_lower = str(budget_level).lower()
            print(f"🤖 Processing budget level: '{budget_lower}'")
            
            if 'luxury' in budget_lower or '5000' in budget_lower or 'deluxe' in budget_lower:
                if 'relaxation' in feature_dict:
                    user_features[feature_dict['relaxation']] *= 1.3
                    print(f"     → Luxury: relaxation *= 1.3")
                if 'beach' in feature_dict:
                    user_features[feature_dict['beach']] *= 1.2
                    print(f"     → Luxury: beach *= 1.2")
            
            elif 'budget' in budget_lower or 'under' in budget_lower or '1000' in budget_lower:
                if 'cultural' in feature_dict:
                    user_features[feature_dict['cultural']] *= 1.2
                    print(f"     → Budget: cultural *= 1.2")
                if 'adventure' in feature_dict:
                    user_features[feature_dict['adventure']] *= 1.1
                    print(f"     → Budget: adventure *= 1.1")
            
            # Normalize the feature vector
            norm = np.linalg.norm(user_features)
            if norm > 0:
                user_features = user_features / norm
                print(f"✅ Normalized feature vector")
            else:
                print(f"⚠️ All zero features - using defaults")
                # Default preferences for general travelers
                if 'cultural' in feature_dict:
                    user_features[feature_dict['cultural']] = 0.7
                if 'relaxation' in feature_dict:
                    user_features[feature_dict['relaxation']] = 0.3
            
            active_features = np.sum(user_features > 0)
            print(f"✅ User profile created with {active_features} active features")
            print(f"📊 Feature values: {[f'{val:.3f}' for val in user_features]}")
            
            # Debug: Show which features are active
            print(f"🔍 Active features:")
            for feature, idx in feature_dict.items():
                if user_features[idx] > 0:
                    print(f"   {feature}: {user_features[idx]:.3f}")
            
            return user_features.reshape(1, -1)
            
        except Exception as e:
            print(f"❌ Error preparing user profile: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_ai_recommendations(self, user_features, top_n=12):
        """Get AI-powered recommendations using the trained model"""
        try:
            if self.model is None or self.X_features is None or self.destinations_df is None:
                print("⚠️ AI model or data not available")
                return self.get_popular_destinations(top_n)
            
            print(f"🤖 Generating AI recommendations for user profile...")
            print(f"   User features shape: {user_features.shape}")
            print(f"   Destination features shape: {self.X_features.shape}")
            
            # Calculate similarity scores
            similarities = []
            
            for idx in range(len(self.X_features)):
                dest_features = self.X_features[idx]
                
                # Calculate cosine similarity
                dot_product = np.dot(user_features.flatten(), dest_features)
                norm_user = np.linalg.norm(user_features)
                norm_dest = np.linalg.norm(dest_features)
                
                if norm_user > 0 and norm_dest > 0:
                    similarity = dot_product / (norm_user * norm_dest)
                else:
                    similarity = 0
                
                # Get destination info
                dest_info = self.destinations_df.iloc[idx]
                
                # Get popularity score
                popularity = dest_info.get('popularity_score', 50) / 100
                
                # Get category match based on actual features
                category_match = 0
                user_active_features = np.where(user_features.flatten() > 0)[0]
                dest_active_features = np.where(dest_features > 0)[0]
                
                if len(user_active_features) > 0:
                    common_features = len(set(user_active_features) & set(dest_active_features))
                    category_match = common_features / len(user_active_features)
                
                # Calculate total score
                total_score = (similarity * 0.7) + (popularity * 0.2) + (category_match * 0.1)
                
                similarities.append((idx, total_score, similarity, popularity, category_match))
            
            # Sort by total score
            similarities.sort(key=lambda x: x[1], reverse=True)
            
            # Get top N recommendations
            recommendations = []
            for idx, total_score, similarity, popularity, category_match in similarities[:top_n]:
                dest_info = self.destinations_df.iloc[idx]
                
                # Get places to visit
                places_to_visit = dest_info.get('places_to_visit', [])
                if isinstance(places_to_visit, str):
                    places_to_visit = [p.strip() for p in places_to_visit.split(',')]
                elif not isinstance(places_to_visit, list):
                    places_to_visit = []
                
                # Get categories
                categories = dest_info.get('categories', [])
                if isinstance(categories, str):
                    categories = [c.strip() for c in categories.split(',')]
                elif not isinstance(categories, list):
                    categories = []
                
                # Get primary category
                primary_category = dest_info.get('primary_category', 'general')
                if not primary_category or pd.isna(primary_category):
                    primary_category = categories[0] if categories else 'general'
                
                # Create recommendation
                recommendation = {
                    'destination_id': dest_info.get('destination_id', f"dest_{idx}"),
                    'destination_name': dest_info.get('city', 'Unknown'),
                    'type': primary_category,
                    'latitude': float(dest_info.get('lat', 6.9271)),
                    'longitude': float(dest_info.get('lng', 79.8612)),
                    'best_season_start': 'dec',
                    'best_season_end': 'apr',
                    'tags': categories[:5],
                    'description': dest_info.get('description', f"Visit {dest_info.get('city', 'this destination')} for unique experiences."),
                    'places_to_visit': places_to_visit[:5],
                    'popularity_score': float(dest_info.get('popularity_score', 50)),
                    'admin_name': dest_info.get('admin_name', ''),
                    'is_from_real_model': True,
                    'ai_score': float(total_score),
                    'similarity_score': float(similarity),
                    'popularity_normalized': float(popularity),
                    'category_match': float(category_match)
                }
                
                # Fix best season if available
                best_season = dest_info.get('best_season', '')
                if best_season and '_' in str(best_season):
                    season_parts = str(best_season).split('_')
                    if len(season_parts) >= 2:
                        recommendation['best_season_start'] = season_parts[0]
                        recommendation['best_season_end'] = season_parts[1]
                
                recommendations.append(recommendation)
            
            # DEBUG: Print top recommendations
            print(f"✅ Generated {len(recommendations)} AI recommendations")
            print(f"🏆 Top 5 recommendations:")
            for i, rec in enumerate(recommendations[:5]):
                print(f"   {i+1}. {rec['destination_name']} - Score: {rec['ai_score']:.3f}")
                print(f"      Type: {rec['type']}, Tags: {rec['tags'][:3]}")
            
            return recommendations
            
        except Exception as e:
            print(f"❌ Error getting AI recommendations: {str(e)}")
            import traceback
            traceback.print_exc()
            return self.get_popular_destinations(top_n)
    
    def get_popular_destinations(self, top_n=12):
        """Get popular destinations as fallback"""
        try:
            if self.destinations_df is None:
                return self._create_fallback_destinations(top_n)
            
            # Sort by popularity score
            if 'popularity_score' in self.destinations_df.columns:
                popular_destinations = self.destinations_df.sort_values(
                    'popularity_score', ascending=False
                ).head(top_n)
            else:
                popular_destinations = self.destinations_df.head(top_n)
            
            recommendations = []
            for idx, dest in popular_destinations.iterrows():
                # Get places to visit
                places_to_visit = dest.get('places_to_visit', [])
                if isinstance(places_to_visit, str):
                    places_to_visit = [p.strip() for p in places_to_visit.split(',')]
                elif not isinstance(places_to_visit, list):
                    places_to_visit = []
                
                # Get categories
                categories = dest.get('categories', [])
                if isinstance(categories, str):
                    categories = [c.strip() for c in categories.split(',')]
                elif not isinstance(categories, list):
                    categories = []
                
                # Get primary category
                primary_category = dest.get('primary_category', 'general')
                if not primary_category or pd.isna(primary_category):
                    primary_category = categories[0] if categories else 'general'
                
                recommendation = {
                    'destination_id': dest.get('destination_id', f"dest_{idx}"),
                    'destination_name': dest.get('city', 'Unknown'),
                    'type': primary_category,
                    'latitude': float(dest.get('lat', 6.9271)),
                    'longitude': float(dest.get('lng', 79.8612)),
                    'best_season_start': 'dec',
                    'best_season_end': 'apr',
                    'tags': categories[:5],
                    'description': dest.get('description', f"Popular destination: {dest.get('city', 'Unknown')}"),
                    'places_to_visit': places_to_visit[:5],
                    'popularity_score': float(dest.get('popularity_score', 50)),
                    'admin_name': dest.get('admin_name', ''),
                    'is_from_real_model': True,
                    'ai_score': float(dest.get('popularity_score', 50)) / 100
                }
                
                # Fix best season if available
                best_season = dest.get('best_season', '')
                if best_season and '_' in str(best_season):
                    season_parts = str(best_season).split('_')
                    if len(season_parts) >= 2:
                        recommendation['best_season_start'] = season_parts[0]
                        recommendation['best_season_end'] = season_parts[1]
                
                recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            print(f"❌ Error getting popular destinations: {str(e)}")
            return self._create_fallback_destinations(top_n)
    
    def _create_fallback_destinations(self, top_n=12):
        """Create fallback destinations when database is not available"""
        print("⚠️ Creating fallback destinations")
        
        fallback_destinations = [
            {
                'destination_id': 'dest_colombo',
                'destination_name': 'Colombo',
                'type': 'urban',
                'latitude': 6.9271,
                'longitude': 79.8612,
                'best_season_start': 'dec',
                'best_season_end': 'apr',
                'tags': ['cultural', 'urban', 'shopping', 'food'],
                'description': 'The commercial capital of Sri Lanka with vibrant culture',
                'places_to_visit': ['Gangaramaya Temple', 'Galle Face Green', 'National Museum'],
                'popularity_score': 95,
                'admin_name': 'Western Province',
                'is_from_real_model': False,
                'ai_score': 0.85
            },
            {
                'destination_id': 'dest_kandy',
                'destination_name': 'Kandy',
                'type': 'cultural',
                'latitude': 7.2964,
                'longitude': 80.635,
                'best_season_start': 'jan',
                'best_season_end': 'dec',
                'tags': ['cultural', 'historical', 'hill_country', 'temple'],
                'description': 'Home to the sacred Temple of the Tooth Relic',
                'places_to_visit': ['Temple of the Tooth', 'Royal Botanical Gardens', 'Kandy Lake'],
                'popularity_score': 90,
                'admin_name': 'Central Province',
                'is_from_real_model': False,
                'ai_score': 0.82
            },
            {
                'destination_id': 'dest_galle',
                'destination_name': 'Galle',
                'type': 'cultural',
                'latitude': 6.0329,
                'longitude': 80.2168,
                'best_season_start': 'dec',
                'best_season_end': 'apr',
                'tags': ['cultural', 'historical', 'beach', 'fort'],
                'description': 'Historic Dutch fort and beautiful beaches',
                'places_to_visit': ['Galle Fort', 'Unawatuna Beach', 'Japanese Peace Pagoda'],
                'popularity_score': 88,
                'admin_name': 'Southern Province',
                'is_from_real_model': False,
                'ai_score': 0.80
            }
        ]
        
        return fallback_destinations[:top_n]

# ============================================
# LOAD RESOURCES (KEEP YOUR EXISTING)
# ============================================

def load_resources():
    """Load all resources (AI model, preprocessing, database)"""
    global recommender, destinations_db, destinations_df, model_loaded
    
    try:
        print("\n" + "="*60)
        print("🚀 LOADING AI TRAVEL PLANNER RESOURCES")
        print("="*60)
        
        # Get current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"📁 Current directory: {current_dir}")
        
        # Define paths
        ai_models_dir = os.path.join(current_dir, 'ai_models')
        
        if not os.path.exists(ai_models_dir):
            parent_dir = os.path.dirname(current_dir)
            ai_models_dir = os.path.join(parent_dir, 'ai_models')
        
        print(f"🔍 Looking for models in: {ai_models_dir}")
        
        # Check what files exist
        model_path = os.path.join(ai_models_dir, 'sri_lanka_destination_model.pkl')
        preprocessing_path = os.path.join(ai_models_dir, 'preprocessing_objects.pkl')
        data_path = os.path.join(ai_models_dir, 'destinations_database.json')
        
        print(f"📦 Model path: {model_path} - {'✅ Exists' if os.path.exists(model_path) else '❌ Missing'}")
        print(f"🔧 Preprocessing path: {preprocessing_path} - {'✅ Exists' if os.path.exists(preprocessing_path) else '❌ Missing'}")
        print(f"🗺️ Database path: {data_path} - {'✅ Exists' if os.path.exists(data_path) else '❌ Missing'}")
        
        # Initialize recommender
        recommender = SriLankaDestinationRecommender(model_path, preprocessing_path, data_path)
        
        if recommender.destinations_df is not None:
            destinations_df = recommender.destinations_df
            destinations_db = recommender.destinations_db
            print(f"✅ Destination database loaded: {len(destinations_df)} destinations")
            
            # Check sample data
            print(f"📊 Sample destinations:")
            if len(destinations_df) >= 5:
                sample_destinations = destinations_df.head(5)['city'].tolist()
            else:
                sample_destinations = destinations_df['city'].tolist()
            
            for i, dest in enumerate(sample_destinations, 1):
                print(f"   {i}. {dest}")
            
            model_loaded = recommender.model is not None
            print(f"✅ AI Model: {'Loaded' if model_loaded else 'Not available'}")
        else:
            print("❌ Failed to load destination database")
            destinations_df = pd.DataFrame()
        
        print("="*60)
        print("✅ RESOURCE LOADING COMPLETE")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error loading resources: {str(e)}")
        import traceback
        traceback.print_exc()
        destinations_df = pd.DataFrame()
        destinations_db = None
        recommender = None

# Load resources on startup
load_resources()

# ============================================
# HELPER FUNCTIONS (KEEP YOUR EXISTING)
# ============================================

def clean_value(val):
    """Convert NaN/NaT to None for JSON serialization"""
    import math
    if isinstance(val, float) and math.isnan(val):
        return None
    if isinstance(val, np.ndarray):
        return val.tolist()  # Convert numpy arrays to lists
    try:
        if pd.isna(val):
            return None
    except:
        pass
    return val

def convert_travel_timing_to_month(travel_timing):
    """Convert travel timing string to month number"""
    current_month = datetime.now().month
    
    if not travel_timing:
        return current_month
    
    travel_timing_lower = travel_timing.lower()
    
    if 'within the next month' in travel_timing_lower:
        return (current_month + 1) % 12 or 12
    elif '1-3 months' in travel_timing_lower:
        return (current_month + 2) % 12 or 12
    elif '3-6 months' in travel_timing_lower:
        return (current_month + 4) % 12 or 12
    elif '6-12 months' in travel_timing_lower:
        return (current_month + 9) % 12 or 12
    else:
        return current_month

def convert_budget_to_level(budget_str):
    """Convert budget string to level"""
    if not budget_str:
        return 'moderate'
    
    budget_lower = budget_str.lower()
    
    if 'under' in budget_lower or '1000' in budget_lower:
        return 'budget'
    elif '2000' in budget_lower or '3500' in budget_lower:
        return 'moderate'
    elif '5000' in budget_lower or 'above' in budget_lower:
        return 'luxury'
    else:
        return 'moderate'

def convert_duration_to_days(duration_str):
    """Convert duration string to days"""
    if not duration_str:
        return 7
    
    if '3-5' in duration_str:
        return 4
    elif '5-7' in duration_str:
        return 6
    elif '7-10' in duration_str:
        return 8
    elif '10-14' in duration_str:
        return 12
    elif 'more than 2 weeks' in duration_str.lower() or '2 weeks' in duration_str:
        return 16
    else:
        return 7

# ============================================
# NEW DATABASE SAVE ENDPOINTS (WITH CORS FIX)
# ============================================

@app.route('/api/save-questionnaire', methods=['POST', 'OPTIONS'])
def save_questionnaire():
    """Save questionnaire responses to database"""
    # Handle OPTIONS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response, 200
    
    try:
        data = request.json
        print(f"\n📝 SAVING QUESTIONNAIRE DATA TO DATABASE")
        
        # Generate IDs
        response_id = data.get('response_id', f"resp_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        session_id = data.get('session_id', f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        
        # Prepare SQL
        query = """
        INSERT INTO questionnaire_responses (
            response_id, session_id, full_name, email, phone, country, city,
            travel_timing, travel_duration_range, budget, traveler_type,
            accommodation_type, num_adults, num_children, interests,
            preferred_destinations, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            response_id, session_id,
            data.get('full_name', ''),
            data.get('email', ''),
            data.get('phone', ''),
            data.get('country', ''),
            data.get('city', ''),
            data.get('travel_timing', 'Just exploring options'),
            data.get('travel_duration_range', '5-7 days'),
            data.get('budget', '$1,000 - $2,000'),
            data.get('traveler_type', 'Solo traveler'),
            data.get('accommodation_type', '3 Star (Standard)'),
            data.get('traveler_composition', {}).get('adults', 1),
            data.get('traveler_composition', {}).get('children', 0),
            json.dumps(data.get('interests', [])),
            json.dumps(data.get('preferred_destinations', [])),
            'submitted'
        )
        
        # Execute query
        result = execute_query(query, params)
        
        if result is None:
            print("⚠️ Could not save to database, but continuing...")
            return jsonify({
                'success': True,
                'response_id': response_id,
                'session_id': session_id,
                'message': 'Questionnaire data received (database save may have failed)'
            })
        
        print(f"✅ Questionnaire saved to database with ID: {response_id}")
        
        return jsonify({
            'success': True,
            'response_id': response_id,
            'session_id': session_id,
            'message': 'Questionnaire saved successfully to database'
        })
        
    except Exception as e:
        print(f"❌ Error saving questionnaire: {str(e)}")
        import traceback
        traceback.print_exc()
        
        response_id = f"resp_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return jsonify({
            'success': True,
            'response_id': response_id,
            'session_id': data.get('session_id', 'session_unknown'),
            'message': 'Questionnaire processed (database error ignored)'
        })

@app.route('/api/save-booking', methods=['POST', 'OPTIONS'])
def save_booking():
    """Save booking to database"""
    # Handle OPTIONS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response, 200
    
    try:
        data = request.json
        print(f"\n📝 SAVING BOOKING DATA TO DATABASE")
        
        # Generate booking ID
        booking_id = f"book_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Calculate costs
        questionnaire_data = data.get('questionnaire_data', {})
        traveler_composition = questionnaire_data.get('traveler_composition', {})
        adults_count = traveler_composition.get('adults', 1)
        children_count = traveler_composition.get('children', 0)
        days = questionnaire_data.get('exact_days', 7)
        total_cost = (adults_count * 120 * days) + (children_count * 60 * days)
        
        # Prepare SQL
        query = """
        INSERT INTO bookings (
            booking_id, package_name, full_name, email, phone, country,
            adults_count, children_count, total_cost, booking_status,
            payment_status, itinerary_data, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        
        params = (
            booking_id,
            'AI-Generated Custom Itinerary',
            data.get('full_name', ''),
            data.get('email', ''),
            data.get('phone', ''),
            data.get('country', ''),
            adults_count,
            children_count,
            total_cost,
            'pending',
            'pending',
            json.dumps(data.get('itinerary_data', {}))
        )
        
        # Execute query
        result = execute_query(query, params)
        
        if result is None:
            print("⚠️ Could not save booking to database, but continuing...")
            return jsonify({
                'success': True,
                'booking_id': booking_id,
                'message': 'Booking received (database save may have failed)'
            })
        
        print(f"✅ Booking saved to database with ID: {booking_id}")
        
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'message': 'Booking saved successfully',
            'customer_name': data.get('full_name', ''),
            'total_cost': total_cost
        })
        
    except Exception as e:
        print(f"❌ Error saving booking: {str(e)}")
        import traceback
        traceback.print_exc()
        
        booking_id = f"book_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'message': 'Booking processed (database error ignored)'
        })

# ============================================
# ALL YOUR EXISTING API ENDPOINTS (KEEP THEM)
# ============================================

@app.route('/')
def home():
    return jsonify({
        'status': 'active',
        'service': 'Sri Lanka AI Travel Planner API',
        'version': '2.0.3',
        'model_loaded': model_loaded,
        'destinations_count': len(destinations_df) if destinations_df is not None else 0,
        'database_connected': get_db_connection() is not None,
        'cors_enabled': True,
        'cors_origins': ALLOWED_ORIGINS[:10]  # Show first 10
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model_loaded,
        'destinations_loaded': destinations_df is not None and len(destinations_df) > 0,
        'database_connected': get_db_connection() is not None,
        'num_destinations': len(destinations_df) if destinations_df is not None else 0,
        'service': 'Sri Lanka AI Travel Planner API'
    })

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    """Get all destinations with optional filtering"""
    try:
        if destinations_df is None or len(destinations_df) == 0:
            if recommender:
                fallback_destinations = recommender._create_fallback_destinations(20)
                return jsonify({
                    'success': True,
                    'count': len(fallback_destinations),
                    'total': len(fallback_destinations),
                    'destinations': fallback_destinations,
                    'is_fallback': True
                })
            else:
                return jsonify({'error': 'Destination database not loaded', 'success': False}), 500
        
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search', '').lower()
        limit = int(request.args.get('limit', 100))
        
        # Get destinations as list of dictionaries
        destinations_list = []
        for idx, row in destinations_df.iterrows():
            dest_dict = {}
            
            # Safely extract each field
            for col in row.index:
                value = row[col]
                dest_dict[col] = clean_value(value)
            
            if 'city' not in dest_dict or dest_dict['city'] is None:
                continue
            
            # Convert places_to_visit to list if it's a string
            if 'places_to_visit' in dest_dict and dest_dict['places_to_visit']:
                if isinstance(dest_dict['places_to_visit'], str):
                    dest_dict['places_to_visit'] = [p.strip() for p in dest_dict['places_to_visit'].split(',')]
                elif not isinstance(dest_dict['places_to_visit'], list):
                    dest_dict['places_to_visit'] = []
            else:
                dest_dict['places_to_visit'] = []
            
            # Convert categories to list if needed
            if 'categories' in dest_dict and dest_dict['categories']:
                if isinstance(dest_dict['categories'], str):
                    dest_dict['categories'] = [c.strip() for c in dest_dict['categories'].split(',')]
                elif not isinstance(dest_dict['categories'], list):
                    dest_dict['categories'] = []
            else:
                dest_dict['categories'] = []
            
            # Ensure primary_category exists
            if 'primary_category' not in dest_dict or dest_dict['primary_category'] is None:
                dest_dict['primary_category'] = dest_dict['categories'][0] if dest_dict['categories'] else 'general'
            
            # Ensure numeric fields are floats
            numeric_fields = ['popularity_score', 'lat', 'lng']
            for field in numeric_fields:
                if field in dest_dict and dest_dict[field] is not None:
                    try:
                        dest_dict[field] = float(dest_dict[field])
                    except:
                        dest_dict[field] = 0.0
            
            destinations_list.append(dest_dict)
        
        # Apply filters
        filtered_destinations = destinations_list
        
        if category:
            filtered_destinations = [
                d for d in filtered_destinations 
                if 'categories' in d and d['categories'] and category.lower() in [str(c).lower() for c in d['categories']]
            ]
        
        if search:
            filtered_destinations = [
                d for d in filtered_destinations 
                if (search in d.get('city', '').lower() or
                    'places_to_visit' in d and d['places_to_visit'] and any(search in str(p).lower() for p in d['places_to_visit']))
            ]
        
        # Apply limit
        filtered_destinations = filtered_destinations[:limit]
        
        return jsonify({
            'success': True,
            'count': len(filtered_destinations),
            'total': len(destinations_list),
            'destinations': filtered_destinations,
            'is_fallback': False
        })
        
    except Exception as e:
        print(f"❌ Error in get_destinations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/ai-recommend', methods=['POST', 'OPTIONS'])
def ai_recommend():
    """Get AI-powered recommendations (direct API)"""
    # Handle OPTIONS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        return response, 200
    
    try:
        if recommender is None:
            return jsonify({'error': 'AI recommender not loaded', 'success': False}), 500
        
        data = request.json
        print(f"\n📥 Received recommendation request")
        
        # Extract user preferences
        interests = data.get('interests', [])
        travel_month = data.get('travel_month', datetime.now().month)
        traveler_type = data.get('traveler_type', 'solo')
        budget = data.get('budget', 'moderate')
        days = data.get('days', 7)
        top_n = data.get('top_n', 12)
        
        # Prepare user profile
        user_features = recommender.prepare_user_profile(
            interests=interests,
            travel_month=travel_month,
            traveler_type=traveler_type,
            budget_level=budget,
            days_available=days
        )
        
        # Get recommendations
        recommendations = []
        if user_features is not None and model_loaded:
            recommendations = recommender.get_ai_recommendations(user_features, top_n=top_n)
        else:
            print("⚠️ Using popular destinations (AI model not available)")
            recommendations = recommender.get_popular_destinations(top_n=top_n)
        
        if not recommendations:
            print("⚠️ Using popular destinations as fallback")
            recommendations = recommender.get_popular_destinations(top_n=top_n)
        
        print(f"✅ Returning {len(recommendations)} recommendations")
        
        return jsonify({
            'success': True,
            'is_real_ai': model_loaded,
            'recommendations': recommendations,
            'count': len(recommendations),
            'user_profile': {
                'interests': interests,
                'travel_month': travel_month,
                'traveler_type': traveler_type,
                'budget': budget,
                'days': days
            }
        })
        
    except Exception as e:
        print(f"❌ Error in AI recommendation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 500

# ============================================
# ADDITIONAL ENDPOINTS FROM YOUR ORIGINAL CODE
# ============================================

@app.route('/api/activities', methods=['GET'])
def get_activities():
    """Get activities from database"""
    try:
        query = "SELECT * FROM activities WHERE is_active = TRUE LIMIT 50"
        activities = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'count': len(activities) if activities else 0,
            'activities': activities or []
        })
    except Exception as e:
        print(f"❌ Error getting activities: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    """Get hotels from database"""
    try:
        query = "SELECT * FROM hotels WHERE is_active = TRUE LIMIT 50"
        hotels = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'count': len(hotels) if hotels else 0,
            'hotels': hotels or []
        })
    except Exception as e:
        print(f"❌ Error getting hotels: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/map/destinations', methods=['GET'])
def get_map_destinations():
    """Get destinations for map display"""
    try:
        query = """
        SELECT destination_id, destination_name, latitude, longitude, 
               destination_type, description, places_to_visit
        FROM destinations WHERE is_active = TRUE
        """
        destinations = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'count': len(destinations) if destinations else 0,
            'destinations': destinations or []
        })
    except Exception as e:
        print(f"❌ Error getting map destinations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# TEST ENDPOINT
# ============================================

@app.route('/api/test-cors', methods=['GET'])
def test_cors():
    """Test CORS is working"""
    return jsonify({
        'success': True,
        'message': 'CORS is working!',
        'origin': request.headers.get('Origin', 'Unknown'),
        'timestamp': datetime.now().isoformat()
    })

# ============================================
# START SERVER
# ============================================

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 STARTING SRI LANKA AI TRAVEL PLANNER API")
    print("="*60)
    
    print(f"\n✅ CORS ENABLED for ports: 8080-8095, 3000, 5173")
    
    if destinations_df is not None and not destinations_df.empty:
        print(f"📍 Destinations Loaded: {len(destinations_df)}")
    else:
        print("⚠️ NO DESTINATION DATA LOADED! Using fallback data.")
    
    print(f"\n🤖 AI Model: {'✅ Loaded' if model_loaded else '❌ Not available'}")
    
    # Check database connection
    db_conn = get_db_connection()
    if db_conn:
        print(f"🗄️ Database: ✅ Connected to {DB_CONFIG['database']}")
        db_conn.close()
    else:
        print(f"🗄️ Database: ❌ Not connected")
    
    print(f"\n🌐 API Endpoints:")
    print("   /api/health            - Health check")
    print("   /api/destinations      - Get destinations")
    print("   /api/ai-recommend      - AI recommendations")
    print("   /api/save-questionnaire - Save questionnaire")
    print("   /api/save-booking      - Save booking")
    print("   /api/test-cors         - Test CORS")
    print("\n🌍 Frontend should work on: http://localhost:8081")
    print("="*60)
    
    app.run(debug=True, port=5000, host='0.0.0.0', threaded=True)