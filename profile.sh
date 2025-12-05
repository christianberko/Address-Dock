#!/bin/bash

# Dynamic profiling script - monitors CPU and Memory while application handles requests

CONTAINER_NAME=${1:-address-dock} #default container name is address-dock
DURATION=${2:-20} #default duration is 30 seconds
PORT=${3:-4900} #default port is 4900
REPORT_FILE="./profiling-report.txt" #file for report

echo "Starting dynamic profiling for container: $CONTAINER_NAME"
echo "Monitoring for $DURATION seconds..."
echo ""

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container '$CONTAINER_NAME' is not running!"
    exit 1
fi

# Create report file with header
echo "CPU and Memory Profiling Report (Dynamic Profiling)" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "Container: $CONTAINER_NAME" >> "$REPORT_FILE"
echo "Duration: $DURATION seconds" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Time     CPU%    Memory Usage    Memory%    Activity" >> "$REPORT_FILE"
echo "--------------------------------------------------------" >> "$REPORT_FILE"

# Monitor and send requests
echo "Monitoring CPU and Memory while sending requests..."
SECOND=1 #starts our timer at 1
while [ $SECOND -le $DURATION ]; do

    curl -s http://localhost:$PORT/health > /dev/null 2>&1 &
    
    if [ $((SECOND % 2)) -eq 0 ]; then
        curl -s -X POST http://localhost:$PORT/address/distance \
            -H "Content-Type: application/json" \
            -d '{"lat1": 43.1545, "lon1": -77.6159, "lat2": 40.7128, "lon2": -74.0060, "unit": "both"}' > /dev/null 2>&1 &
        ACTIVITY="distance"
    elif [ $((SECOND % 3)) -eq 0 ]; then
        curl -s -X POST http://localhost:$PORT/address/zipcode \
            -H "Content-Type: application/json" \
            -d '{"zipcode": "14623"}' > /dev/null 2>&1 &
        ACTIVITY="zipcode"
    elif [ $((SECOND % 4)) -eq 0 ]; then
        curl -s -X POST http://localhost:$PORT/address/count \
            -H "Content-Type: application/json" \
            -d '{"body": []}' > /dev/null 2>&1 &
        ACTIVITY="count"
    else
        ACTIVITY="health"
    fi
    
    #  stats from docker  and write to report
    STATS=$(docker stats --no-stream --format "{{.CPUPerc}}  {{.MemUsage}}  {{.MemPerc}}" "$CONTAINER_NAME")
    echo "[${SECOND}s] $STATS    $ACTIVITY" >> "$REPORT_FILE"
    
    echo "  Second $SECOND/$DURATION..."
    
    sleep 1
    SECOND=$((SECOND + 1)) # increment timer to keep loop running
done

sleep 2

echo ""
echo "Profiling complete! Report saved to: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"

