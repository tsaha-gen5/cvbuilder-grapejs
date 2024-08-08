import { useCallback } from 'react';
import { apiConfigURLS } from '@/utils/vars';
import { getCookie, setCookie } from '@/utils/cookies';

interface Template {
  id: number;
  title: string;
  photo: string;
  content: string;
  style: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface UserResume {
  name: string;
  content: string;
  style: string;
  title: string;
  description: string;
  photo: string;
  user_id: number;
  template_id: number;
}

interface User {
  id: number;
  name: string;
  resume: string;
}

interface UseResumeAPIReturnType {
  getTemplates: () => Promise<Template[]>;
  getTemplateById: (templateId: number) => Promise<Template>;
  getResumeUser: (userId: number) => Promise<User>;
  setTemplate: (id: number, content: string, style: string, title: string, description: string, photo: string) => Promise<any>;
  createResume: (userResume: Partial<UserResume>) => Promise<any>;
  updateResume: (userResume: Partial<UserResume>) => Promise<any>;
  getResumeID: (resumeId: number) => Promise<any>;
  getAccountData: () => Promise<any>;
  prefillResume: (content: string, userAccount: object) => Promise<any>;
}

const useResumeAPI = (): UseResumeAPIReturnType => {
  const makeRequest = useCallback(async (url: string, options: any) => {
    const token = getCookie('access_token');
    if (!token) {
      console.error('No token available.');
      return null;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Request failed with status ${response.status}: ${errorDetails.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }, []);

  const getAccountData = useCallback(() => {
    return makeRequest(`${apiConfigURLS.apiURL}/account/`, { method: 'GET' });
  }, [makeRequest]);

  const getTemplates = useCallback(() => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template`, { method: 'GET' });
  }, [makeRequest]);

  const getTemplateById = useCallback((templateId: number) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template/${templateId}`, { method: 'GET' });
  }, [makeRequest]);

  const setTemplate = useCallback((template_id: number, content: string, style: string, title: string, description: string, photo: string) => {
    const requestBody = {
      content,
      style,
      title,
      description,
      template_id,
      photo
    };
  
    console.log("Sending update request with:", JSON.stringify(requestBody, null, 2));
  
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    }).then(response => {
      console.log("Response from server:", response);
      return response;
    }).catch(async error => {
      console.error('Request failed:', error);
      if (error.response) {
        const errorDetails = await error.response.json();
        console.error('Error details:', errorDetails);
        alert(`Failed to update template: ${errorDetails.message}`);
      } else {
        alert('Failed to update template. An unexpected error occurred.');
      }
      throw error;
    });
  }, [makeRequest]);
  
  

  const getResumeUser = useCallback((userId: number) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume/${userId}`, { method: 'GET' });
  }, [makeRequest]);

  const getResumeID = useCallback((resumeId: number) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume/${resumeId}`, { method: 'GET' });
  }, [makeRequest]);

  const createResume = useCallback((userResume: Partial<UserResume>) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume`, {
      method: 'POST',
      body: JSON.stringify(userResume),
    });
  }, [makeRequest]);

  const updateResume = useCallback((userResume: Partial<UserResume>) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume`, {
      method: 'PUT',
      body: JSON.stringify(userResume),
    });
  }, [makeRequest]);

  const prefillResume = useCallback((content: string, userAccount: object) => {
    return makeRequest(`${apiConfigURLS.modelsURL}/parse_account_cv/`, {
      method: 'POST',
      body: JSON.stringify({
        content: content,
        user_account: userAccount
      }),
    });
  }, [makeRequest]);

  return { getTemplates, getTemplateById, getResumeUser, updateResume, setTemplate, createResume, getResumeID, getAccountData, prefillResume };
};

export default useResumeAPI;
