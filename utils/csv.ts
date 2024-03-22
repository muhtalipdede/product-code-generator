export const downloadCsv = (data: any[], filename: string): void => {
    const link = document.createElement("a");
    let csv = "data:text/csv;charset=utf-8,";
    csv += data.map((row) => Object.values(row).join(",")).join("\n");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", filename);
    link.click();
}

export const downloadCsvWithLink = (path: string, filename: string): void => {
    const link = document.createElement("a");
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
}