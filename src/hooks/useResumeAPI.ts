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
  getAccountResumeData: () => Promise<any>;
  prefillResume: (content: string, userAccount: object, accountResumeData: object) => Promise<any>;
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

  const getAccountResumeData = useCallback(() => {
    return makeRequest(`${apiConfigURLS.apiURL}/account/resume-data`, { method: 'GET' });
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

// Function to flatten a nested object with the desired key format
const flattenObject = (obj: any, prefix = ''): { [key: string]: any } => {
  return Object.keys(obj).reduce((acc: { [key: string]: any }, k: string) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      // Handle nested objects
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      // Handle arrays
      obj[k].forEach((item: any, index: number) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flattenObject(item, `${pre}${k}_${index}`));
        } else {
          acc[`${pre}${k}_${index}`] = item;
        }
      });
    } else {
      // Handle primitive values
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

    // Function to replace placeholders using a flattened object
  const replacePlaceholders = (
    content: string,
    flattenedData: { [key: string]: any }
  ): string => {
    return content.replace(/{(\w+(\.\w+|\[\d+\])*)}/g, (match, key) => {
      const lowerCaseKey = key.toLowerCase();
      return flattenedData[lowerCaseKey] !== undefined ? flattenedData[lowerCaseKey] : match;
    });
  };

  // Updated prefillResume function using flattening and placeholder replacement
  const prefillResume = useCallback(
    (
      content: string,
      userAccount: { [key: string]: any },
      accountResumeData: { [key: string]: any }
    ) => {
      try {
        // Flatten both userAccount and accountResumeData
        const flattenedUserAccount = flattenObject(userAccount);
        const flattenedAccountResumeData = flattenObject(accountResumeData);

        // Merge both flattened objects, giving precedence to userAccount
        const mergedData = { ...flattenedAccountResumeData, ...flattenedUserAccount };

        // Replace placeholders in the content
        const updatedContent = replacePlaceholders(content, mergedData);

        return Promise.resolve({ reponse: updatedContent });
      } catch (error) {
        console.error('Error in prefillResume:', error);
        return Promise.reject(error);
      }
    },
    []
  );




  return { getTemplates, getTemplateById, getResumeUser, updateResume,
           setTemplate, createResume, getResumeID, getAccountData,
           getAccountResumeData, prefillResume };
};

export default useResumeAPI;
