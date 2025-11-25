#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Make sure the app directory is accessible
export PYTHONPATH=$PYTHONPATH:/vercel/path0
