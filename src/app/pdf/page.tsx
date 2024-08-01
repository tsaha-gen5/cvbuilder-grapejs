"use client";
import React, { useEffect } from "react";

const PDFPage: React.FC = () => {
  useEffect(() => {
    const exportHtml = sessionStorage.getItem('exportHtml');
    const exportCss = sessionStorage.getItem('exportCss');

    if (exportHtml && exportCss) {
      const cvContentElement = document.getElementById('cv-content');
      if (cvContentElement) {
        cvContentElement.innerHTML = exportHtml;
      }

      const styleTag = document.createElement('style');
      styleTag.innerHTML = exportCss;
      document.head.appendChild(styleTag);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button id="printButton" className="btn btn-success" onClick={handlePrint}>Print</button>
      <button id="goBackButton" className="btn btn-light" onClick={handleGoBack}>Go Back</button>
      <div id="cv-content" style={{ margin: '0 auto', width: '80%' }}></div>
    </div>
  );
};

export default PDFPage;
