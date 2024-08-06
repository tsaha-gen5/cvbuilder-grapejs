import { getCookie, setCookie } from '@/utils/cookies';
import { apiConfigURLS } from '@/utils/vars';

export const testGetToken = async (): Promise<string | null> => {
  
  const user = "admin@admin.com";
  const password = "admin@123";
  const grantType = "password"; // Assuming grant_type is needed

  try {
    const body = new URLSearchParams();
    body.append('username', user);
    body.append('password', password);

    const response = await fetch(`${apiConfigURLS.apiURL}/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with:', errorData);
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    // const email = data.email;

    if (newAccessToken) {
      setCookie('access_token', newAccessToken, 1); // Save access token as a cookie
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};
