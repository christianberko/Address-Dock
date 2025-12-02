import loggerService from "./logger.service";

class AddressService {
    private static fetchUrl = 'https://ischool.gccis.rit.edu/addresses/';

    constructor() { }

    public async count(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                // ensure req body exists
                if (!addressRequest || !addressRequest.body) {
                    loggerService.warning({ 
                        path: "/address/count", 
                        message: "Request body is missing or null" 
                    }).flush();
                    reject(new Error("Request body is required"));
                    return;
                }

                // logs that we are starting count request
                loggerService.info({ 
                    path: "/address/count", 
                    message: "Starting count request" 
                }).flush();

                this.request(addressRequest)
                    .then((response) => {
                        // checks if response exists and is an array
                        if (!response || !Array.isArray(response)) {
                            loggerService.warning({ 
                                path: "/address/count", 
                                message: "Upstream API returned invalid response format" 
                            }).flush();
                            resolve({ "count": 0 });
                            return;
                        }

                        // successful operation, logs the success
                        loggerService.info({ 
                            path: "/address/count", 
                            message: `Successfully counted ${response.length} addresses` 
                        }).flush();

                        resolve({
                            "count": response.length 
                        });
                    })
                    .catch((err) => {
                        // error during count, logs the error
                        loggerService.error({ 
                            path: "/address/count", 
                            message: `Error during count: ${(err as Error).message}` 
                        }).flush();
                        reject(err);
                    });
            } catch (err) {
                // unexpected error, logs the error
                loggerService.error({ 
                    path: "/address/count", 
                    message: `Unexpected error: ${(err as Error).message}` 
                }).flush();
                reject(err);
            }
        });
    }

    public async request(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                // checks if request and body exist
                if (!addressRequest || !addressRequest.body) {
                    loggerService.warning({ 
                        path: "/address/request", 
                        message: "Request body is missing or null" 
                    }).flush();
                    reject(new Error("Request body is required"));
                    return;
                }

                // logs that we are starting api call
                loggerService.info({ 
                    path: "/address/request", 
                    message: "Making request to address API" 
                }).flush();

                fetch(AddressService.fetchUrl, {
                    method: "POST",
                    body: JSON.stringify(addressRequest.body)
                })
                    .then(async (response) => {
                        // checks if response exists
                        if (!response) {
                            loggerService.warning({ 
                                path: "/address/request", 
                                message: " API returned null response" 
                            }).flush();
                            reject(new Error("No response from  API"));
                            return;
                        }

                        // non-200 response, logs the error
                       
                        if (!response.ok) {
                            loggerService.warning({ 
                                path: "/address/request", 
                                message: ` API returned status ${response.status}` 
                            }).flush();
                        }

                        const data = await response.json();

                        // successful api call, logs the success
                        loggerService.info({ 
                            path: "/address/request", 
                            message: "Successfully retrieved data from API" 
                        }).flush();

                        resolve(data);
                    })
                    .catch((err) => {
                        // api call failed, logs the error
                        loggerService.error({ 
                            path: "/address/request", 
                            message: ` API error: ${(err as Error).message}` 
                        }).flush();
                        reject(err);
                    });
            } catch (err) {
               // unexpected error, logs the error
                loggerService.error({ 
                    path: "/address/request", 
                    message: `Unexpected error: ${(err as Error).message}` 
                }).flush();
                reject(err);
            }
        });
    }

    public async distance(addressRequest?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                //making sure req obj exists and has values
                if (!addressRequest || !addressRequest.body) {
                    loggerService.warning({ 
                        path: "/address/distance", 
                        message: "Request body is missing or null" 
                    }).flush();
                    reject(new Error("Request body is required"));
                    return;
                }

                //logs that we are starting distance calculation
                loggerService.info({ 
                    path: "/address/distance", 
                    message: "Starting distance calculation" 
                }).flush();

                const { lat1, lon1, lat2, lon2, unit } = addressRequest.body;

                //checks if all required coordinates are provided
                if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
                    loggerService.warning({ 
                        path: "/address/distance", 
                        message: "Missing required coordinate parameters" 
                    }).flush();
                    reject(new Error("Missing required parameters: lat1, lon1, lat2, lon2"));
                    return;
                }

                //checks if coordinates are numbers
                if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
                    loggerService.warning({ 
                        path: "/address/distance", 
                        message: "Invalid coordinate values - must be numbers" 
                    }).flush();
                    reject(new Error("Coordinates must be valid numbers"));
                    return;
                }

                // Calculate distance in kilometers using Haversine formula (i googled this)
                const distanceKm = this.getDistance(lat1, lon1, lat2, lon2);
                
                // converts to miles 
                const distanceMi = distanceKm * 0.621371;

                // builds response based on requested unit
                const response: any = {};

                if (!unit || unit.toLowerCase() === 'both') {
                    // returns both kilometers and miles
                    response.kilometers = parseFloat(distanceKm.toFixed(2));
                    response.miles = parseFloat(distanceMi.toFixed(2));
                } else if (unit.toLowerCase() === 'km' || unit.toLowerCase() === 'kilometers') {
                    // returns only kilometers
                    response.kilometers = parseFloat(distanceKm.toFixed(2));
                } else if (unit.toLowerCase() === 'mi' || unit.toLowerCase() === 'miles') {
                    // returns only miles
                    response.miles = parseFloat(distanceMi.toFixed(2));
                } else {
                    // invalid unit, defaults to both
                    loggerService.warning({ 
                        path: "/address/distance", 
                        message: `Invalid unit '${unit}' provided, defaulting to both` 
                    }).flush();
                    response.kilometers = parseFloat(distanceKm.toFixed(2));
                    response.miles = parseFloat(distanceMi.toFixed(2));
                }

                // logs the successful calculation
                loggerService.info({ 
                    path: "/address/distance", 
                    message: `Distance calculated: ${distanceKm.toFixed(2)} km` 
                }).flush();

                resolve(response);
            } catch (err) {
                // unexpected exception during calculation, logs the error
                loggerService.error({ 
                    path: "/address/distance", 
                    message: `Calculation error: ${(err as Error).message}` 
                }).flush();
                reject(err);
            }
        });
    }

    private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        // converts degrees to radians (needed for trig functions)
        const toRadians = (degrees: number): number => {
            return degrees * (Math.PI / 180);
        }

        // earth's radius in kilometers (googled this)
        const earthRadiusKm = 6371;

        // geeksforgeeks formula that i found online and modified to fit my needs
        const latitudeDifference = toRadians(lat2 - lat1);
        const longitudeDifference = toRadians(lon2 - lon1);

       
        
        // square of half the chord length between the points (googled this)
        const halfChordLengthSquared =
            Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);

        // angular distance in radians 
        const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1 - halfChordLengthSquared));

        // multiply by Earth's radius to get distance in kilometers
        const distanceInKilometers = earthRadiusKm * angularDistance;
        
        return distanceInKilometers;
    }

    public async zipcode(addressRequest?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                //checks if request object exists
                if (!addressRequest || !addressRequest.body) {
                    loggerService.warning({ 
                        path: "/address/zipcode", 
                        message: "Request body is missing or null" 
                    }).flush();
                    reject(new Error("Request body is required"));
                    return;
                }

             

                const { zipcode } = addressRequest.body;

                //checks if zipcode is provided or not
                if (!zipcode) {
                    loggerService.warning({ 
                        path: "/address/zipcode", 
                        message: "Zipcode parameter is missing" 
                    }).flush();
                    reject(new Error("Zip code is required"));
                    return;
                }

                //checks zipcode format, ensuring it is a string or number, if not, logs the error
                if (typeof zipcode !== 'string' && typeof zipcode !== 'number') {
                    loggerService.warning({ 
                        path: "/address/zipcode", 
                        message: "Zipcode must be a string or number" 
                    }).flush();
                    reject(new Error("Invalid zipcode format"));
                    return;
                }

                // free zip code API i found online
                const apiUrl = `https://api.zippopotam.us/us/${zipcode}`;
                
                fetch(apiUrl) //fetching the data from the API
                    .then(async (response) => {
                        // Validate response exists, this is for when the response is null and we need to log the error
                        if (!response) {
                            loggerService.warning({ 
                                path: "/address/zipcode", 
                                message: "Zipcode API returned null response" 
                            }).flush();
                            reject(new Error("No response from zipcode API"));
                            return;
                        }

                        // Invalid zipcode, this is for when the zipcode is invalid and we need to log the error
                        if (!response.ok) {
                            loggerService.warning({ 
                                path: "/address/zipcode", 
                                message: `Invalid zipcode ${zipcode} - API returned ${response.status}` 
                            }).flush();
                            reject(new Error("Invalid zip code"));
                            return;
                        }

                        const data: any = await response.json(); //converting the response to json
                        
                        // checks if the response structure is valid
                        if (!data || !data.places || !data.places[0] || !data.places[0]['place name']) {
                            loggerService.warning({ 
                                path: "/address/zipcode", 
                                message: "Zipcode API returned unexpected data format" 
                            }).flush();
                            reject(new Error("Invalid response from zipcode API"));
                            return;
                        }

                        const cityName = data.places[0]['place name'];

                        //logs the successful lookup and city name (success)
                        loggerService.info({ 
                            path: "/address/zipcode", 
                            message: `Successfully found city '${cityName}' for zipcode ${zipcode}` 
                        }).flush();

                        // returns only the city name
                        resolve({
                            city: cityName
                        });
                    })
                    .catch((err) => {
                        // api call failed, logs the error
                        loggerService.error({ 
                            path: "/address/zipcode", 
                            message: `Zipcode API error: ${(err as Error).message}` 
                        }).flush();
                        reject(err);
                    });
            } catch (err) {
                //Unexpected exception, this is for when all the else fails and we need to log the error
                
                loggerService.error({ 
                    path: "/address/zipcode", 
                    message: `Unexpected error: ${(err as Error).message}` 
                }).flush();
                reject(err);
            }
        });
    }
}

export default new AddressService();