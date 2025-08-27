import html2pdf from "html2pdf.js";

const exportMaterialRequestPDF = (elementRef) => {
  if (!elementRef.current) {
    console.warn("Element reference is not valid. PDF export aborted.");
    return;
  }
  
  // Check if the element has content before exporting
  if (elementRef.current.children.length === 0) {
    console.warn("The PDF component is empty. Nothing to export.");
    alert("No requests selected for export.");
    return;
  }

  const opt = {
    margin: 10,
    filename: "Material_Request.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  html2pdf().set(opt).from(elementRef.current).save();
};

export default exportMaterialRequestPDF;