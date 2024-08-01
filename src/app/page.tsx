// @ts-nocheck
"use client"; // This is a client component

import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import "grapesjs-preset-webpage";

export default function Home() {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (!editor) {
      const e = GrapesJS.init({
        container: "#example-editor",
        fromElement: true,
        showOffsets: true,
        noticeOnUnload: true,
        storageManager: false,
        plugins: ['grapesjs-preset-webpage'],
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
          ]
        },
        panels: {
          defaults: [
            {
              id: 'panel-devices',
              el: '.panel__devices',
              buttons: [
                {
                  id: 'device-desktop',
                  command: 'set-device-desktop',
                  className: 'fa fa-desktop',
                  attributes: { title: 'Desktop' }
                },
                {
                  id: 'device-tablet',
                  command: 'set-device-tablet',
                  className: 'fa fa-tablet',
                  attributes: { title: 'Tablet' }
                },
                {
                  id: 'device-mobile',
                  command: 'set-device-mobile',
                  className: 'fa fa-mobile',
                  attributes: { title: 'Mobile' }
                }
              ]
            },
            {
              id: 'panel-templates',
              el: '.panel__templates',
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

      setEditor(e);
    }

    return () => {
      editor?.destroy(); // Cleanup function to destroy editor instance on unmount
    };
  }, [editor]);

  return (
    <div>
      <div className="panel__devices"></div>
      <div className="panel__templates"></div>
      <div id="example-editor" />
    </div>
  );
}
