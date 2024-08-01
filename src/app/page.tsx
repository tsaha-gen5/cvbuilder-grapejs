// @ts-nocheck
"use client"; // This is a client component

import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import "grapesjs-preset-webpage";
// import "./styles.css"; // Ensure this is imported

export default function Home() {
  const [editor, setEditor] = useState(null);

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
                  active: false, // Ensure it's not active by default
                },
                {
                  id: 'export-pdf',
                  command: 'export-pdf',
                  label: 'Export PDF',
                  attributes: { class: 'btn btn-success' },
                  active: false, // Ensure it's not active by default
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
                  active:false // Use built-in command
                },
                {
                  id: 'preview-button',
                  command: 'core:preview',
                  className: 'fa fa-eye',
                  active: false, // Ensure it's not active by default
                },
                {
                  id: 'undo',
                  className: 'fa fa-undo',
                  command: 'core:undo', // Use built-in command
                },
                {
                  id: 'redo',
                  className: 'fa fa-repeat',
                  command: 'core:redo', // Use built-in command
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
          modal.setContent(`
            <div class="modal-row">
              ${[...Array(9).keys()].map(i => `
                <div class="modal-column">
                  <div class="card card-template" data-templateid="${i + 1}">
                    <img src="/images/templates/template${i + 1}.webp" alt="CV Template ${i + 1}" />
                    <div class="modal-container">
                      <h4><b>Resume ${i + 1}</b></h4>
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
              fetch(`/modelscv/template${templateId}.json`)
                .then(response => response.json())
                .then(data => {
                  editor.setComponents(data.content);
                  editor.setStyle(data.style);
                  modal.close();
                })
                .catch(error => console.error('Error fetching the JSON file:', error));
            });
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

      e.Commands.add('save', {
        run(editor, sender) {
          alert("Save command executed!");
        }
      });

      setEditor(e);
    }

    return () => {
      editor?.destroy(); // Cleanup function to destroy editor instance on unmount
    };
  }, [editor]);

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
