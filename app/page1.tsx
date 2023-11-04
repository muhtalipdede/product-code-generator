"use client";
import React, { useState } from "react";
import * as CSVParser from "papaparse"; // CSV işleme kütüphanesi

export default function CSVProcessor() {
  const [familyList, setFamilyList] = useState([]); // CSV verilerini depolamak için state
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
            setFamilyList(results.data); // Verileri state'e kaydet
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
        // CSV'yi işle
        CSVParser.parse(csvText, {
          header: true,
          complete: (results: any) => {
            setAttributeList(results.data); // Verileri state'e kaydet
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

    // attributeList içindeki "type" alanını kullanarak productMapping oluştur
    attributeList.forEach((attribute: any) => {
      const type = attribute.Type;

      // Eğer productMapping içinde bu tip için bir dizi yoksa, yeni bir dizi oluştur
      if (!productMapping[type]) {
        productMapping[type] = [];
      }

      // attribute'i diziye ekle
      productMapping[type].push(attribute);
    });

    // familyList içindeki header'ları productMapping ile eşleştirerek yeni bir ürün listesi oluştur
    const productList = familyList.map((family: any, index) => {
      let product = "";
      let indProduct = [] as any;

      let multipleAttributes = {} as any;
      Object.keys(family).forEach((familyAttribustes) => {
        debugger;

        if (productMapping[familyAttribustes]) {
          if (family[familyAttribustes]) {
            if (family[familyAttribustes].includes(",")) {
              multipleAttributes[familyAttribustes] = family[familyAttribustes];
              debugger;
              // family[familyAttribustes].split(",").forEach((item: any) => {
              //   product = product + "-" + item;
              // });
            }
          }
          if (multipleAttributes[familyAttribustes]) {
            Object.keys(multipleAttributes[familyAttribustes]).forEach(
              (cell: any) => {
                let LastIndProduct = "";
                family[familyAttribustes].split(",").forEach((item: any) => {
                  let initialProduct = product;
                  indProduct.push(product + "-" + item);
                  product = initialProduct;
                  LastIndProduct = indProduct;
                });
                LastIndProduct;
                debugger;
              }
            );
          } else {
            product = product + "-" + family[familyAttribustes];
          }
        }
      });
      return product;
    });

    setProductList(productList);

    console.log("Yeni Ürün Listesi:", productList);
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFamilyList}
        accept=".csv"
        placeholder="Add Family List"
      />
      <input
        type="file"
        onChange={handleAttributeList}
        accept=".csv"
        placeholder="Add Attribute List"
      />
      <table>
        <thead>
          <tr>
            {familyList.length > 0 &&
              Object.keys(familyList[0]).map((key) => <th key={key}>{key}</th>)}
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
      <table>
        <thead>
          <tr>
            {attributeList.length > 0 &&
              Object.keys(attributeList[0]).map((key) => (
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
      <table>
        <thead>
          <tr>
            {productList.length > 0 &&
              Object.keys(productList[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {productList.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value: any, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button name="Generate" onClick={handleGenerateProductList}>
        Generate Product List
      </button>
    </div>
  );
}
