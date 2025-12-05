#!/bin/bash

# Health check 


# Set port
PORT=${1:-4900}
MAX_ATTEMPTS=30

echo "Checking if server is healthy on port $PORT..."


ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    # Try to get response from /health endpoint
    if curl -f -s http://localhost:$PORT/health; then
        echo "Success! Server is responding."
        exit 0
    fi
    
    # If not ready, wait and try again
    echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Server not ready yet, waiting 1 second..."
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

# Step 3: If we get here, all attempts failed
echo "Failed! Server did not respond after $MAX_ATTEMPTS attempts."
exit 1

