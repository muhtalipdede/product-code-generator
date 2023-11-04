"use client";
import React, { useEffect, useState } from "react";
import * as CSVParser from "papaparse";

export default function CSVProcessor() {
  const [familyList, setFamilyList] = useState([]);
  const [attributeList, setAttributeList] = useState([]);
  const [productList, setProductList] = useState<string[]>([]);

  const handleFamilyList = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const csvText = event.target.result;
        // CSV'yi işle
        CSVParser.parse(csvText, {
          header: true,
          complete: (results: any) => {
            setFamilyList(results.data);
          },
          error: (error: any) => {
            console.error("CSV işleme hatası:", error);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleAttributeList = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const csvText = event.target.result;
        CSVParser.parse(csvText, {
          header: true,
          complete: (results: any) => {
            setAttributeList(results.data);
          },
          error: (error: any) => {
            console.error("CSV işleme hatası:", error);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateProductList = (e: any) => {
    const productMapping = {} as any;
    attributeList.forEach((attribute: any) => {
      const type = attribute.Type;
      if (!productMapping[type]) {
        productMapping[type] = [];
      }
      productMapping[type].push(attribute);
    });

    let totalRowCount = 0;
    familyList.forEach((family: any) => {
      let rowCount = 1;
      Object.keys(family).forEach((familyKey) => {
        if (
          productMapping[familyKey] &&
          family[familyKey].split(",").length > 1
        ) {
          rowCount = rowCount * family[familyKey].split(",").length;
        }
      });
      totalRowCount = totalRowCount + rowCount;
    });

    let products = [] as any[];

    let index = 0;
    familyList.forEach((family: any) => {
      let rowCount = 1;
      Object.keys(family).forEach((familyKey) => {
        if (
          productMapping[familyKey] &&
          family[familyKey].split(",").length > 1
        ) {
          rowCount = rowCount * family[familyKey].split(",").length;
        }
      });

      for (let i = 0; i < rowCount; i++) {
        let updatedFamily = { ...family };

        Object.keys(family).forEach((familyKey) => {
          if (
            productMapping[familyKey] &&
            family[familyKey].split(",").length > 1
          ) {
            let multipleAttributes = family[familyKey].split(",");
            updatedFamily[familyKey] = multipleAttributes[i];

            multipleAttributes.splice(i, 1);
          }
        });

        updatedFamily["Code"] = "";
        Object.keys(updatedFamily).forEach((key) => {
          if (productMapping[key]) {
            if (updatedFamily["Code"] == "") {
              updatedFamily["Code"] = updatedFamily[key];
            } else if (updatedFamily[key]) {
              updatedFamily["Code"] = updatedFamily["Code"] + "-" + updatedFamily[key];
            }
          }
        })
        products.push(updatedFamily);
      }
    })

    setProductList(products);
  };

  const exportCSV = (e: any) => {
    const csvContent = "data:text/csv;charset=utf-8," + productList.map((row: any) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV Processor</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Upload Files</h2>
          <div className="flex flex-col gap-2">
            <label className="text-lg font-bold">Family List</label>
            <input
              type="file"
              onChange={handleFamilyList}
              accept=".csv"
              className="file-input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg font-bold">Attribute List</label>
            <input
              type="file"
              onChange={handleAttributeList}
              accept=".csv"
              className="file-input"
            />
          </div>
        </div>

        <button onClick={handleGenerateProductList} className="button primary">
          Generate Product List
        </button>
        <button onClick={exportCSV} className="button secondary">
          Export CSV
        </button>

        {familyList.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                {Object.keys(familyList[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {familyList.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {attributeList.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                {Object.keys(attributeList[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributeList.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {productList.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                {Object.keys(productList[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productList.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}


      </div>
    </div>
  );
}
