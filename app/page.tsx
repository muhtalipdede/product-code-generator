"use client";
import React, { useEffect, useState } from "react";
import * as CSVParser from "papaparse";
import Select from "react-dropdown-select";
import { downloadCsvWithLink } from "@/utils/csv";
import Loading from "@/components/loading";

export default function CSVProcessor() {
  const [familyList, setFamilyList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({}) as any;
  const [attributeList, setAttributeList] = useState([]);
  const [productList, setProductList] = useState<string[]>([]);
  const [filteredProductList, setFilteredProductList] = useState<string[]>([]);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [duplicateProductCodes, setDuplicateProductCodes] = useState<string[]>([]);
  const [hasDuplicateProductCodes, setHasDuplicateProductCodes] = useState<boolean>(false);
  const [showDuplicateProductCodesModal, setShowDuplicateProductCodesModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFamilyListDownloadSample = (e: any) => {
    downloadCsvWithLink("/Family-List.csv", "Family-List.csv");
  }

  const handleAttributeListDownloadSample = (e: any) => {
    downloadCsvWithLink("/List-Attributes.csv", "List-Attributes.csv");
  }

  const handleFamilyList = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const csvText = event.target.result;
        CSVParser.parse(csvText, {
          header: true,
          complete: (results: any) => {
            setFamilyList(results.data);
          },
          error: (error: any) => {
            setErrorList(["Family list is empty"]);
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
            setErrorList(["Attribute list is empty"]);
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateProductList = async (e: any) => {
    setLoading(true);
    try {
      if (familyList.length === 0 || attributeList.length === 0) {
        setErrorList(["Family list or attribute list is empty"]);
        return;
      }
      const result = await fetch(`/api/generate${location.search}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familyList,
          attributeList,
        }),
      });
      const data = await result.json();
      if (data.errorList.length > 0) {
        setErrorList(data.errorList);
      }
      if (data.errorType === "duplicate-product-code-error")
        setHasDuplicateProductCodes(true);
      setProductList(data.products);
    } catch (error) {
      setErrorList(["Error generating product list"]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllFilters = () => {
    setFilterOptions({});
    setFilteredProductList([]);
  }


  const handleProductMappingChange = (value: any, key: any) => {
    if (value.length === 0) {
      const tempFilterOptions = { ...filterOptions };
      delete tempFilterOptions[key];
      setFilterOptions(tempFilterOptions);
    } else {
      const tempFilterOptions = { ...filterOptions };
      tempFilterOptions[key] = value.map((option: any) => option.label);
      setFilterOptions(tempFilterOptions);
    }
  }

  const filterProducts = (products: any, key: any, filters: any) => {
    return products.filter((product: any) => {
      if (filters.length === 0) {
        return true;
      }
      if (filters.includes(product[key])) {
        return true;
      }
      return false;
    })
  };

  useEffect(() => {
    let filteredProducts = productList;
    Object.keys(filterOptions).forEach((key) => {
      filteredProducts = filterProducts(filteredProducts, key, filterOptions[key]);
    })
    setFilteredProductList(filteredProducts);
  }, [filterOptions, productList]);

  const exportCSV = (e: any) => {
    if (productList.length === 0) {
      setErrorList(["Product list is empty"]);
      return;
    }
    let _productList = productList;
    if (filteredProductList.length > 0) {
      _productList = filteredProductList;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += Object.keys(_productList[0]).join(",") + "\n";
    csvContent += _productList.map((row: any) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
  }

  const handleShowDuplicateProductCodes = async (e: any) => {
    setLoading(true);
    try {
      const result = await fetch("/api/duplicate-product-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familyList: familyList,
          attributeList: attributeList,
        }),
      });
      const data = await result.json();
      setDuplicateProductCodes(data);
      setShowDuplicateProductCodesModal(true);
    } catch (error) {
      setErrorList(["Error showing duplicate product codes"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="flex flex-row gap-4 px-4 py-6 mx-auto sm:px-6 lg:px-8 p-4">
        <div className="flex flex-col gap-2">
          <label className="text-lg font-bold">Family List</label>
          <input
            type="file"
            onChange={handleFamilyList}
            accept=".csv"
            className="w-full text-sm  border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <p className="text-sm text-gray-500">
            Only CSV files are supported
            <br />
            <button className="text-blue-500" onClick={handleFamilyListDownloadSample}>Download sample</button>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg font-bold">Attribute List</label>
          <input
            type="file"
            onChange={handleAttributeList}
            accept=".csv"
            className="w-full text-sm  border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <p className="text-sm text-gray-500">
            Only CSV files are supported
            <br />
            <button className="text-blue-500" onClick={handleAttributeListDownloadSample}>
              Download sample
            </button>
          </p>
        </div>
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold ">
            Product Code Generator
          </h1>
          <p className="text-sm text-gray-500">
            Generate product codes based on family list and attribute list
          </p>
          <p className="text-sm text-gray-500">
            Select the family list and attribute list files to generate the product list
          </p>
          <p className="text-sm text-gray-500">
            If you have a question or need help, please contact us at{" "}
            <a href="mailto:agustos@agustos.com" className="text-blue-500">
              agustos@agustos.com
            </a>
          </p>
        </div>
      </div>

      {errorList.length > 0 && <div className="flex flex-col gap-4 px-4 py-6 mx-auto sm:px-6 lg:px-8 bg-red-100 p-4">
        {(
          errorList.map((error: any, index: any) => (
            <p className="text-red-500" key={index}>{error}</p>
          ))
        )}
      </div>}

      <div className="flex flex-row gap-4 px-4 py-6 mx-auto sm:px-6 lg:px-8 p-4">
        <button onClick={handleGenerateProductList} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Generate Product List
        </button>
        <button onClick={exportCSV} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Export CSV
        </button>
        <button onClick={handleClearAllFilters} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Clear Filters
        </button>
        {hasDuplicateProductCodes && <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleShowDuplicateProductCodes}>
          Show Duplicate Product Codes
        </button>}
      </div>
      <div className="flex flex-row gap-4 px-4 py-6 mx-auto sm:px-6 lg:px-8 p-4 overflow-x-auto">
        {productList.length > 0 && (
          <table className="table min-w-full divide-y divide-gray-200 border border-gray-200 rounded shadow bg-white border-collapse text-xs">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {Object.keys(productList[0]).map((key: any) => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                    {key !== "Product Reference" && key != "Product Name" ? <Select options={productList
                      .reduce((acc: any, product: any) => {
                        if (!acc.includes(product[key])) {
                          acc.push(product[key]);
                        }
                        return acc;
                      }, [])
                      .map((product: any) => {
                        return {
                          label: product,
                          value: key + "," + product
                        }
                      })}
                      onChange={(value) => handleProductMappingChange(value, key)}
                      onClearAll={handleClearAllFilters}
                      values={filterOptions[key]}
                      multi={true}
                    /> : <></>}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                {Object.keys(productList[0]).map((key) => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProductList.length > 0 ? filteredProductList.map((row, index) => (
                <tr key={index} className="border-b border-gray-200">
                  {Object.values(row).map((value, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      {value}
                    </td>
                  ))}
                </tr>
              )) : productList.map((row, index) => (
                <tr key={index} className="border-b border-gray-200">
                  {Object.values(row).map((value, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDuplicateProductCodesModal && <div className="fixed z-10 inset-0 overflow-y-auto">
        {duplicateProductCodes.length > 0 && (
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 scroll">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start max-h-96 overflow-y-auto">
                  <button onClick={() => setShowDuplicateProductCodesModal(false)} className="absolute top-0 right-0 p-2 m-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-bold leading-6 ">Duplicate Product Codes</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {duplicateProductCodes.map((productCode, index) => (
                          <p key={index}>{productCode}</p>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>}
      <Loading loading={loading} />
    </main>
  );
}
