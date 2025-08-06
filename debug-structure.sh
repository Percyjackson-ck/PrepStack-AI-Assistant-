#!/bin/bash
echo "=== Directory Structure Debug ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo ""
echo "Contents of dist directory:"
if [ -d "dist" ]; then
    ls -la dist/
    echo ""
    echo "Contents of dist/public directory:"
    if [ -d "dist/public" ]; then
        ls -la dist/public/
    else
        echo "dist/public does not exist"
    fi
else
    echo "dist directory does not exist"
fi

echo ""
echo "=== End Debug ==="
