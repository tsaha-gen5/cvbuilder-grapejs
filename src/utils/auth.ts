import { getCookie, setCookie } from '@/utils/cookies';

export const refreshAuthToken = async (): Promise<string | null> => {
  // Initially use the hardcoded token for the refresh request
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20iLCJleHAiOjE3MjMyMDgxMzZ9.Xa1mqGSYGk7VeFE9wdgcCJKSzigpRN7jYCQhATDFlOg";

  try {
    const response = await fetch('https://api.futurandco.tv/refresh', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: '',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    if (newAccessToken && newRefreshToken) {
      setCookie('access_token', newAccessToken, 1); // Save access token as a cookie
      localStorage.setItem('access_token', newAccessToken); // Save access token in localStorage
      localStorage.setItem('refresh_token', newRefreshToken); // Save refresh token in localStorage
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
