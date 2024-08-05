"use client";  
import React, { useEffect, useRef } from "react";

const PDFPage: React.FC = () => {
  const cvContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const exportHtml = sessionStorage.getItem('exportHtml');
    const exportCss = sessionStorage.getItem('exportCss');

    if (exportHtml && exportCss && cvContentRef.current) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = exportCss;
      document.head.appendChild(styleTag);

      cvContentRef.current.innerHTML = exportHtml;
    }
  }, []);

  const handlePrint = () => {
    const printStyleLink = document.createElement('link');
    printStyleLink.rel = 'stylesheet';
    printStyleLink.href = '/print.css'; // Ensure this path is correct
    printStyleLink.media = 'print';
    document.head.appendChild(printStyleLink);

    window.print();
  };

  const handleGoBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="pdf-page">
      <div className="button-container">
        <button id="printButton" className="btn btn-print" onClick={handlePrint}>Print Resume</button>
        <button id="goBackButton" className="btn btn-back" onClick={handleGoBack}>Return to Home</button>
      </div>
      <div id="cv-content" className="cv-content" ref={cvContentRef}></div>
    </div>
  );
};

export default PDFPage;
