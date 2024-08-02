// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import "grapesjs-preset-webpage";
import useResumeAPI from '@/hooks/useResumeAPI';  // Ensure this path is correct
import { testGetToken } from '@/utils/auth';
import { getCookie, setCookie } from '@/utils/cookies';

export default function Home() {
  const [editor, setEditor] = useState(null);
  const [token, setToken] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { getTemplates, getTemplateById, getResumeUser, setResumeUser, setTemplate } = useResumeAPI();
  
  function getTokenFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setCookie('access_token', token, 1); // Save access token as a cookie
    return token;
  }

  function getTemplateIdFromQueryParam () {
    const urlParams = new URLSearchParams(window.location.search);    
    if(urlParams.get('template_id') === null) {      return null;     }
    const templateId_ = urlParams.get('template_id');
    setTemplateId(templateId_);
    console.log("templateId", templateId_);
    return true;
  }

  function getResumeIdFromQueryParam () {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('resume_id') === null) {      return null;     }
    setResumeId(urlParams.get('resume_id'));
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
    
    getTemplateIdFromQueryParam();
    getResumeIdFromQueryParam();

  }, [token]);

  const userId = 1; // Replace with actual user ID

  useEffect(() => {
    if (!editor && (templateId !== null || resumeId !== null)) {
      
      const e = GrapesJS.init({
        container: "#example-editor",
        fromElement: true,
        showOffsets: true,
        noticeOnUnload: true,
        storageManager: true,
        plugins: ['grapesjs-preset-webpage'],
        styleManager: {clearProperties: true},
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
                  id: 'template-selector',
                  command: 'select-template',
                  label: 'Select Template',
                  attributes: { class: 'custom-template-selector' },
                  active: false,
                },
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
                  active:false
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
                  id: 'back-button',
                  className: 'fa fa-arrow-circle-left btn-builder-new',
                  attributes: { title: 'Back Home' },
                  command: 'back-home',
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

      e.Commands.add('select-template', {
        run(editor, sender) {
          const modal = editor.Modal;
          modal.setTitle('Select a Template');
          
          getTemplates().then(templates => {
            modal.setContent(`
              <div class="modal-row">
                ${templates.map(template => `
                  <div class="modal-column">
                    <div class="card card-template" data-templateid="${template.id}">
                      <img src="${template.photo}" alt="${template.title}" />
                      <div class="modal-container">
                        <h4><b>${template.title}</b></h4>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `);
            modal.open();

            document.querySelectorAll('.card-template').forEach(card => {
              card.addEventListener('click', () => {
                const templateId = card.getAttribute('data-templateid');
                getTemplateById(templateId).then(selectedTemplate => {
                  if (selectedTemplate) {
                    editor.setComponents(selectedTemplate.content);
                    editor.setStyle(selectedTemplate.style);
                    modal.close();
                  }
                }).catch(error => console.error('Error fetching template by ID:', error));
              });
            });
          }).catch(error => console.error('Error fetching templates:', error));
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

      e.Commands.add('back-home', {
        run(editor, sender) {
          window.location.href = '/';
        }
      });

      e.Commands.add('save', {
        run(editor, sender) {
          const resumeContent = editor.getComponents();
          const resumeStyle = editor.getStyle();
          setResumeUser(userId, { resume: JSON.stringify({ content: resumeContent, style: resumeStyle }) })
            .then(() => alert("Resume saved successfully!"))
            .catch(error => console.error('Error saving resume:', error));
        }
      });

      setEditor(e);
    }


    if(templateId !== null) {
      getTemplateById(templateId).then(selectedTemplate => {
        if (selectedTemplate) {
          console.log("selectedTemplate", selectedTemplate);
          editor.setComponents(selectedTemplate.content);
          editor.setStyle(selectedTemplate.style);
        }
      }).catch(error => console.error('Error fetching template by ID:', error));

    }else if(resumeId !== null) {
      
      getResumeUser(resumeId).then(resume => {
        if (resume) {
          editor.setComponents(resume.content);
          editor.setStyle(resume.style);
        }
      }).catch(error => console.error('Error fetching resume by ID:', error));

    }


    return () => {
      editor?.destroy();
    };
  }, [editor, templateId,resumeId,isTokenValid]);

  return (
  
    <div>
      <div className="panel__top">
        <div className="panel__actions gjs-pn-panel gjs-pn-options gjs-one-bg gjs-two-color">
          <div className="gjs-pn-buttons"></div>
        </div>
      </div>
      <div id="example-editor" style={{ minHeight: '100vh' }}></div>
    </div>
  );
}
