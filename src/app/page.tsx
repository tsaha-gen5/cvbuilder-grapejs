// @ts-nocheck
"use client"; // This is a client component
import React, { useEffect, useState } from "react";
import "grapesjs/dist/css/grapes.min.css";
import GrapesJS from "grapesjs";
import Parser from "grapesjs-parser-postcss";

export default function Home() {
  const [editor, setEditor] = useState(null);
  const [templateName, setTemplateName] = useState('template1');

  useEffect(() => {
    if (!editor) {
      const e = GrapesJS.init({
        container: "#example-editor",
        fromElement: true,
        showOffsets: true,
        noticeOnUnload: true,
        storageManager: false,
        plugins: [Parser],
        canvasCss: ".gjs-plh-image {width:auto;height:auto;}"
      });

      e.BlockManager.add('template-selector', {
        label: 'Template Selector',
        content: `<div>
                    <select id="template-selector-dropdown" onchange="changeTemplate(event)">
                      <option value="template1">Template 1</option>
                      <option value="template2">Template 2</option>
                      <option value="template3">Template 3</option>
                      // Add more templates as needed
                    </select>
                  </div>`,
        category: 'Basic',
      });

      // Function to change templates
      window.changeTemplate = (event) => {
        setTemplateName(event.target.value);
      };

      setEditor(e);
    }

    return () => {
      editor?.destroy(); // Cleanup function to destroy editor instance on unmount
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      fetch(`/modelscv/${templateName}.json`)
        .then(response => response.json())
        .then(data => {
          editor.setComponents(data.content);
          editor.setStyle(data.style);
        })
        .catch(error => console.error('Error fetching the JSON file:', error));
    }
  }, [templateName, editor]); // Depend on templateName and editor to reload when changed

  return (
    <div>
      <div id="example-editor" style={{ height: '300px' }} />
    </div>
  );
}
