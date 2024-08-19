// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import "grapesjs-preset-webpage";
import useResumeAPI from '@/hooks/useResumeAPI';  // Ensure this path is correct
import { testGetToken } from '@/utils/auth';
import { getCookie, setCookie } from '@/utils/cookies';
import PlaceholderParser from '@/utils/placeholderParser';


const LoadingOverlay = () => (
  <div className="loading-overlay">
    <p>Loading...</p>
    <style jsx>{`
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
    `}</style>
  </div>
);

export default function Home() {
  const [editor, setEditor] = useState(null);
  const [token, setToken] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {updateResume, getAccountData, getAccountResumeData, getResumeID, prefillResume } = useResumeAPI();

  function getTokenFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setCookie('access_token', token, 1); // Save access token as a cookie
    return token;
  }

  function getResumeIdFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('resume_id') === null) { return null; }
    const resumeId_ = urlParams.get('resume_id');
    setResumeId(resumeId_);
    sessionStorage.setItem('resume_id', resumeId_);
    return true;
  }

  useEffect(() => {
    const tokenDetect = getTokenFromQueryParam();
    if (!tokenDetect) {
      testGetToken();
      setToken(localStorage.getItem('access_token'));
    } else {
      setToken(tokenDetect);
    }
    setIsTokenValid(true);
    getResumeIdFromQueryParam();

  }, [token]);

  useEffect(() => {
    if (!editor) {
      const e = GrapesJS.init({
        container: "#example-editor",
        fromElement: true,
        showOffsets: true,
        noticeOnUnload: true,
        storageManager: true,
        plugins: ['grapesjs-preset-webpage'],
        styleManager: { clearProperties: true },
        deviceManager: {
          devices: [
            {
              id: 'desktop',
              name: 'Desktop',
              width: '', // default size
            },
            {
              id: 'tablet',
              name: 'Tablet',
              width: '768px', // width for tablet
              widthMedia: '992px', // media query width for tablet
            },
            {
              id: 'mobile',
              name: 'Mobile',
              width: '320px', // width for mobile
              widthMedia: '480px', // media query width for mobile
            }
          ],
        },
        panels: {
          defaults: [
            {
              id: 'panel-top',
              el: '.panel__top',
              buttons: [
                {
                  id: 'export-pdf',
                  command: 'export-pdf',
                  label: 'Export PDF',
                  attributes: { class: 'btn btn-success' },
                  active: false,
                },
              ]
            },
            {
              id: 'panel-actions',
              el: '.panel__actions',
              buttons: [
                {
                  id: 'view-components',
                  className: 'fa fa-square',
                  command: 'core:component-outline',
                  active: false
                },
                {
                  id: 'preview-button',
                  command: 'core:preview',
                  className: 'fa fa-eye',
                  active: false,
                },
                {
                  id: 'undo',
                  className: 'fa fa-undo',
                  command: 'core:undo',
                },
                {
                  id: 'redo',
                  className: 'fa fa-repeat',
                  command: 'core:redo',
                },
                {
                  id: 'delete',
                  className: 'fa fa-trash',
                  command: 'core:component-delete',
                },
                {
                  id: 'print-pdf',
                  className: 'fa fa-print btn-builder-new',
                  attributes: { title: 'Print Pdf' },
                  command: 'print-pdf',
                },
                {
                  id: 'save-builder',
                  className: 'fa fa-save btn-builder-new',
                  attributes: { title: 'Save' },
                  command: 'save',
                },
                {
                  id: 'settings',
                  className: 'fa fa-cog',
                  command: 'core:open-styles',
                }
              ]
            }
          ]
        }
      });

      e.Commands.add('export-pdf', {
        run(editor, sender) {
          const exportHtml = editor.getHtml();
          const exportCss = editor.getCss();
          console.log("Storing HTML:", exportHtml);
          console.log("Storing CSS:", exportCss);
          sessionStorage.setItem('exportHtml', exportHtml);
          sessionStorage.setItem('exportCss', exportCss);
          window.location.href = '/pdf';
        }
      });

      e.Commands.add('print-pdf', {
        run(editor, sender) {
          const htmlContent = editor.getHtml();
          const cssContent = editor.getCss();
      
          // Create an iframe element
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
      
          document.body.appendChild(iframe);
      
          const iframeDoc = iframe.contentWindow.document;
      
          // Write the HTML and CSS to the iframe document
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <style>${cssContent}</style>
              </head>
              <body>
                ${htmlContent}
              </body>
            </html>
          `);
          iframeDoc.close();
      
          // Wait for the iframe content to load before printing
          iframe.onload = function() {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
          };
        }
      });      
      
      

      e.Commands.add('save', {
        run(editor, sender) {
          const resumeContent = editor.getHtml();  // Adjusted to get HTML content
          const resumeStyle = editor.getCss();  // Adjusted to get CSS style

          getAccountData().then(accountData => {
            const userId = accountData.user_id;
            const savedResumeId = sessionStorage.getItem('resume_id');
            const _templateId = sessionStorage.getItem('template_id');
            console.log("templateId 234", _templateId);
            
            if (savedResumeId) {
              // Update existing resume
              updateResume({ content: resumeContent, style: resumeStyle, title: 'Updated Resume', description: 'Updated resume', resume_id: savedResumeId })
                .then(() => alert("Resume updated successfully!"))
                .catch(error => console.error('Error updating resume:', error));
            } else {
              // Create new resume              
              alert("Veuillez contacter CIP/MANAGER/ADMIN pour que votre CV soit créé.");
            }
          }).catch(error => console.error('Error fetching account data:', error));
        }
      });

      setEditor(e);
    }
  }, []);

  useEffect(() => {
    if (editor) {
      setIsLoading(false);  // Set loading to true before making the request
      getAccountData().then(accountData => {
        getAccountResumeData().then(accountResumeData => {
                 
          if (resumeId !== null) {
            getResumeID(resumeId).then(resume => {
              if (resume) {
                sessionStorage.setItem('resume_id', resumeId);
                sessionStorage.setItem('template_id', resume.template_id);
                // console.log(resume.content);
                // console.log(accountData);
                // console.log(accountResumeData);

                prefillResume(resume.content, accountData, accountResumeData).then(prefilledContent => {
                  if (prefilledContent) {
                    editor.setComponents(prefilledContent.reponse);
                    // console.log("prefilledContent", prefilledContent.reponse);
                    editor.setStyle(resume.style);
                  }
                }).catch(error => console.error('Error pre-filling resume:', error))
                  .finally(() => setIsLoading(false));  // Set loading to false after the request completes
              }
            }).catch(error => {
              console.error('Error fetching resume by ID:', error);
              setIsLoading(true);  // Ensure loading is set to false in case of error
            });
        } else if (templateId === null && resumeId === null) {
          // Choose default template if nothing is present in the header
          setResumeId(null);
          setTemplateId(null);
          alert("Veuillez contacter CIP/MANAGER/ADMIN pour que votre CV soit créé."); 
        } 
        }).catch(error => console.error('Error fetching account resume data:', error))
      }).catch(error => console.error('Error fetching account data:', error));
    }
  }, [editor, templateId, resumeId]);

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && <LoadingOverlay />}
      <div className="panel__top">
        <div className="panel__actions gjs-pn-panel gjs-pn-options gjs-one-bg gjs-two-color">
          <div className="gjs-pn-buttons"></div>
        </div>
      </div>
      <div id="example-editor" style={{ minHeight: '100vh', position: 'relative' }}></div>
    </div>
  );
}
