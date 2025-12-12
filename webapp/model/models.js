sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        creatStartUpParameters: function(){
            var oSettingsModel = new JSONModel({
                startupParameters: { }
            });
            return oSettingsModel;
        },
        fnCreateMockData: function(){
               
                var deepDynamicTable = {
                    Header: [],
                    Items: [],
                    SubHeader: [],
                    SubItems:[]
                };
                 var oDataHeader = [];
                 var oDataItem = [];
                 var oDataSubHeader = [];
                 var oDataSubItem = [];
                // create mock sample data 
                 var _oRow = {};
                _oRow =  {
                    "HeaderIndex": 1,
                    "HeaderName": "TRAFF_LGT",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Traffic-light",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);   

                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 2,
                    "HeaderName": "SUPP_NO",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Supplier number",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);     
             
                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 3,
                    "HeaderName": "SUPP_NAME",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Supplier name",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow); 
                	 
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 4,
                "HeaderName": "SUPP_CITY",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Supplier city",
                "IsMain": true,
                "Editable": true,
                "Visible": true
                }
                oDataHeader.push(_oRow); 
                	 
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 5,
                "HeaderName": "SUPP_CTRY",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Supplier country",
                "IsMain": true,
                "Editable": true,
                "Visible": true
                }
                oDataHeader.push(_oRow); 
                	 
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 6,
                "HeaderName": "PO_NO",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Pirchase order",
                "IsMain": true,
                "Editable": true,
                "Visible": true
                }
                oDataHeader.push(_oRow); 
                
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 7,
                "HeaderName": "ASSE_PRD",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Assembly product",
                "IsMain": true,
                "Editable": true,
                "Visible": true
                }
                oDataHeader.push(_oRow); 	 
                	
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 8,
                    "HeaderName": "PRD_DESCR",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Product description",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow); 	 
                	
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 9,
                    "HeaderName": "COMPONENT",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Component",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow); 	 
                	 
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 10,
                    "HeaderName": "COMP_DESCR",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Component description",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow); 
                	 
                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 11,
                    "HeaderName": "STOCK",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Stock",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);     
                	 
              _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 12,
                    "HeaderName": "UOM",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Unit of measure",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);      
                	 
                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 13,
                    "HeaderName": "SUM_HU",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Sum HU",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);       
                	 
                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 14,
                    "HeaderName": "STOCK_SUPP",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Stock at supplier",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);    
                
                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 15,
                    "HeaderName": "BEN",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": " ",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow); 

                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 16,
                    "HeaderName": "DEMAND",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Demand",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);       
                	
                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 17,
                    "HeaderName": "SHIP_TO",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Ship to party",
                    "IsMain": true,
                    "Editable": true,
                    "Visible": true
                   }
                oDataHeader.push(_oRow);   
             
                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 18,
                    "HeaderName": "IsMain",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "IsMain",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow);   
                
                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 19,
                    "HeaderName": "RootId",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Root Id",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow);   

                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 20,
                    "HeaderName": "ParentId",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Parent Id",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow);   

                // add three fields to handle index for line item of assembly product   
                  _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 21,
                    "HeaderName": "MainIndex",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Main ndex",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow);   
                
                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 22,
                    "HeaderName": "HeaderIndex",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Header ndex",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow);   

                 _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 23,
                    "HeaderName": "ItemsIndex",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Items ndex",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow); 

                _oRow = new Array();
                    _oRow =  {
                    "HeaderIndex": 24,
                    "HeaderName": "EditDelQty",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Edit Del.Qty",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": false
                   }
                oDataHeader.push(_oRow); 
                // item
                _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 0,
                    "ItemsIndex": 1,
                    "Col1": "Success",
                    "Col2": "11159",
                    "Col3": "Chrom muller",
                    "Col4": "Oberdorf",
                    "Col5": "AT",
                    "Col6": "55129100",
                    "Col7": "F00B.J60.799",
                    "Col8": "Screw Plug",
                    "Col9": "F00B.V02.859",
                    "Col10": "Screw Plug",
                    "Col11": "4000",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "300",
                    "Col15": "",
                    "Col16": "200",
                    "Col17": "1000911200",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": true,
                    "RootId": "1",
                    "ParentId": "",
                    "EditDelQty": false
                } 
                oDataItem.push(_oRow);
                _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "ItemsIndex": 2,
                    "MainIndex": 0,
                    "Col1": "Warning",
                    "Col2": "11159",
                    "Col3": "Chrom muller",
                    "Col4": "Oberdorf",
                    "Col5": "AT",
                    "Col6": "55129100",
                    "Col7": "F00B.J60.799",
                    "Col8": "Screw Plug",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "0",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "1000911200",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": true,
                    "RootId": "2",
                    "ParentId":"",
                    "EditDelQty": false
                } 
                oDataItem.push(_oRow);
                deepDynamicTable.Header = oDataHeader;
                deepDynamicTable.Items = oDataItem;

               // sub-item data - header   
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 1,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 1,
                "HeaderName": "ITM_TRAFF_LGT",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Traffic-light",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow);  

                 _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 2,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 6,
                "HeaderName": "DELIVERY_NUMBER",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Delivery Number",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow); 

                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 3,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 7,
                "HeaderName": "STOR_TYPE",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Store type",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow); 


                 _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 4,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 8,
                "HeaderName": "STOR_BIN",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Store bin",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow); 


                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 5,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 9,
                "HeaderName": "ITM_COMPNENT",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Component",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow); 
                
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 6,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 10,
                "HeaderName": "ITM_COMPDESCR",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Component Description",
                "IsMain": false,
                "Editable": false,
                "Visible": true
                }
                oDataSubHeader.push(_oRow);  

                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 7,
                    "MainIndex": 0,
                "ItemsIndex": 0,
                    "MainPosition": 11,
                    "HeaderName": "ITM_STOCK",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Stock",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                }
                oDataSubHeader.push(_oRow);  
   
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 8,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 12,
                    "HeaderName": "ITM_UOM",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Unit of measure",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                   }
                oDataSubHeader.push(_oRow);  
 
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 9,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 13,
                    "HeaderName": "ITM_SUMHU",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Sum HU/Batch",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                }
                oDataSubHeader.push(_oRow);  

                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 10,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 14,
                    "HeaderName": "ITM_BATCH",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Batch",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                }
                oDataSubHeader.push(_oRow);  

                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 11,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 15,
                    "HeaderName": "ITM_BEN",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Ben",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                   }
                oDataSubHeader.push(_oRow); 

                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 12,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 16,
                    "HeaderName": "ITM_DEMAND",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Demand",
                    "IsMain": false,
                    "Editable": false,
                    "Visible": true
                   }
                oDataSubHeader.push(_oRow);  
	 
                _oRow = new Array();
                _oRow =  {
                    "HeaderIndex": 13,
                    "MainIndex": 0,
                    "ItemsIndex": 0,
                    "MainPosition": 17,
                    "HeaderName": "ITM_DELQTY",
                    "HeaderType": "String",
                    "HeaderKey": false,
                    "HeaderValue": "Delivery Qty",
                    "IsMain": false,
                    "Editable": true,
                    "Visible": true
                   }
                oDataSubHeader.push(_oRow);  

                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 14,   
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 18,
                "HeaderName": "IsMain",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "IsMain",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);   
                
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 15,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 19,
                "HeaderName": "RootId",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Root Id",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);   

                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 16,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 20,
                "HeaderName": "ParentId",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Parent Id",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);   

                // add three fields to handle index for line item of component
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 17,   
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 21,
                "HeaderName": "MainIndex",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Main Index",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);   
                
                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 18,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 22,
                "HeaderName": "HeaderIndex",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Header Index",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);   

                _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 19,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 23,
                "HeaderName": "ItemsIndex",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Items Index",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);


                 _oRow = new Array();
                _oRow =  {
                "HeaderIndex": 20,
                "MainIndex": 0,
                "ItemsIndex": 0,
                "MainPosition": 24,
                "HeaderName": "EditDelQty",
                "HeaderType": "String",
                "HeaderKey": false,
                "HeaderValue": "Edit Del.Qty",
                "IsMain": false,
                "Editable": false,
                "Visible": false
                }
                oDataSubHeader.push(_oRow);
          
                // sub-item - item data
                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 1,
                    "Col1": "Success",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "1239589509",
                    "Col7": "Store type 1",
                    "Col8": "Store bin 1",
                    "Col9": "F00B.V02.859",
                    "Col10": "Screw Plug",
                    "Col11": "400",
                    "Col12": "PC",
                    "Col13": "2",
                    "Col14": "Batch 1",
                    "Col15": "",
                    "Col16": "2000",
                    "Col17": "400",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId": "1",
                    "EditDelQty": false
                } 
                oDataSubItem.push(_oRow);



                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 2,
                    "Col1": "Error",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "1239589509",
                    "Col7": "Store Type 2",
                    "Col8": "Store Bin 2",
                    "Col9": "F00B.V02.859",
                    "Col10": "Screw Plug",
                    "Col11": "1000",
                    "Col12": "PC",
                    "Col13": "5",
                    "Col14": "Batch 2",
                    "Col15": "",
                    "Col16": "1600",
                    "Col17": "600",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId": "1",
                    "EditDelQty": false
                } 
                oDataSubItem.push(_oRow);

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                    "EditDelQty": true
                } 
                oDataSubItem.push(_oRow);  

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 3,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 4,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 5,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 6,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                 _oRow = new Array();
                _oRow = {
                    "HeaderIndex": 0,
                    "MainIndex": 1,
                    "ItemsIndex": 7,
                    "Col1": "Warning",
                    "Col2": "",
                    "Col3": "",
                    "Col4": "",
                    "Col5": "",
                    "Col6": "",
                    "Col7": "Store Type 3",
                    "Col8": "Store Bin 3",
                    "Col9": "F00B.V02.890",
                    "Col10": "Piston",
                    "Col11": "500",
                    "Col12": "PC",
                    "Col13": "10",
                    "Col14": "Batch A",
                    "Col15": "",
                    "Col16": "1000",
                    "Col17": "500",
                    "Col18": "",
                    "Col19": "",
                    "Col20": "",
                    "Col21": "",
                    "Col22": "",
                    "Col23": "",
                    "Col24": "",
                    "Col25": "",
                    "Action": "",
                    "IsMain": false,
                    "RootId": "",
                    "ParentId":"2",
                     "EditDelQty": true
                } 
                oDataSubItem.push(_oRow); 

                deepDynamicTable.SubHeader = oDataSubHeader;
                deepDynamicTable.SubItems = oDataSubItem;
                return deepDynamicTable;
                // create mock sample data   
            }
    };

});