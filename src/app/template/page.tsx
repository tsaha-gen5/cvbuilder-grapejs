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
  const [hasValidRole, setHasValidRole] = useState(false);
  const { getTemplates, getTemplateById, getResumeUser, createResume, updateResume, getAccountData, setTemplate, getResumeID } = useResumeAPI();

  function getTokenFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setCookie('access_token', token, 1); // Save access token as a cookie
    return token;
  }

  function getTemplateIdFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('template_id') === null) { return null; }
    const templateId_ = urlParams.get('template_id');
    setTemplateId(templateId_);
    sessionStorage.setItem('template_id', templateId_);
    console.log("templateId", templateId_);
    return true;
  }

  function getResumeIdFromQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('resume_id') === null) { return null; }
    const resumeId_ = urlParams.get('resume_id');
    setResumeId(resumeId_);
    sessionStorage.setItem('resume_id', resumeId_);
    return true;
  }

  function updateTemplateIdInURL(templateId) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('template_id') !== null) {
      urlParams.set('template_id', templateId);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
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
                  id: 'back-button',
                  className: 'fa fa-arrow-circle-left btn-builder-new',
                  attributes: { title: 'Back Home' },
                  command: 'back-home',
                },
                {
                  id: 'update-template',
                  className: 'fa fa-pencil',
                  attributes: { title: 'Update Template' },
                  command: 'update-template',
                },
                {
                  id: 'save-builder',
                  className: 'fa fa-save btn-builder-new',
                  attributes: { title: 'Save' },
                  command: 'save',
                },
                {
                  id: 'save-builder-user',
                  className: 'fa fa-user-plus',
                  attributes: { title: 'Save' },
                  command: 'save-user',
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
                const selectedTemplateId = card.getAttribute('data-templateid'); // Use local variable
                setTemplateId(selectedTemplateId); // Update templateId state
                sessionStorage.setItem('template_id', selectedTemplateId); // Save to sessionStorage
                updateTemplateIdInURL(selectedTemplateId); // Update URL
                console.log("line193 : ", selectedTemplateId);

                getTemplateById(selectedTemplateId).then(selectedTemplate => {
                  if (selectedTemplate) {
                    editor.setComponents(selectedTemplate.content);
                    editor.setStyle(selectedTemplate.style);
                    console.log(selectedTemplate.content);
                  }
                  modal.close();
                }).catch(error => {
                  console.error('Error fetching template by ID:', error);
                });
              });
            });
          }).catch(error => {
            console.error('Error fetching templates:', error);
          });
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

      e.Commands.add('update-template', {
        run(editor, sender) {
          const templateId = sessionStorage.getItem('template_id');
          if (!templateId) {
            alert("No template selected.");
            return;
          }
          console.log("templateId", templateId);
      
          getTemplateById(templateId).then(selectedTemplate => {
            if (selectedTemplate) {
              const resumeContent = editor.getHtml();
              const resumeStyle = editor.getCss();
      
              const updatedTemplate = {
                template_id: parseInt(templateId, 10),
                content: resumeContent,
                style: resumeStyle,
                title: selectedTemplate.title,
                description: selectedTemplate.description,
                photo: selectedTemplate.photo
              };
      
              console.log("Updating template with data:", updatedTemplate);
      
              setTemplate(
                updatedTemplate.template_id,
                updatedTemplate.content,
                updatedTemplate.style,
                updatedTemplate.title,
                updatedTemplate.description,
                updatedTemplate.photo
              )
              .then(response => {
                console.log("Template updated successfully:", response);
                alert("Template updated successfully!");
              })
              .catch(error => {
                console.error('Error updating template:', error);
                alert("Failed to update template. Check the console for details.");
              });
            } else {
              console.error('Template not found.');
              alert("Template not found.");
            }
          }).catch(error => {
            console.error('Error fetching template by ID:', error);
            alert("Failed to fetch template details.");
          });
        }
      });
      
      

      e.Commands.add('save', {
        run(editor, sender) {
          if (sessionStorage.getItem('hasValidRole') === 'false') {
            alert('You do not have the necessary permissions to save this resume.');
            return;
          }

          const resumeContent = editor.getHtml();  // Adjusted to get HTML content
          const resumeStyle = editor.getCss();  // Adjusted to get CSS style

          getAccountData().then(accountData => {
            const userId = accountData.user_id;
            const savedResumeId = sessionStorage.getItem('resume_id');
            const _templateId = sessionStorage.getItem('template_id');
            console.log("templateId 234", _templateId);
            
            if (savedResumeId) {
              // Update existing resume
              console.log("Line 244", savedResumeId);
              updateResume({ content: resumeContent, style: resumeStyle, title: 'Updated Resume', description: 'Updated resume', resume_id: savedResumeId })
                .then(() => alert("Resume updated successfully!"))
                .catch(error => console.error('Error updating resume:', error));
            } else {
              // Create new resume              
              createResume({ user_id: userId, content: resumeContent, style: resumeStyle, title: 'New Resume', description: 'A new resume', template_id: _templateId })
                .then(response => {
                  alert("Resume created successfully!");
                  // Save the new resume_id to session storage
                  const newResumeId = response.id;
                  sessionStorage.setItem('resume_id', null);
                  setResumeId(newResumeId);
                })
                .catch(error => console.error('Error creating resume:', error));
            }
          }).catch(error => console.error('Error fetching account data:', error));           
        }
      });

      e.Commands.add('save-user', {
        run(editor, sender) {
          if (sessionStorage.getItem('hasValidRole') === 'false') {
            alert('You do not have the necessary permissions to save this resume.');
            return;
          }

          const modal = editor.Modal;
          modal.setTitle('Enter Candidate ID');
          modal.setContent(`
            <div class="modal-container">
              <input type="text" id="candidate-id" placeholder="Enter Candidate ID" />
              <button id="save-candidate-id">Save</button>
            </div>
          `);
          modal.open();

          document.getElementById('save-candidate-id').addEventListener('click', () => {
            const candidateId = document.getElementById('candidate-id').value;
            if (candidateId) {
              modal.close();
              const resumeContent = editor.getHtml();  // Adjusted to get HTML content
              const resumeStyle = editor.getCss();  // Adjusted to get CSS style

              const savedResumeId = sessionStorage.getItem('resume_id');
              const _templateId = sessionStorage.getItem('template_id');
              console.log("templateId 234", _templateId);
              
              if (savedResumeId) {
                // Update existing resume
                console.log("Line 244", savedResumeId);
                updateResume({ content: resumeContent, style: resumeStyle, title: 'Updated Resume', description: `Updated resume for user ${userId}`, resume_id: savedResumeId })
                  .then(() => alert("Resume updated successfully!"))
                  .catch(error => console.error('Error updating resume:', error));
              } else {
                // Create new resume              
                createResume({ user_id: candidateId, content: resumeContent, style: resumeStyle, title: 'New Resume', description: `A new resume for user ${userId}`, template_id: _templateId})
                  .then(response => {
                    alert("Resume created successfully!");
                    // Save the new resume_id to session storage
                    const newResumeId = response.id;
                    sessionStorage.setItem('resume_id', newResumeId);
                    setResumeId(newResumeId);
                  })
                  .catch(error => console.error('Error creating resume:', error));
              }
            } else {
              alert('Please enter a valid candidate ID.');
            }
          });
        }
      });

      setEditor(e);
    }
  }, [hasValidRole]);

  useEffect(() => {
    if (editor) {
      getAccountData().then(accountData => {
        const userRole = accountData.role.role_name;
        console.log("userRole", userRole);
        if (['admin', 'CIP', 'manager'].includes(userRole)) {
          setHasValidRole(true);
          sessionStorage.setItem('hasValidRole', true);
        } else {
          setHasValidRole(false);
          sessionStorage.setItem('hasValidRole', false);

          alert("Vous n'avez pas les permissions nécessaires pour éditer ce CV.");
        }

        if (templateId !== null) {
          getTemplateById(templateId).then(selectedTemplate => {
            if (selectedTemplate) {
              editor.setComponents(selectedTemplate.content);
              editor.setStyle(selectedTemplate.style);
              sessionStorage.setItem('template_id', selectedTemplate.id);
            }
          }).catch(error => {
            console.error('Error fetching template by ID:', error);
          });
        } else if (templateId === null) {
          // Choose default template if nothing is present in the header
          setResumeId(null);
          getTemplates().then(templates => {
            const defaultTemplate = templates[0];
            console.log("defaultTemplate", defaultTemplate);

            setTemplateId(defaultTemplate.id);
            sessionStorage.setItem('template_id', defaultTemplate.id); // Save to sessionStorage
            editor.setComponents(defaultTemplate.content);
            editor.setStyle(defaultTemplate.style);
          }).catch(error => console.error('Error fetching templates:', error));
        }
      }).catch(error => {
        console.error('Error fetching account data:', error);
      });
    }
  }, [editor, templateId, resumeId]);

  return (
    <div style={{ position: 'relative' }}>
      <div className="panel__top">
        <div className="panel__actions gjs-pn-panel gjs-pn-options gjs-one-bg gjs-two-color">
          <div className="gjs-pn-buttons"></div>
        </div>
      </div>
      <div id="example-editor" style={{ minHeight: '100vh', position: 'relative' }}></div>
    </div>
  );
}
