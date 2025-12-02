import addressService from '../services/address.service';

// when i first ran the tests, i was getting console output from the logger service.
//  this is a workaround to avoid that.
jest.mock('../services/logger.service', () => ({
    info: jest.fn().mockReturnThis(),
    warning: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    flush: jest.fn()
}));

// mock fetch globally to avoid network requests during tests
global.fetch = jest.fn();

describe('Address Service Tests', () => {
    
    beforeEach(() => {
        // clear all mocks before each test
        jest.clearAllMocks();
    });

    
    // COUNT ENDPOINT TESTS
    describe('count() - Bug Fix Tests', () => {
        
        // POSITIVE TEST: should count addresses correctly
        test('should return correct count when valid data provided', async () => {
            
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    { street: '123 Main St' },
                    { street: '456 Oak Ave' },
                    { street: '789 Elm St' }
                ]
            });

            const mockRequest = {
                body: { city: 'Rochester', street: 'Main', page: 1 }
            };

            const result = await addressService.count(mockRequest);

            
            expect(result).toEqual({ count: 3 });
        });

        // NEGATIVE TEST: Should handle null request body
        test('should reject when request body is null', async () => {
            const mockRequest = null;

            await expect(addressService.count(mockRequest))
                .rejects
                .toThrow('Request body is required');
        });

        // ERROR CASE: Should handle invalid  response
        test('should return count 0 when upstream returns invalid data', async () => {
            // Mock  returning null instead of array
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => null
            });

            const mockRequest = {
                body: { city: 'Rochester', street: 'Main', page: 1 }
            };

            const result = await addressService.count(mockRequest);

            expect(result).toEqual({ count: 0 });
        });
    });

    // DISTANCE ENDPOINT TESTS
    describe('distance() - New Feature Tests', () => {
        
        // POSITIVE TEST: should calculate distance correctly
        test('should return distance in both km and miles', async () => {
            const mockRequest = {
                body: {
                    lat1: 43.1566,
                    lon1: -77.6088,
                    lat2: 40.7128,
                    lon2: -74.0060,
                    unit: 'both'
                }
            };

            const result = await addressService.distance(mockRequest);

            //Should return both units
            expect(result).toHaveProperty('kilometers');
            expect(result).toHaveProperty('miles');
            expect(typeof result.kilometers).toBe('number');
            expect(typeof result.miles).toBe('number');
            expect(result.kilometers).toBeGreaterThan(0);
        });

        // NEGATIVE TEST: should reject when coordinates missing
        test('should reject when required coordinates are missing', async () => {
            const mockRequest = {
                body: {
                    lat1: 43.1566,
                    lon1: -77.6088
                    // other coordinates are missing
                }
            };

            await expect(addressService.distance(mockRequest))
                .rejects
                .toThrow('Missing required parameters');
        });

        // ERROR CASE: should reject when coordinates are not numbers
        test('should reject when coordinates are invalid types', async () => {
            const mockRequest = {
                body: {
                    lat1: 'invalid',
                    lon1: -77.6088,
                    lat2: 40.7128,
                    lon2: -74.0060
                }
            };

            await expect(addressService.distance(mockRequest))
                .rejects
                .toThrow('Coordinates must be valid numbers');
        });
    });

    // ZIPCODE ENDPOINT TESTS
    describe('zipcode() - New Feature Tests', () => {
        
        // POSITIVE TEST: Should return city for valid zipcode
        test('should return city name for valid zipcode', async () => {
            // Mock the zipcode API response
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    places: [
                        { 'place name': 'Rochester' }
                    ]
                })
            });

            const mockRequest = {
                body: { zipcode: '14623' }
            };

            const result = await addressService.zipcode(mockRequest);

            expect(result).toEqual({ city: 'Rochester' });
        });

        // NEGATIVE TEST: Should reject when zipcode is missing
        test('should reject when zipcode is not provided', async () => {
            const mockRequest = {
                body: {}
            };

            await expect(addressService.zipcode(mockRequest))
                .rejects
                .toThrow('Zip code is required');
        });

        // ERROR CASE: Should reject when zipcode is invalid type
        test('should reject when zipcode is invalid type', async () => {
            const mockRequest = {
                body: { zipcode: true } // Boolean instead of string/number
            };

            await expect(addressService.zipcode(mockRequest))
                .rejects
                .toThrow('Invalid zipcode format');
        });

        // ERROR CASE: Should handle upstream API being down
        test('should handle when upstream API fails', async () => {
            // Mock API failure (network error)
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            );

            const mockRequest = {
                body: { zipcode: '14623' }
            };

            await expect(addressService.zipcode(mockRequest))
                .rejects
                .toThrow('Network error');
        });
    });


    // ERROR HANDLING TESTS (Bug Fix #2)
   
    describe('Error Handling - No Crash Tests', () => {
        
        // POSITIVE TEST: Should handle null body gracefully
        test('should not crash when body is undefined', async () => {
            const mockRequest = { body: undefined };

            // Should reject, not crash
            await expect(addressService.count(mockRequest))
                .rejects
                .toThrow();
        });

        // NEGATIVE TEST: Should handle empty request
        test('should not crash when entire request is null', async () => {
            // Should reject, not crash
            await expect(addressService.distance(null))
                .rejects
                .toThrow();
        });
    });
});


