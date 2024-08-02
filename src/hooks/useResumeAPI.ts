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

interface User {
  id: number;
  name: string;
  resume: string;
}

interface UseResumeAPIReturnType {
  getTemplates: () => Promise<Template[]>;
  getTemplateById: (templateId: number) => Promise<Template>;
  getResumeUser: (userId: number) => Promise<User>;
  setResumeUser: (userId: number, userData: Partial<User>) => Promise<any>;
  setTemplate: (templateId: number, templateData: Partial<Template>) => Promise<any>;
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

  const getTemplates = useCallback(() => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template`, { method: 'GET' });
  }, [makeRequest]);

  const getTemplateById = useCallback((templateId: number) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template/${templateId}`, { method: 'GET' });
  }, [makeRequest]);

  const getResumeUser = useCallback((userId: number) => {
    return makeRequest(`${apiConfigURLS.apiURL}/get-resume-user/${userId}`, { method: 'GET' });
  }, [makeRequest]);

  const setResumeUser = useCallback((userId: number, userData: Partial<User>) => {
    return makeRequest(`${apiConfigURLS.apiURL}/set-resume-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }, [makeRequest]);

  const setTemplate = useCallback((templateId: number, templateData: Partial<Template>) => {
    return makeRequest(`${apiConfigURLS.apiURL}/resume-template/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }, [makeRequest]);

  return { getTemplates, getTemplateById, getResumeUser, setResumeUser, setTemplate };
};

export default useResumeAPI;
