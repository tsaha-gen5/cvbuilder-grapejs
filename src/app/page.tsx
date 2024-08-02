// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import "grapesjs-preset-webpage";
import useResumeAPI from '@/hooks/useResumeAPI';  // Ensure this path is correct

export default function Home() {
  const [editor, setEditor] = useState(null);
  const { getTemplates, getTemplateById, getResumeUser, setResumeUser, setTemplate } = useResumeAPI();
  const userId = 1; // Replace with actual user ID

  useEffect(() => {
    if (!editor) {
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
                    setTemplate(templateId, selectedTemplate); // Save selected template to API
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

    return () => {
      editor?.destroy();
    };
  }, [editor, getTemplates, getTemplateById, setResumeUser, setTemplate]);

  return (
    <div>
      <div className="panel__top">
        <div className="panel__actions gjs-pn-panel gjs-pn-options gjs-one-bg gjs-two-color">
          <div className="gjs-pn-buttons"></div>
        </div>
      </div>
      <div id="example-editor" style={{ height: '800px' }}></div>
    </div>
  );
}
