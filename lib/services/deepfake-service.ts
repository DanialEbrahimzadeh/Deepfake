/**
 * Cybersecurity Workshop
 * Designed by Danial Ebrahimzadeh
 */

import axios from 'axios';
import { SEGMIND_API_KEY, SEGMIND_API_URL } from '../config';

// With this configuration import
interface DeepfakeApiConfig {
  apiKey: string;
  apiEndpoint: string;
}

// Export the config from local values
export const DeepfakeApiConfig: DeepfakeApiConfig = {
  apiKey: SEGMIND_API_KEY,
  apiEndpoint: SEGMIND_API_URL
};

// Minimum interval between API calls (5 seconds)
const MIN_API_CALL_INTERVAL = 5000;
// Maximum time to wait for the API (60 seconds for quality model)
const API_TIMEOUT = 60000;
// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Exponential backoff base time in milliseconds
const BACKOFF_BASE_TIME = 2000;

// Track the last time an API call was made
let lastApiCallTime = 0;

/**
 * Implements exponential backoff delay
 */
const getBackoffDelay = (retryCount: number) => {
  return BACKOFF_BASE_TIME * Math.pow(2, retryCount);
};

/**
 * Convert base64 string to file object
 */
export function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

// Function to introduce a delay
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Converts an image URL to base64 encoding
 */
export async function imageUrlToBase64(imageUrl: string, retryCount = 0): Promise<string> {
  console.log(`[DEBUG] Converting image to base64: ${imageUrl.substring(0, 50)}...`);
  
  // If it's already a base64 string, return it
  if (imageUrl.startsWith('data:image')) {
    console.log('[DEBUG] Image is already in base64 format');
    return imageUrl;
  }
  
  try {
    // Check if the URL is local or remote
    const isLocalFile = !imageUrl.startsWith('http') && !imageUrl.startsWith('data:');
    
    // For local files, prepend the base URL if needed
    const fullUrl = isLocalFile 
      ? (typeof window !== 'undefined' ? `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` : imageUrl)
      : imageUrl;
    
    console.log(`[DEBUG] Fetching image from: ${fullUrl.substring(0, 80)}...`);
    
    // Create a controller to allow timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Fetch the image
    const response = await fetch(fullUrl, { 
      signal: controller.signal,
      // Ensure proper CORS headers for cross-origin requests
      credentials: 'omit',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate that the blob is an image
    if (!blob.type.startsWith('image/')) {
      console.error(`[ERROR] Received non-image content type: ${blob.type}`);
      throw new Error(`Received content is not an image (${blob.type})`);
    }
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        console.log(`[DEBUG] Successfully converted image to base64 (${(base64data.length / 1024).toFixed(1)} KB)`);
        resolve(base64data);
      };
      reader.onerror = () => {
        console.error('[ERROR] FileReader failed to read the image blob');
        reject(new Error('Failed to read image data'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Image conversion failed: ${errorMessage}`);
    
    // Retry logic for network issues or timeouts
    if (retryCount < MAX_RETRIES && (
      errorMessage.includes('network') || 
      errorMessage.includes('timeout') || 
      errorMessage.includes('aborted')
    )) {
      console.log(`[DEBUG] Retrying image conversion (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(2000); // Wait 2 seconds before retry
      return imageUrlToBase64(imageUrl, retryCount + 1);
    }
    
    throw new Error(`Failed to convert image to base64: ${errorMessage}`);
  }
}

/**
 * Interface for deepfake API request options
 */
export interface DeepfakeOptions {
  model_type: 'speed' | 'quality';
  swap_type: 'face' | 'head';
  style_type: 'normal';
  seed?: number;
}

/**
 * Creates a deepfake by swapping faces between source and target images
 */
export async function createDeepfake(
  sourceImageUrl: string,
  targetImageUrl: string,
  options: DeepfakeOptions,
  onProgress?: (progress: number) => void
): Promise<any> {
  let retryCount = 0;
  
  const makeRequest = async (): Promise<any> => {
    try {
      // Check if we need to wait before making another API call
      const now = Date.now();
      const timeSinceLastCall = now - lastApiCallTime;
      
      if (lastApiCallTime > 0 && timeSinceLastCall < MIN_API_CALL_INTERVAL) {
        const waitTime = MIN_API_CALL_INTERVAL - timeSinceLastCall;
        console.log(`[DEBUG] Rate limiting: Waiting ${waitTime}ms before making another API call`);
        onProgress?.(10); // Update progress to show we're waiting
        await delay(waitTime);
      }
      
      // Update the last API call time
      lastApiCallTime = Date.now();
      
      // Adjust timeout based on model type
      const currentTimeout = options.model_type === 'quality' ? API_TIMEOUT * 2 : API_TIMEOUT;
      
      // Start progress
      onProgress?.(15);
      console.log('[DEBUG] Starting face swap process');
      console.log(`[DEBUG] Using settings: ${options.model_type} mode, ${options.swap_type} swap, ${options.style_type} style`);
      
      // Convert images to base64
      console.log('[DEBUG] Processing source image');
      const sourceBase64 = await imageUrlToBase64(sourceImageUrl);
      
      // Validate source base64
      if (!sourceBase64 || sourceBase64.length < 100) {
        throw new Error('Source image processing failed or resulted in invalid data');
      }
      
      onProgress?.(30);
      console.log('[DEBUG] Processing target image');
      const targetBase64 = await imageUrlToBase64(targetImageUrl);
      
      // Validate target base64
      if (!targetBase64 || targetBase64.length < 100) {
        throw new Error('Target image processing failed or resulted in invalid data');
      }
      
      onProgress?.(45);
      
      // Prepare the request
      const apiKey = DeepfakeApiConfig.apiKey;
      const apiEndpoint = DeepfakeApiConfig.apiEndpoint;
      
      if (!apiKey || !apiEndpoint) {
        console.error('[ERROR] Configuration missing');
        throw new Error('Configuration is missing. Please check your environment variables.');
      }
      
      console.log('[DEBUG] Preparing request');
      
      // Extract base64 data without the prefix
      const sourceData = sourceBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      const targetData = targetBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
      // Prepare payload for API
      const payload = {
        source_image: sourceData,
        target_image: targetData,
        model_type: options.model_type || 'speed',
        swap_type: options.swap_type || 'head',
        style_type: options.style_type || 'normal',
        seed: options.seed,
      };
      
      console.log('[DEBUG] Request prepared, sending to API');
      onProgress?.(60);
      
      // Set up axios request with timeout
      const axiosConfig: import('axios').AxiosRequestConfig = {
        method: 'post',
        url: apiEndpoint,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Accept': 'application/json, image/jpeg'
        },
        data: payload,
        timeout: currentTimeout,
        responseType: 'arraybuffer' as const
      };
      
      const response = await axios(axiosConfig);
      onProgress?.(80);
      
      // Check if response is an image (JPEG)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('image/')) {
        // Convert binary data to base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const dataUrl = `data:${contentType};base64,${base64Image}`;
        
        console.log('[DEBUG] Received image response successfully');
        onProgress?.(100);
        
        return {
          image: dataUrl,
          success: true
        };
      }
      
      // If not an image, try to parse as JSON
      try {
        const textData = Buffer.from(response.data).toString('utf-8');
        const jsonData = JSON.parse(textData);
        
        console.log('[DEBUG] API response received successfully');
        
        // Validate the response
        if (!jsonData || (!jsonData.image && !jsonData.output)) {
          console.error('[ERROR] Invalid API response format:', jsonData);
          throw new Error('The API returned an invalid response format');
        }
        
        onProgress?.(95);
        
        // Return the result
        console.log('[DEBUG] Deepfake created successfully');
        onProgress?.(100);
        
        return jsonData;
      } catch (parseError) {
        console.error('[ERROR] Failed to parse API response:', parseError);
        throw new Error('Failed to parse API response');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || (error.response?.status && error.response.status >= 500)) {
          // Retry on timeout or server errors
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            const backoffDelay = getBackoffDelay(retryCount);
            console.log(`[DEBUG] Request failed, retrying in ${backoffDelay}ms (Attempt ${retryCount}/${MAX_RETRIES})`);
            await delay(backoffDelay);
            return makeRequest();
          }
        }
        
        if (error.code === 'ECONNABORTED') {
          throw new Error(`API request timed out after ${MAX_RETRIES} retries. Please try again or switch to 'speed' mode for faster processing.`);
        }
        
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;
        
        if (statusCode === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (statusCode && statusCode >= 500) {
          throw new Error('Server error occurred. The API service may be experiencing issues.');
        } else {
          throw new Error(`API error (${statusCode || 'unknown'}): ${errorMessage}`);
        }
      }
      throw error;
    }
  };
  
  return makeRequest();
} 