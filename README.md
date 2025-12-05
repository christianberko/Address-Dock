# ISTE-422 - Address API

## Set Up Your Local Dev Environment and Run

1. Install NVM and Node v20.13.1
2. From the root directory, run `npm install`
3. Create a .env file
4. In the .env file set `SERVER_PORT` to a port of your choosing
5. In the .env file set `ENV` to "dev"
6. Start the app using `npm run dev`

## API Endpoints

All endpoints use POST requests to `http://localhost:<port>/address/<endpoint>`

### `/address/request`
Sends request to upstream address API.
json
`{"city": "Rochester"}`


### `/address/count`
Counts addresses from request body.
json
`{"city": "Rochester"}`


### `/address/distance`
Calculates distance between two coordinates. Returns kilometers and/or miles.
```json
{"lat1": 43.1545, "lon1": -77.6159, "lat2": 40.7128, "lon2": -74.0060, "unit": "both"}
```
`unit` options: `"both"`, `"km"`, or `"mi"`

### `/address/zipcode`
Looks up city name from zipcode.
```json
{"zipcode": "14623"}
```

### `/health`
Health check endpoint (GET request).

## Additional Commands

- `npm run build` - Build app
- `npm test` - Run tests
- `./build.sh` - Full build pipeline (builds Docker image and runs container)
- `./profile.sh` - Monitor CPU and memory usage
- `./health-check.sh` - Verify server is responding

To make requests while contanier is running:

## Running in Docker

After running `./build.sh`, the container runs on port 4900. Make requests to:
- `http://localhost:4900/address/<endpoint>`
- `http://localhost:4900/health` (GET request)



