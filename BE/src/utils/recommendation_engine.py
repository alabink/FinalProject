#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
import json
import sys
import os
import traceback
from datetime import datetime

class RecommendationEngine:
    def __init__(self):
        self.user_interactions_df = None
        self.product_features_df = None
        self.user_item_matrix = None
        self.model = None
        
    def load_data(self, interactions_file, products_file=None):
        """
        Load user interactions and product data from JSON files
        
        Parameters:
        interactions_file (str): Path to the user interactions JSON file
        products_file (str): Path to products JSON file (optional)
        """
        try:
            # Check if file exists
            if not os.path.exists(interactions_file):
                print(f"Error: Interactions file not found: {interactions_file}")
                return False
                
            # Load user interactions
            with open(interactions_file, 'r', encoding='utf-8') as f:
                interactions_data = json.load(f)
            
            if not interactions_data:
                print("Warning: Empty interactions data")
                return False
                
            # Convert to DataFrame
            interactions_list = []
            for interaction in interactions_data:
                try:
                    interactions_list.append({
                        'userId': str(interaction.get('userId', '')),
                        'productId': str(interaction.get('productId', '')),
                        'click': float(interaction.get('click', 0)),
                        'view': float(interaction.get('view', 0)),
                        'favorite': float(interaction.get('favorite', 0)),
                        'purchase': float(interaction.get('purchase', 0)),
                        'timestamp': interaction.get('timestamp', '')
                    })
                except Exception as e:
                    print(f"Warning: Skipping invalid interaction: {str(e)}")
                    continue
            
            if not interactions_list:
                print("Error: No valid interactions found")
                return False
                
            self.user_interactions_df = pd.DataFrame(interactions_list)
            
            # Load product data if provided
            if products_file:
                if not os.path.exists(products_file):
                    print(f"Warning: Products file not found: {products_file}")
                else:
                    with open(products_file, 'r', encoding='utf-8') as f:
                        products_data = json.load(f)
                        
                    products_list = []
                    for product in products_data:
                        products_list.append({
                            'productId': str(product.get('_id', '')),
                            'name': product.get('name', ''),
                            'category': product.get('category', {}).get('nameCategory', ''),
                            'price': float(product.get('price', 0)),
                            'brand': product.get('brand', ''),
                        })
                    
                    self.product_features_df = pd.DataFrame(products_list)
                
            return True
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in interactions file: {str(e)}")
            return False
        except Exception as e:
            print(f"Error loading data: {str(e)}")
            traceback.print_exc()
            return False
    
    def create_user_item_matrix(self, weights=None):
        """
        Create user-item interaction matrix with weighted scores
        
        Parameters:
        weights (dict): Weights for different interaction types (click, view, favorite, purchase)
        """
        if self.user_interactions_df is None or self.user_interactions_df.empty:
            print("No interaction data loaded")
            return False
            
        # Default weights if not provided
        if weights is None:
            weights = {
                'click': 1.0,
                'view': 2.0,
                'favorite': 3.0,
                'purchase': 5.0
            }
        
        try:
            # Check for required columns
            required_columns = ['userId', 'productId', 'click', 'view', 'favorite', 'purchase']
            for col in required_columns:
                if col not in self.user_interactions_df.columns:
                    print(f"Error: Required column '{col}' not found in interactions data")
                    return False
            
            # Calculate weighted interaction score
            self.user_interactions_df['score'] = (
                self.user_interactions_df['click'] * weights['click'] + 
                self.user_interactions_df['view'] * weights['view'] + 
                self.user_interactions_df['favorite'] * weights['favorite'] + 
                self.user_interactions_df['purchase'] * weights['purchase']
            )
            
            # Create pivot table: users as rows, items as columns, values as weighted scores
            self.user_item_matrix = self.user_interactions_df.pivot_table(
                index='userId',
                columns='productId',
                values='score',
                fill_value=0
            )
            
            if self.user_item_matrix.empty:
                print("Error: Empty user-item matrix")
                return False
                
            return True
        except Exception as e:
            print(f"Error creating user-item matrix: {str(e)}")
            traceback.print_exc()
            return False
        
    def train_model(self, n_neighbors=5, algorithm='auto', metric='cosine'):
        """
        Train KNN model based on user-item matrix
        
        Parameters:
        n_neighbors (int): Number of neighbors to use
        algorithm (str): Algorithm used to compute nearest neighbors
        metric (str): Distance metric to use
        """
        if self.user_item_matrix is None or self.user_item_matrix.empty:
            print("User-item matrix not created")
            return False
        
        try:
            # Adjust n_neighbors if there are fewer users than requested neighbors
            n_users = self.user_item_matrix.shape[0]
            if n_users <= n_neighbors:
                n_neighbors = max(1, n_users - 1)
                print(f"Warning: Adjusted n_neighbors to {n_neighbors} due to limited user data")
            
            # Create KNN model
            self.model = NearestNeighbors(
                n_neighbors=n_neighbors,
                algorithm=algorithm,
                metric=metric
            )
            
            # Fit the model to the user-item matrix
            self.model.fit(self.user_item_matrix.values)
            
            return True
        except Exception as e:
            print(f"Error training model: {str(e)}")
            traceback.print_exc()
            return False
        
    def get_recommendations(self, user_id, n_recommendations=10):
        """
        Get personalized recommendations for a user
        
        Parameters:
        user_id (str): ID of the user to get recommendations for
        n_recommendations (int): Number of recommendations to generate
        
        Returns:
        list: List of recommended product IDs
        """
        if self.model is None or self.user_item_matrix is None:
            print("Model not trained or user-item matrix not created")
            return []
        
        # Convert user_id to string to ensure consistent type
        user_id = str(user_id)
            
        try:
            # Check if user exists in the matrix
            if user_id not in self.user_item_matrix.index:
                print(f"User {user_id} not found in data")
                return self._get_popular_products(n_recommendations)
                
            # Get user's index in the matrix
            user_idx = self.user_item_matrix.index.get_loc(user_id)
            
            # Get user's vector
            user_vector = self.user_item_matrix.iloc[user_idx].values.reshape(1, -1)
            
            # Find similar users
            distances, indices = self.model.kneighbors(user_vector, n_neighbors=min(n_recommendations+1, len(self.user_item_matrix)))
            
            # Get similar user indices (skip first as it's the user itself)
            similar_user_indices = indices.flatten()[1:]
            
            # Get products from similar users that current user hasn't interacted with
            user_interactions = set(self.user_interactions_df[
                self.user_interactions_df['userId'] == user_id
            ]['productId'].unique())
            
            recommendations = []
            
            # Get recommendations from similar users
            for idx in similar_user_indices:
                similar_user_id = self.user_item_matrix.index[idx]
                
                # Get products the similar user has interacted with
                similar_user_products = self.user_interactions_df[
                    self.user_interactions_df['userId'] == similar_user_id
                ].sort_values('score', ascending=False)['productId'].unique()
                
                # Add products that current user hasn't interacted with
                for product_id in similar_user_products:
                    if product_id not in user_interactions and product_id not in recommendations:
                        recommendations.append(product_id)
                        if len(recommendations) >= n_recommendations:
                            break
                
                if len(recommendations) >= n_recommendations:
                    break
                    
            # If not enough recommendations, add popular products
            if len(recommendations) < n_recommendations:
                popular_products = self._get_popular_products(n_recommendations - len(recommendations))
                for product in popular_products:
                    if product not in recommendations and product not in user_interactions:
                        recommendations.append(product)
            
            return recommendations[:n_recommendations]
        except Exception as e:
            print(f"Error getting recommendations: {str(e)}")
            traceback.print_exc()
            return self._get_popular_products(n_recommendations)
    
    def _get_popular_products(self, n_products=10):
        """
        Get most popular products based on interaction scores
        
        Parameters:
        n_products (int): Number of popular products to return
        
        Returns:
        list: List of popular product IDs
        """
        try:
            if self.user_interactions_df is None or self.user_interactions_df.empty:
                print("No interaction data available for popular products")
                return []
                
            # Calculate product popularity scores
            product_scores = self.user_interactions_df.groupby('productId').agg({
                'click': 'sum',
                'view': 'sum',
                'favorite': 'sum',
                'purchase': 'sum'
            })
            
            if product_scores.empty:
                print("No product scores available")
                return []
                
            # Calculate weighted popularity score
            product_scores['popularity'] = (
                product_scores['click'] * 1.0 + 
                product_scores['view'] * 2.0 + 
                product_scores['favorite'] * 3.0 + 
                product_scores['purchase'] * 5.0
            )
            
            # Get top products
            popular_products = product_scores.sort_values('popularity', ascending=False).index.tolist()
            
            return popular_products[:n_products]
        except Exception as e:
            print(f"Error getting popular products: {str(e)}")
            traceback.print_exc()
            return []
        
    def save_model(self, model_path):
        """
        Save the trained model and data
        
        Parameters:
        model_path (str): Path to save the model
        """
        # Currently we're keeping everything in memory
        # In a production system, you'd want to save the model and data
        return True

# Main function to process command line arguments
def main():
    try:
        if len(sys.argv) < 3:
            print("Usage: python recommendation_engine.py <interactions_file> <user_id> [n_recommendations]")
            sys.exit(1)
            
        interactions_file = sys.argv[1]
        user_id = sys.argv[2]
        n_recommendations = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        
        print(f"Starting recommendation engine with: file={interactions_file}, user={user_id}, limit={n_recommendations}")
        
        engine = RecommendationEngine()
        
        # Load data
        print("Loading data...")
        if not engine.load_data(interactions_file):
            print("Failed to load data")
            sys.exit(1)
            
        # Create user-item matrix
        print("Creating user-item matrix...")
        if not engine.create_user_item_matrix():
            print("Failed to create user-item matrix")
            sys.exit(1)
            
        # Train model
        print("Training model...")
        if not engine.train_model(n_neighbors=5):
            print("Failed to train model")
            sys.exit(1)
            
        # Get recommendations
        print("Generating recommendations...")
        recommendations = engine.get_recommendations(user_id, n_recommendations)
        
        # Output recommendations as JSON
        print(json.dumps(recommendations))
        sys.exit(0)
    except Exception as e:
        print(f"Error in main function: {str(e)}")
        traceback.print_exc()
        # Return empty list as fallback
        print("[]")
        sys.exit(1)

if __name__ == "__main__":
    main() 