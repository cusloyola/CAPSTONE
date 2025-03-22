export const loadRowData = () => {
    const savedData = localStorage.getItem("rowData");
    return savedData ? JSON.parse(savedData) : [];
  };
  
  export const saveRowData = (rowData) => {
    localStorage.setItem("rowData", JSON.stringify(rowData));
  };
  