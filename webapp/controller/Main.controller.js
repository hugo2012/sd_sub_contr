sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    "../custom/CusValueHelpDialog",
    "sap/m/Token",
     "../util/Formatter"
], (JSONModel, Base, CusValueHelpDialog, Token,Formatter) => {
    "use strict";
    return Base.extend("com.bosch.rb1m.sd.sdsubcontr.controller.Main", {
        onInit() {
                Base.prototype.onInit.apply(this);
                this.oInput_Vendor = this.getView().byId("idip_vendor");
                this.oInput_Vendor.setValue("");
                this.oInput_Vendor.removeAllTokens();
                this.oInput_Vendor.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "VendorID",
                        "value1": text,
                        "value2": ""
                    });

                });
                this.oPur_Order = this.getView().byId("idip_purchase_oder");
                this.oPur_Order.setValue("");
                this.oPur_Order.removeAllTokens();
                this.oPur_Order.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "PurcOrdId",
                        "value1": text,
                        "value2": ""
                    });

                }); 

                this.oStor_Type = this.getView().byId("idip_storage_type");
                this.oStor_Type.setValue("");
                this.oStor_Type.removeAllTokens();
                this.oStor_Type.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "StorTypId",
                        "value1": text,
                        "value2": ""
                    });

                }); 

                this.oStor_Bin = this.getView().byId("idip_storage_bin");
                this.oStor_Bin.setValue("");
                this.oStor_Bin.removeAllTokens();
                this.oStor_Bin.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "StorBinId",
                        "value1": text,
                        "value2": ""
                    });

                });    
            
                this.oAssemb_Prod = this.getView().byId("idip_assembly_prod");
                this.oAssemb_Prod.setValue("");
                this.oAssemb_Prod.removeAllTokens();
                this.oAssemb_Prod.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "AssePrdId",
                        "value1": text,
                        "value2": ""
                    });

                });   

                this.oComponent = this.getView().byId("idip_component");
                this.oComponent.setValue("");
                this.oComponent.removeAllTokens();
                this.oComponent.addValidator(function (args) { 
                    var text = args.text;
                    var text1 = "*" + args.text + "*";
                    return new Token({key: text, text: text1}).data("range", {
                        "include": true,
                        "operation": sap.ui.model.FilterOperator.Contains,
                        "keyField": "CompoId",
                        "value1": text,
                        "value2": ""
                    });

                });    

              this._o_IDMultiInputReqDate = this.getView().byId("iddate_req_date");
              var D = this.getView().byId("iddate_req_date");
                D.addValidator(function (e) {
                    var t = e.text;
                    var i = "=" + e.text;
                    if (Formatter.isDateValid(e.text)) {
                        let n = Formatter.fnFormatStringDateTime(e.text);
                        D.setValueState(sap.ui.core.ValueState.None);
                        return new Token({key: t, text: i}).data("range", {
                            include: true,
                            operation: sap.ui.model.FilterOperator.EQ,
                            keyField: "Date",
                            value1: n,
                            value2: ""
                        })
                    } else {
                        D.setValueState(sap.ui.core.ValueState.Error);
                        D.setValueStateText("Invalid date!")
                    }
                });
             this.fnInitializeSettingsModel();     
             
        
            let a = Formatter.fnInitDateToken();
            this._o_IDMultiInputReqDate.setTokens(a);
        },
         /* Settings Model */
        fnInitializeSettingsModel: function () {
            var oSettingsModel = new JSONModel({
                languages: [],
                FieldsSetInlineCount: [],
                valueHelpSet: []
            });
            this.setModel(oSettingsModel, "dataModel");
        },
        onHandleContinuePress(oEvent){
             var a = this.fnGetFilterVaules();         
             this.getOwnerComponent().getModel("filterCondData").setData(a);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Subconalv");
        },
        fnGetFilterVaules: function(){
            var oFilterCondData = {
                    Plant: "",
                    ShippingPoint: "",
                    Vendor: [],
                    PurOrder:[],
                    Req_Date:[],
                    WareHouse:"",
                    Stor_Type:[],
                    Stor_Bin:[],
                    Assembly_Prod:[],
                    Component:[]
                };
            oFilterCondData.Plant = this.byId("idip_plant").getValue();
            oFilterCondData.ShippingPoint = this.byId("idip_shipping_point").getValue();
            oFilterCondData.Vendor = this.fnGetFilterTokens(this.byId("idip_vendor"),"SupplyNo");
            oFilterCondData.PurOrder = this.fnGetFilterTokens(this.byId("idip_purchase_oder"),"PoNo");
            oFilterCondData.RequestDate = this.fnGetFilterDateTokens(this.byId("iddate_req_date"),"");
            oFilterCondData.WareHouse =  this.byId("idip_warehouse_number").getValue();
            oFilterCondData.Stor_Type = this.fnGetFilterTokens(this.byId("idip_storage_type"),"StorageTyp");
            oFilterCondData.Stor_Bin = this.fnGetFilterTokens(this.byId("idip_storage_bin"),"StorageBin");
            oFilterCondData.Assembly_Prod = this.fnGetFilterTokens(this.byId("idip_assembly_prod"),"AssemPrd");
            oFilterCondData.Component = this.fnGetFilterTokens(this.byId("idip_component"),"Component");
            return oFilterCondData;
        },
        fnGetFilterTokens: function (oControl,_keyField) {
            var aTokens = oControl.getTokens();
            var arrSelection = [];
            for (let i = 0; i < aTokens.length; i++) {
                let oToken = aTokens[i];
                // arrFilter = new Array();
                if (oToken.data("range")) {
                    let oRange = oToken.data("range");
                    var _oRow1 = {
                        "MainIndex": 0,
                        "SoIndex": 0,
                        "Sign": "I",
                        "Optio": "CP",
                        "Low": "*" + oRange.value1 + "*",
                        "High": ""
                    };

                } else {
                    var _oRow1 = {
                        "MainIndex": 0,
                        "SoIndex": 0,
                        "Sign": "I",
                        "Optio": "EQ",
                        "Low": oToken.getKey(),
                        "High": ""
                    };
                } 
                arrSelection.push(_oRow1);
            }
            return arrSelection;
        },
         fnGetFilterDateTokens: function (oControl,_keyField) {
            var aTokens = oControl.getTokens();
            var arrSelection = [];
                for (let i = 0; i < aTokens.length; i++) {
                    let oToken = aTokens[i];
                    // arrFilter = new Array();
                    if (oToken.data("range")) {
                        let n = oToken.data("range");
                        let e = n.value1;
                        let t = n.value2;
                        if (e && t) {
                            let i = Formatter.formatOdataDateTimeZone(e);
                            let s = Formatter.formatOdataDateTimeZone(t);
                            var _oRow1 = {
                            "MainIndex": 0,
                            "SoIndex": 0,
                            "Sign": "I",
                            "Optio": "BT",
                            "Low": "*" + i + "*",
                            "High": "*" + s + "*"
                        };
                        } else {
                                let t = Formatter.formatOdataDateTimeZone(e);
                                if (t) {
                                    var _oRow1 = {
                                    "MainIndex": 0,
                                    "SoIndex": 0,
                                    "Sign": "I",
                                    "Optio": "BT",
                                    "Low": "*" + t + "*",
                                    "High": ""
                                        };
                        }
                    

                    }
                    arrSelection.push(_oRow1);
                }
            }
            return arrSelection;
        },
         onValueHelpRequestAuto: function (oEvent) {
            let aFilter = [];
            var oID = oEvent.getParameters().id;
            let oControlname = oID.split("--")[2];
            this.oControl = this.byId(oControlname);
            let _entityName = oControlname;
            this.fnSetBusyIndicatorOnDetailControls(this.oControl, true)
            let arrayFieldsLabel = [];
            let arrayColumns = [];
            this._oSourceFieldIDF4 = oEvent.getSource();
            switch (oControlname) {
                case "idip_plant":

                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_plant")
                    data.Field2 = this.getResourceBundle().getText("lbl_description")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "Plant"
                    data.Field2 = "PlantName"
                    arrayColumns.push(data);
                    var arrFieldsSet = [];
                    var _inlineCount = 0
                    this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_plant"), true);
                    this.getService().getPlantSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_plant"), false);
                        this.onValueHelpInputPopup(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_plant"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_plant"), false);
                       
                    }.bind(this));
                    break;
                case "idip_shipping_point":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_shipping_point")
                    data.Field2 = this.getResourceBundle().getText("lbl_description")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "ShippingPoint"
                    data.Field2 = "ShippingPoint_Text"
                    arrayColumns.push(data);

                    var _inlineCount = 0;
                    var arrFieldsSet = [];
                    var data = new Array();
                    this.getService().getShippingPointSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {

                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_shipping_point"), false);
                        this.onValueHelpInputPopup(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_shipping_point"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_shipping_point"), false);
                    }.bind(this));

                    break;
                case "idip_vendor":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_SupplyNo")
                    data.Field2 = this.getResourceBundle().getText("lbl_SupplyName")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "VendorID"
                    data.Field2 = "VendorName1"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];
                    this.getService().getVendorSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_vendor"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_vendor"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_vendor"), false);
                    }.bind(this));

                    break;
                case "idip_purchase_oder":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_PurcOrdId")
                    data.Field2 = this.getResourceBundle().getText("lbl_PurchaseOrderType")
                    data.Field3 = this.getResourceBundle().getText("lbl_PurchaseOrderDate")
                    data.Field4 = this.getResourceBundle().getText("lbl_CompanyCode")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "PurcOrdId"
                    data.Field2 = "PurchaseOrderType"
                    data.Field3 = "PurchaseOrderDate"
                    data.Field4 = "CompanyCode"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getPONoSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_purchase_oder"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_purchase_oder"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_purchase_oder"), false);        
                    }.bind(this));
                    break;
                 case "idip_warehouse_number":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_warehouse_number")
                    data.Field2 = this.getResourceBundle().getText("lbl_description")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "WareHNo"
                    data.Field2 = "WareHDescr"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getWareHNoSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_warehouse_number"), false);
                        this.onValueHelpInputPopup(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_warehouse_number"), _entityName, _inlineCount);
                   
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_warehouse_number"), false);
                    }.bind(this));
                    break;   
                  case "idip_storage_type":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_storage_type")
                    data.Field2 = this.getResourceBundle().getText("lbl_description")
                    data.Field3 = this.getResourceBundle().getText("lbl_WareHNo")                                      
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    
                    data.Field1 = "StorTypId"
                    data.Field2 = "Description"
                    data.Field3 = "WareHNo"          
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getStorTypSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_type"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_storage_type"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_type"), false);
                    }.bind(this));
                    break;     
                  case "idip_storage_bin":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_storage_bin")
                    data.Field2 = this.getResourceBundle().getText("lbl_warehouse_number")
                    
                   // data.Field3 = this.getResourceBundle().getText("lbl_storage_type")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "StorBinId"
                    data.Field2 = "WareHNo"              
                   // data.Field3 = "StorTypId"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getStorBinSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_bin"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_storage_bin"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_bin"), false);
                    }.bind(this));
                    break;   
                case "idip_assembly_prod":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_assembly_prod")
                    data.Field2 = this.getResourceBundle().getText("lbl_PrdGroup")
                    data.Field3 = this.getResourceBundle().getText("lbl_description")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "AssePrdId"
                    data.Field2 = "PrdGroup"
                    data.Field3 = "Description"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getAssePrdSet(aFilter).then(function (oData) {
                        _inlineCount = oData.length;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_assembly_prod"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_assembly_prod"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_assembly_prod"), false);
                    }.bind(this));
                    break;     
                case "idip_component":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_component")
                    data.Field2 = this.getResourceBundle().getText("lbl_CompoGroup")
                    data.Field3 = this.getResourceBundle().getText("lbl_description")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "CompoId"
                    data.Field2 = "CompoGroup"
                    data.Field3 = "Description"
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getCompoSet(aFilter).then(function (oData) {
                        _inlineCount = oData.__count;
                        for (let i = 0; i < oData.length; i++) {
                            arrFieldsSet.push(oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_component"), false);
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_component"), _entityName, _inlineCount);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_component"), false);
                    }.bind(this));
                    break;              
                default:
                    // code block
            }
        },
         onValueHelpInputPopup : async function (_oLabels, _oColumns, _oData1, oControl, _title, _entityName, _inlineCount) { // debugger;
            this.fnSetBusyIndicatorOnDetailControls(oControl, true)
            var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels, _oColumns, "dataModel>");
            let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels, _oColumns, _oData1, "/valueHelpSet");
            this.getModel("dataModel").setProperty("/valueHelpSet", []);
            this.getModel("dataModel").setProperty("/valueHelpSet", arrFieldsSet);
            let arrCols = _oColumns[0];
            let dataService = this.getService();
            let _arrPrefliter = {};
            let _tblPrefliter = [];
            if (this._oSourceFieldIDF4.getValue()) {
                let _f4Value = this._oSourceFieldIDF4.getValue();
                if (_f4Value.length > 0) {
                    _arrPrefliter = {
                        path: arrCols["Field1"],
                        operator: sap.ui.model.FilterOperator.Contains,
                        values: [_f4Value]
                    };
                    _tblPrefliter.push(_arrPrefliter);
                }
            }
            this._valueHelpDialog = await CusValueHelpDialog.createValueHelp({
                title: _title,
                model: this.getModel("dataModel"),
                multiSelect: false,
                keyField: arrCols["Field1"],
                keyDescField: "",
                basePath: "dataModel>/valueHelpSet",
                preFilters: _tblPrefliter,
                columns: _ColumnFields,
                modeQuery: 2,
                oService: dataService,
                entityName: _entityName,
                labelDefinition: _oLabels,
                columnDefiniton: _oColumns,
                inlineCount: _inlineCount,
                ok: function (selectedRow) {
                    let aTokens = [];
                    for (var i = 0; i < selectedRow.length; i++) {
                        if (selectedRow[i]) {
                            var keyValue = selectedRow[i][arrCols["Field1"]];
                            this._oSourceFieldIDF4.setValue(keyValue);
                            this._oSourceFieldIDF4.fireSubmit();
                        }
                        break;
                    }
                    this._valueHelpDialog.close();
                }.bind(this),
                beforeOpen: function (oEvent) {
                    this.fnSetBusyIndicatorOnDetailControls(oControl, true)

                }.bind(this),
                afterOpen: function (oEvent) {
                    this.fnSetBusyIndicatorOnDetailControls(oControl, false)
                }.bind(this),
                afterClose: function (oEvent) {
                    this._valueHelpDialog.destroy()
                }.bind(this),
                cancel: function (oEvent) {
                    this._valueHelpDialog.close()
                }.bind(this)
            });
            this.getView().addDependent(this._valueHelpDialog);
            this.fnSetBusyIndicatorOnDetailControls(oControl, false)
            var sKeyFieldName = "Field1";
            this._valueHelpDialog.setKey(sKeyFieldName);
            this._valueHelpDialog.update();
            this._valueHelpDialog.open();
        },
         onValueHelpPopupAuto: async function (_oLabels, _oColumns, _oData1, oControl, _title, _entityName, _inlineCount) { // debugger;
            this.fnSetBusyIndicatorOnDetailControls(oControl, true)
            var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels, _oColumns);
            let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels, _oColumns, _oData1, "/valueHelpSet");
            this.getModel("dataModel").setProperty("/valueHelpSet", []);
            this.getModel("dataModel").setProperty("/valueHelpSet", arrFieldsSet);
            let arrCols = _oColumns[0];
            let dataService = this.getService();
            let _arrPrefliter = {};
            let _tblPrefliter = [];
            if (this._oSourceFieldIDF4.getValue()) {
                let _f4Value = this._oSourceFieldIDF4.getValue();
                if (_f4Value.length > 0) {
                    _arrPrefliter = {
                        path: arrCols["Field1"],
                        operator: sap.ui.model.FilterOperator.Contains,
                        values: [_f4Value]
                    };
                    _tblPrefliter.push(_arrPrefliter);
                }
            }
            this._valueHelpDialog = await CusValueHelpDialog.createValueHelp({
                title: _title,
                model: this.getModel("dataModel"),
                multiSelect: true,
                keyField: arrCols["Field1"],
                keyDescField: "",
                basePath: "dataModel>/valueHelpSet",
                preFilters: _tblPrefliter,
                columns: _ColumnFields,
                modeQuery: 2,
                oService: dataService,
                entityName: _entityName,
                labelDefinition: _oLabels,
                columnDefiniton: _oColumns,
                inlineCount: _inlineCount,
                oControlF4Id: this._oSourceFieldIDF4,
                oContext: this,
                ok: function (selectedRow) {
                    let aTokens = [];
                    for (var i = 0; i < selectedRow.length; i++) {
                        if (selectedRow[i]) {
                            var oToken1 = new Token({key: selectedRow[i][arrCols["Field1"]], text: selectedRow[i][arrCols["Field1"]]});
                            aTokens.push(oToken1);
                        }
                    }
                    this._oSourceFieldIDF4.setValue("");
                    this._oSourceFieldIDF4.setTokens(aTokens);
                    this._oSourceFieldIDF4.setValueState(sap.ui.core.ValueState.None);
                    this._oSourceFieldIDF4.fireSubmit();
                    this._valueHelpDialog.close();
                }.bind(this),
                beforeOpen: function (oEvent) {
                    this.fnSetBusyIndicatorOnDetailControls(oControl, true)
                }.bind(this),
                afterOpen: function (oEvent) {
                    this.fnSetBusyIndicatorOnDetailControls(oControl, false)
                }.bind(this),
                afterClose: function (oEvent) {
                    this._valueHelpDialog.destroy()
                }.bind(this),
                cancel: function (oEvent) {
                    this._valueHelpDialog.close()
                }.bind(this)
            });
            this.getView().addDependent(this._valueHelpDialog);
            this.fnSetBusyIndicatorOnDetailControls(oControl, false)
            let aTokens = [];
            this._valueHelpDialog.setTokens(aTokens);
            this._valueHelpDialog.setTokens(oControl.getTokens());
            this._valueHelpDialog.update();
            this._valueHelpDialog.open();
        },
         onVHReqDateRequested: async function () {
            if (!this._oInputDate_req_date) {
                this._oInputDate_req_date = await CusValueHelpDialog.createValueHelpConditionOnly({
                    title: "Request date",
                    model: this.getView().getModel(),
                    multiSelect: true,
                    keyField: "Date",
                    keyDescField: "",
                    basePath: "",
                    preFilters: [],
                    columns: [],
                    dataType: "Date",
                    _filterOperator: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT,
                    ok: function (e) {
                        let t = [];
                        for (var i = 0; i < e.length; i++) {
                            if (e[i]) {
                                e[i].setKey(e[i].getText());
                                t.push(e[i])
                            }
                        }
                        this._o_IDMultiInputReqDate.setTokens([]);
                        this._o_IDMultiInputReqDate.setTokens(t);
                        this._oInputDate_req_date.close()
                    }.bind(this),
                    beforeOpen: function (e) {
                        this.fnSetBusyIndicatorOnDetailControls(this._o_IDMultiInputReqDate, true)
                    },
                    afterClose: function (e) {
                        this._oInputDate_req_date.close()
                    }.bind(this),
                    afterOpen: function (e) {
                        this.fnSetBusyIndicatorOnDetailControls(this._o_IDMultiInputReqDate, false)
                    }.bind(this)
                });
                this.getView().addDependent(this._oInputDate_req_date)
            }
            this._oInputDate_req_date.open();
            let t = [];
            this._oInputDate_req_date.setTokens(t);
            let i = Formatter.fnInitDateToken();
            this._oInputDate_req_date.setTokens(i);
            this._oInputDate_req_date.update()
        },
    });
});