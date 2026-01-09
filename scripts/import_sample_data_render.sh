#!/bin/bash
# Script to import sample data on Render server
# Run this after deployment to populate the database

echo "Starting sample data import on Render..."

# Set Django settings
export DJANGO_SETTINGS_MODULE=gencart_backend.settings

# Navigate to backend directory (adjust path as needed)
cd /opt/render/project/src/gencart_backend || cd gencart_backend

# Run the import command
echo "Running Django management command..."
python manage.py import_sample_data --clear

echo "Sample data import completed!"
echo "You can now access the admin dashboard with sample data."