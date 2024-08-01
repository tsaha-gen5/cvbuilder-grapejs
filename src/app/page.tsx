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
        storageManager: true,
        plugins: ['grapesjs-preset-webpage'],
        styleManager: {
          sectors: [{
            name: 'General',
            open: false,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
          },{
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },{
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow'],
            properties:[
              { name: 'Font', property: 'font-family'},
              { name: 'Weight', property: 'font-weight'},
              { name:  'Font color', property: 'color'},
              {
                property: 'text-align',
                type: 'radio',
                defaults: 'left',
                list: [
                  { value : 'left', name : 'Left', className: 'fa fa-align-left'},
                  { value : 'center', name : 'Center', className: 'fa fa-align-center' },
                  { value : 'right', name : 'Right',  className: 'fa fa-align-right'},
                  { value : 'justify', name : 'Justify',   className: 'fa fa-align-justify'}
                ],
              },{
                property: 'text-decoration',
                type: 'radio',
                defaults: 'none',
                list: [
                  { value: 'none', name: 'None', className: 'fa fa-times'},
                  { value: 'underline', name: 'underline', className: 'fa fa-underline' },
                  { value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}
                ],
              },{
                property: 'font-style',
                type: 'radio',
                defaults: 'normal',
                list: [
                  { value: 'normal', name: 'Normal', className: 'fa fa-font'},
                  { value: 'italic', name: 'Italic', className: 'fa fa-italic'}
                ],
              },{
                property: 'text-shadow',
                properties: [
                  { name: 'X position', property: 'text-shadow-h'},
                  { name: 'Y position', property: 'text-shadow-v'},
                  { name: 'Blur', property: 'text-shadow-blur'},
                  { name: 'Color', property: 'text-shadow-color'}
                ],
            }],
          },{
            name: 'Decorations',
            open: false,
            buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background'],
          },{
            name: 'Extra',
            open: false,
            buildProps: ['transition', 'perspective', 'transform'],
          }],
        },
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
                  // attributes: { title: 'View components' },
                  command: 'core:select-all-components', // Use built-in command
                },
                {
                  id: 'preview-button',
                  command: 'preview',
                  className: 'fa fa-eye',
                  attributes: { title: 'Preview' },
                  active: false, // Ensure it's not active by default
                },
                {
                  id: 'undo',
                  className: 'fa fa-undo',
                  command: 'core:undo', // Use built-in command
                },
                {
                  id: 'redo',
                  className: 'fa fa-redo',
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
                  id: 'open-style-manager',
                  className: 'fa fa-cog',
                  attributes: { title: 'Open Style Manager' },
                  command: 'open-style-manager',
                },
                {
                  id: 'settings',
                  className: 'fa fa-cog',
                  // attributes: { title: 'Settings' },
                  command: 'core:open-styles (opens new window)',
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

      e.Commands.add('preview', {
        run(editor, sender) {
          const canvas = editor.Canvas.getElement();
          if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
          } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
          } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
          } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
          }
        }
      });

      e.Commands.add('back-home', {
        run(editor, sender) {
          window.location.href = '/';
        }
      });

      e.Commands.add('save', {
        run(editor, sender) {
          // Save logic here
          alert("Save command executed!");
        }
      });

      // Define a command to select all components including nested ones
      e.Commands.add('select-all-components', {
        run(editor, sender) {
          const selectAllComponents = (component) => {
            editor.select(component);
            component.components().each(child => selectAllComponents(child));
          };
          
          const wrapper = editor.DomComponents.getWrapper();
          wrapper.components().each(component => selectAllComponents(component));
        }
      });

      e.Commands.add('open-style-manager', {
        run(editor, sender) {
          const openSmBtn = editor.StyleManager;
          if (openSmBtn) {
            openSmBtn.set('active', true);
          } else {
            console.error('Style Manager button not found');
          }
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
        <div className="panel__templates"></div>
        <div className="panel__actions gjs-pn-panel gjs-pn-options gjs-one-bg gjs-two-color">
          <div className="gjs-pn-buttons"></div>
        </div>
      </div>
      <div id="example-editor" style={{ height: '800px' }}></div>
    </div>
  );
}
