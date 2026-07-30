sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    "sap/ui/core/library",
    "../util/Formatter",
    "../custom/Input",
    "com/bosch/rb1m/sd/sd_subcontr/model/models",
    "com/bosch/rb1m/sd/sd_subcontr/util/TablePersoHelper"
], function (JSONModel, BaseController, sapUiCoreLib, Formatter, CustomInput, Models, TablePersoHelper) {
    "use strict";

    var ValueState = sapUiCoreLib.ValueState;

    return BaseController.extend("com.bosch.rb1m.sd.sd_subcontr.controller.Subconalv", {

        /* =========================================================== */
        /* Lifecycle Methods                                           */
        /* =========================================================== */

        onInit: async function () {
            BaseController.prototype.onInit.apply(this);
            this._oVM = this.getView().byId("variantManagementSubcon");
            this.oSemanticPage = this.byId("idObjectPage");
            this._oUIDynamicTable = this.byId("tblsubcon");
            this._isSizeLimit = 500;
            this._flagRenderTable = false;
            this.fnInitializeSettingsModel();
            this._oUIDynamicTable.bindRows("subconModel>/ItemsSet");
            this.getRouter().getRoute("Subconalv").attachMatched(this.onRouteMatched, this);
            this._oUIDynamicTable.attachEvent("rowsUpdated", this.onRowsUpdated, this);
            await this._initPersonalization();           
           // await this._loadVariants();
            this._getLoggedInUser(); 
        },

        onExit: function () { },

        fnInitializeSettingsModel: function () {
            var oSubconModel = new JSONModel({
                languages: [],
                RowsHeader: [],
                RowsItems: [],
                ItemsSet: [],
                editEnable: false,
                createEnable: false,
                operationMode: "",
                dynamicTableTitle: "",
                bOnCreate: false,
                bDataFound: false,
                dynamicForm: [],
                deepDynamicTable: {},
                ModeChange: "",
                oDataDeepPayload: {},
                FieldsSetInlineCount: [],
                upDateError: false,
                isChanged: false,
                bDisplayEnable: false,
                itemsChangedError: [],
                isErrDelQty: false
            });
            this.setModel(oSubconModel, "subconModel");

            var oViewModel = new JSONModel({
               // selectedKey: "Default",
                selectedKey: "",
                variants: [{ key: "Default", text: "Standard", author: "SAP" }]
            });
            this.getView().setModel(oViewModel, "view");
        },

        /* =========================================================== */
        /* Route & Data Operations                                     */
        /* =========================================================== */

        onRouteMatched: async function () {
      
            var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();
            this._startUpParemeters = this.getOwnerComponent().getModel("startupParameters").getData()["startupParameters"]["_navURL"];
            if (oFilterData.Plant === undefined) {
                this.onNavBack();
                return;
            } else {
                this.onLoadData(oFilterData);
            }
        },
        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("TargetMain", {}, true);
            }
        },

        onLoadData: function (oFilterData) {
            var oSubconModel = this.getModel("subconModel");
            oSubconModel.setProperty("/itemsChangedError", []);
            oSubconModel.setProperty("/deepDynamicTable", []);
            oSubconModel.setProperty("/ItemsSet", []);

            var oPayload = this.fnBuildDeepentity();
            oPayload.RunMode = "R";
            this.setBusy(true);

            this.getService().queryProcessDeepEntity(oPayload).then(
                function (oData) {
                    this.setBusy(false);
                    var oDeepTableData = this._fnBuildDeepDynamicTable(oData);
                    oSubconModel.setProperty("/deepDynamicTable", oDeepTableData);

                    if (oData._ItemsNav.length > 0) {
                        oSubconModel.setProperty("/bDisplayEnable", true);
                        this.fnBuildDynamicTableData(oDeepTableData);
                    } else {
                        this.fnBuildDynamicTableData(oDeepTableData);
                        oSubconModel.setProperty("/bDisplayEnable", false);
                        var sErrorMsg = this.getResourceBundle().getText("dialog.error.nodata.found");
                        this._fnHandleErrorExe(sErrorMsg);
                    }
                   //this.fnCreateMockData();
                }.bind(this),
                function (oError) {
                    this.setBusy(false);
                    this._fnHandleErrorExe(oError.error.message);
                }.bind(this)
            );
        },

        _extractError: function (oError) {
            let sMessage = "An unexpected error occurred.";
            if (oError && oError.message) {
                sMessage = oError.message;
            }
            if (oError && oError.response && oError.response.body) {
                try {
                    let oBody = JSON.parse(oError.response.body);
                    sMessage = oBody.error.message.value || oBody.error.message;
                } catch (e) {
                    sMessage = oError.response.body;
                }
            }
            return sMessage;
        },

        fnCreateMockData: function () {
            var oSubconModel = this.getModel("subconModel");
            oSubconModel.setProperty("/bDisplayEnable", true);
            var oMockData = Models.fnCreateMockData();
            oSubconModel.setProperty("/deepDynamicTable", oMockData);
            this.fnBuildDynamicTableData(oMockData);
            this.setBusy(false);
        },

        _fnBuildDeepDynamicTable: function (oData) {
            var oStructuredData = { Header: [], Items: [], SubHeader: [], SubItems: [] };

            if (oData._HeaderNav && oData._HeaderNav.length > 0) {
                oData._HeaderNav.forEach(element => {
                    if (element.IsMain === true) {
                        oStructuredData.Header.push(element);
                    } else {
                        oStructuredData.SubHeader.push(element);
                    }
                });
            }
            if (oData._ItemsNav && oData._ItemsNav.length > 0) {
                oData._ItemsNav.forEach(element => {
                    if (element.IsMain === true) {
                        oStructuredData.Items.push(element);
                    } else {
                        oStructuredData.SubItems.push(element);
                    }
                });
            }
            return oStructuredData;
        },

        /* =========================================================== */
        /* Table Dynamic Construction                                  */
        /* =========================================================== */

        fnBuildDynamicTableData: async function (oData) {
            if (oData.Header.length === 0) {
                this.getModel("subconModel").setProperty("/ItemsSet", []);
                return;
            }

            var aItems = oData.Items;
            var aHeaders = oData.Header;
            var aFilteredItems = [];

            for (var i = 0; i < aItems.length; i++) {
                if (i > this._isSizeLimit) {
                    break;
                }
                aFilteredItems.push(aItems[i]);
            }

            var oTableConfig = { headerDetails: aHeaders, rowDetails: aFilteredItems };
            var aGeneratedDataSet = this._fnGenerateDataSet(oData);
            this.getModel("subconModel").setProperty("/ItemsSet", aGeneratedDataSet);

            this._oUIDynamicTable.setRowMode(sap.ui.table.rowmodes.Type.Auto);
            this._fnBuildTable(oTableConfig);
             await this._loadVariants();
             this.initPersonalization();
       
        },

        _fnBuildTable: function (oConfig) {
            this._oUIDynamicTable.destroyColumns();
            var aHeaders = oConfig.headerDetails;

            for (var i = 0; i < aHeaders.length; i++) {
                var sBindingPath = "{subconModel>" + aHeaders[i].HeaderName + "}";
                var sRawPath = "subconModel>" + aHeaders[i].HeaderName;
                let oColumn;

                if (i === 0) {
                    oColumn = new sap.ui.table.Column({
                        width: "3rem",
                        headerMenu: "menu",
                        resizable: true,
                        label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                        template: new sap.ui.core.Icon({
                            src: { path: sRawPath, formatter: function (val) { return Formatter.statusIcon(val); } },
                            size: "1rem",
                            color: { path: sRawPath, formatter: function (val) { return Formatter.statusColor(val); } },
                            tooltip: { path: sRawPath, formatter: function (val) { return Formatter.statusText(val); } }
                        })
                    });
                    oColumn.data("p13nKey", aHeaders[i].HeaderName);
                    this._oUIDynamicTable.addColumn(oColumn);
                } else {
                    switch (aHeaders[i].HeaderName) {
                        case "IsMain":
                        case "RootId":
                        case "ParentId":
                        case "MainIndex":
                        case "HeaderIndex":
                        case "ItemsIndex":
                        case "EditDelQty":
                            oColumn = new sap.ui.table.Column({
                                width: aHeaders[i].HeaderName === "IsMain" ? "5rem" : "8rem",
                                visible: aHeaders[i].Visible,
                                headerMenu: "menu",
                                resizable: true,
                                label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                template: new sap.m.Text({ text: sBindingPath })
                            });
                            break;
                       
                        default:
                           var sWidth = "5rem";
                            if (sap.ui.Device.resize.width >= 585 && sap.ui.Device.resize.height >= 456) {
                                sWidth = "100%";
                            } else {
                                sWidth = this._getWidthByKey(aHeaders[i].HeaderName, sWidth);
                            }
                            
                            //sWidth = this._getWidthByKey(aHeaders[i].HeaderName, "7rem");
                            if (aHeaders[i].HeaderName !== "SHIP_TO") {
                                switch (aHeaders[i].HeaderName) {
                                    case "STOCK":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                    formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                         if ( isMain === true ) {
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                            this.addStyleClass("assemblyPrd");
                                                        } 
                                                        else {
                                                             this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        return Formatter.fnFormatNumeric(val, isMain, rootId);
                                                    }
                                                },
                                                press: function (oEvent) { this.onOpenMMBE(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break;
                                    case "SUPP_NO":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                    formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                        if ( isMain === true ) {
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                        this.addStyleClass("assemblyPrd");
                                                        } else {
                                                            this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        
                                                        return val;
                                                    }
                                                },
                                                press: function (oEvent) { this._fnHandleLinkSupplierPress(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break;
                                     case "ASSE_PRD" :
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                     formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                        if ( isMain === true ) {
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                            this.addStyleClass("assemblyPrd");
                                                        } 
                                                        else {
                                                             this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        return val;
                                                    }
                                                },
                                                press: function (oEvent) { this.onOpenWebGuiMM03AssPrd(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break;   
                                     case "COMPONENT":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                        if ( isMain === true ) {
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                            this.addStyleClass("assemblyPrd");
                                                        } 
                                                        else {
                                                             this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        return val;
                                                    }
                                                },
                                                press: function (oEvent) { this.onOpenWebGuiMM03Comp(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break;      
                                      case "PO_NO":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                    formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                         if (Formatter.fnFormatNumericRet(val, isMain, rootId) === true) {
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                        } else {
                                                            this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                         if ( isMain === true ) {
                                                           
                                                         this.addStyleClass("assemblyPrd");
                                                        } 
                                                        return val;
                                                    }
                                                },
                                                press: function (oEvent) { this.onOpenPurchaseOrder(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break; 
                                     case "DEMAND":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Link({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                        if ( isMain === true ) {
                                                         this.addStyleClass("assemblyPrd");
                                                            this.addStyleClass("cussapMLnkSubtle");
                                                        } else {
                                                            this.addStyleClass("myCustomLinkClass");
                                                        }
                                                        if ( isMain === true ) {
                                                         this.addStyleClass("assemblyPrd");
                                                           
                                                        }
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        return Formatter.fnFormatNumeric(val, isMain, rootId);
                                                    }
                                                },
                                                press: function (oEvent) { this.onOpenME39(oEvent); }.bind(this),
                                                subtle: false
                                            })
                                        });
                                        break;   
                                     case "BEN":
                                        oColumn = new sap.ui.table.Column({
                                            width: "3rem",
                                            headerMenu: "menu",
                                            resizable: true,
                                            visible:true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Text({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");   
                                                        if (rootId === 99) {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        if ( isMain === true ) {
                                                         this.addStyleClass("assemblyPrd");                                                          
                                                        }
                                                        return val;
                                                    }
                                                }
                                            })
                                        });
                                        break;    
                                     case "SUPP_NAME":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Text({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("assemblyPrd"); 
                                                        this.removeStyleClass("subHeader");
                                                        if ( isMain === true ) {
                                                            this.addStyleClass("assemblyPrd");                                                          
                                                        }
                                                        return val;
                                                    }
                                                }
                                            })
                                        });
                                        break;      
                                     case "SUPP_CITY":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Text({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd"); 
                                                        if ( isMain === true ) {
                                                            this.addStyleClass("assemblyPrd");                                                          
                                                        }
                                                        return val;
                                                    }
                                                }
                                            })
                                        });
                                        break;    
                                     case "SUPP_CTRY":
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Text({
                                                text: {
                                                    parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");
                                                        this.removeStyleClass("assemblyPrd");
                                                        if ( isMain === true ) {
                                                         this.addStyleClass("assemblyPrd");                                                          
                                                        }
                                                        return val;
                                                    }
                                                }
                                            })
                                        });
                                        break;                         
                                    default:
                                        oColumn = new sap.ui.table.Column({
                                            width: sWidth,
                                            headerMenu: "menu",
                                            resizable: true,
                                            label: new sap.m.Label({ text: aHeaders[i].HeaderValue, tooltip: aHeaders[i].HeaderValue }),
                                            template: new sap.m.Text({ 
                                                text: { parts: [{ path: sRawPath }, { path: "subconModel>IsMain" }, { path: "subconModel>RootId" }],
                                                   formatter: function (val, isMain, rootId) {
                                                        this.removeStyleClass("cussapMLnkSubtle");
                                                        this.removeStyleClass("myCustomLinkClass");
                                                        this.removeStyleClass("subHeader");  
                                                        this.removeStyleClass("assemblyPrd");    
                                                        if ( isMain === true ) {
                                                         this.addStyleClass("assemblyPrd");                                                          
                                                        }                                                 
                                                        if ( rootId === 99)  {
                                                            this.addStyleClass("subHeader");
                                                        }
                                                        return val
                                                    }
                                                }
                                            })
                                            
                                        });
                                }
                            } else {
                              
                                oColumn = new sap.ui.table.Column({
                                width: sWidth,
                                headerMenu: "menu",
                                resizable: true,
                                label: new sap.m.Label({ 
                                    text: aHeaders[i].HeaderValue, 
                                    tooltip: aHeaders[i].HeaderValue 
                                }),
                                template: new sap.m.VBox({
                                    items: [
                                        // 1. LINK CONTROL (Visible when IsMain === true)
                                        new sap.m.Link({
                                            text: {
                                                parts: [
                                                    { path: sRawPath }, 
                                                    { path: "subconModel>IsMain" }, 
                                                    { path: "subconModel>RootId" }
                                                ],
                                                formatter: function (val, isMain, rootId) {
                                                    this.removeStyleClass("cussapMLnkSubtle");
                                                    this.removeStyleClass("myCustomLinkClass");
                                                    this.removeStyleClass("subHeader");
                                                    this.removeStyleClass("assemblyPrd");
                                                    if (isMain === true) {
                                                        this.addStyleClass("cussapMLnkSubtle");
                                                        this.addStyleClass("assemblyPrd");
                                                    } else {
                                                        this.addStyleClass("myCustomLinkClass");
                                                    }

                                                    if (rootId === 99) {
                                                        this.addStyleClass("subHeader");
                                                    }

                                                    return val;
                                                }
                                            },
                                            visible: {
                                                 parts: [                                                         
                                                            { path: "subconModel>IsMain" }, 
                                                            { path: "subconModel>RootId" }
                                                        ],
                                                formatter: function (bIsMain,RootId) {
                                                   // debugger;
                                                    if (bIsMain === "IsMain" && RootId === 99 ) {
                                                        return false;
                                                    }
                                                    else if (bIsMain === true){
                                                        return true;
                                                    }
                                                    return false; // Inverse of IsMain
                                                }
                                            }, // Directly bind visibility to IsMain
                                             press: function (oEvent) { this.onOpenVD03(oEvent); }.bind(this),
                                        }),

                                        // 2. CUSTOM INPUT CONTROL (Visible when IsMain === false)
                                        new CustomInput({
                                            value: {
                                                parts: [
                                                            { path: sRawPath }, 
                                                            { path: "subconModel>IsMain" }, 
                                                            { path: "subconModel>RootId" }
                                                        ],
                                                        formatter: function (val, isMain, rootId) {        
                                                            // If recycled input contains string label, return string cleanly
                                                            if (isMain === "IsMain" || rootId === 99) {
                                                                return val; 
                                                            }   
                                                             if (isMain === true || rootId != 99) {
                                                                return val; 
                                                            }                                                 
                                                            return Formatter.fnFormatNumcShipTo(val, isMain, rootId);
                                                        }
                                            },
                                            visible: {
                                                parts: [                                                         
                                                            { path: "subconModel>IsMain" }, 
                                                            { path: "subconModel>RootId" }
                                                        ],
                                                formatter: function (bIsMain,RootId) {
                                                   // debugger;
                                                     if (bIsMain === "IsMain" || RootId === 99 ) {
                                                        return true;
                                                    }
                                                    else if( bIsMain === false ){
                                                         return true;
                                                    }
                                                    else{
                                                        return false; // Inverse of IsMain
                                                    }
                                                    
                                                }
                                            },
                                            type: {
                                                parts: [
                                                    { path: sRawPath }, 
                                                    { path: "subconModel>IsMain" }, 
                                                    { path: "subconModel>RootId" }, 
                                                    { path: "subconModel>EditDelQty" }
                                                ],
                                                formatter: function (val, isMain, rootId, bEditDel) {
                                                    this.removeStyleClass("noneEdit");
                                                    this.removeStyleClass("cussapMLnkSubtle");
                                                    this.removeStyleClass("myCustomLinkClass");
                                                    this.removeStyleClass("subHeader");
                                                    this.removeStyleClass("assemblyPrd");
                                                     if (bEditDel === false && isMain === false && rootId !== 99) {
                                                        
                                                        return sap.m.InputType.Text;
                                                    }
                                                     if (isMain === true) {
                                                        this.addStyleClass("assemblyPrd");
                                                          return sap.m.InputType.Text;
                                                    } 
                                                    if (rootId === 99) {
                                                        this.addStyleClass("subHeader");
                                                        return sap.m.InputType.Text;
                                                    }
                                                    if (isMain === false && rootId !== 99) {
                                                       // this.addStyleClass("assemblyPrd");
                                                          return sap.m.InputType.Text;
                                                    } 
                                                return  sap.m.InputType.Text;
                                                    
                                                }
                                            },
                                            editable: {
                                                 parts: [{ path: "subconModel>EditDelQty" }, { path: "subconModel>RootId" }],
                                                formatter: function (bEditDel, rootId) {
                                                    if (rootId === 99) { return false; }
                                                    return !!bEditDel;
                                                }
                                            },
                                            liveChange: function (oEvent) {
                                                debugger;
                                                this._fnValidateNumber(oEvent);
                                                if( oEvent.getSource().getValueState() != sap.ui.core.ValueState.Error){
                                                     this._fnCheckQty(oEvent);
                                                }
                                               
                                            }.bind(this),
                                            submit: function (oEvent) { 
                                                this._fnValidateNumber(oEvent);
                                                 if( oEvent.getSource().getValueState() != sap.ui.core.ValueState.Error){
                                                     this._fnCheckQty(oEvent);
                                                }
                                            }.bind(this),
                                            maxLength: 20,
                                            inputColorMode: { normal: "#f7f7f7", edit: "#ffffff", fixed: "#e8eff6", assembly: "#F9EFDB", noneEdit: "#a9b4be" }
                                        })
                                    ]
                                })
                            });
                            //break;
                            }
                    }
                    oColumn.data("p13nKey", aHeaders[i].HeaderName);
                    this._oUIDynamicTable.addColumn(oColumn);
                }
            }
            this._oUIDynamicTable.setFixedColumnCount(1);
        },
        // Clean function helper to reset recycled control state
         fnResetControlStyles: function (oControl) {
            oControl.removeStyleClass("noneEdit");
            oControl.removeStyleClass("cussapMLnkSubtle");
            oControl.removeStyleClass("myCustomLinkClass");
            oControl.removeStyleClass("subHeader");
            oControl.removeStyleClass("assemblyPrd");
        },
        _getWidthByKey: function (sKey, sDefaultWidth) {
            const oColumnConfig = this._aColumnConfig.find(item => item.key === sKey);
            return oColumnConfig ? oColumnConfig.width : sDefaultWidth;
        },

        /* =========================================================== */
        /* Table Personalization / Variant Methods                     */
        /* =========================================================== */

        initPersonalization: function () {
            this._aColumnConfig = [
                { key: "TRAFF_LGT", label: "Traffic Light", visible: true, order: 1, width: "3rem", selected: true },
                { key: "SUPP_NO", label: "Supplier Number", visible: true, order: 2, width: "5rem", selected: true },
                { key: "SUPP_NAME", label: "Supplier Name", visible: true, order: 3, width: "5rem", selected: true },
                { key: "SUPP_CITY", label: "Supplier City", visible: true, order: 4, width: "5rem", selected: true },
                { key: "SUPP_CTRY", label: "Supplier Country", visible: true, order: 5, width: "4rem", selected: true },
                { key: "PO_NO", label: "Purchase Document", visible: true, order: 6, width: "5rem", selected: true },
                { key: "ASSE_PRD", label: "Assembly Product", visible: true, order: 7, width: "8rem", selected: true },
                { key: "PRD_DESCR", label: "Product Description", visible: true, order: 8, width: "8rem", selected: true },
                { key: "COMPONENT", label: "Component", visible: true, order: 9, width: "8rem", selected: true },
                { key: "COMP_DESCR", label: "Component Description", visible: true, order: 10, width: "8rem", selected: true },
                { key: "STOCK", label: "Stock", visible: true, order: 11, width: "5rem", selected: true },
                { key: "UOM", label: "Unit Of Measure", visible: true, order: 12, width: "4rem", selected: true },
                { key: "SUM_HU", label: "Sum. HU", visible: true, order: 13, width: "5rem", selected: true },
                { key: "STOCK_SUPP", label: "Stock At Supplier", visible: true, order: 14, width: "5rem", selected: true },
                { key: "BEN", label: ".", visible: true, order: 14, width: "3rem", selected: true },
                { key: "DEMAND", label: "Demand", visible: true, order: 15, width: "5rem", selected: true },
                { key: "SHIP_TO", label: "Ship To Party", visible: true, order: 16, width: "7rem", selected: true }
            ];
            //var oMainService = this.getOwnerComponent().getModel("mainService");
            var oTable = this._oUIDynamicTable;
            var self = this;

            // --- CREATE A UNIFIED PERSONALIZATION PROVIDER ---
            var oUnifiedProvider = {
                // 1. The Dialog calls this to read the current layout structure
                getPersData: function () {
                    var oDeferred = new jQuery.Deferred();
                    const oViewModel = self.getView().getModel("view");
                    const aVariants = oViewModel.getProperty("/variants") || [];
                    const sSelectedKey = oViewModel.getProperty("/selectedKey");

                    // Find active variant profile
                    var oActiveVariant = aVariants.find(function (v) { return v.key === sSelectedKey; });

                    if (oActiveVariant && oActiveVariant.state && oActiveVariant.state.Columns) {
                        // Return columns data formatted natively for the dialog structure
                        oDeferred.resolve({
                            aColumns: oActiveVariant.state.Columns
                        });
                    } else {
                        // Fallback to default setup if no custom variant is selected
                        oDeferred.resolve({
                            aColumns: self._aColumnConfig.map(function (c) {
                                return { id: c.key, order: c.order, visible: c.visible };
                            })
                        });
                    }
                    return oDeferred.promise();
                },

                // 2. This prevents the internal dialog from saving independently into standard UI5 local storage
                setPersData: function (oBundleData) {
                    var oDeferred = new jQuery.Deferred();

                    // Flag the main control as modified so the user can save it on the main UI screen
                    if (self._oVM) {
                        self._oVM.setModified(true);
                    }

                    oDeferred.resolve();
                    return oDeferred.promise();
                }
            };

            // --- INITIALIZE PERSO HELPER WITH THE UNIFIED PROVIDER ---
            // Pass our inline provider object directly instead of a standalone service string
            const oViewModel = self.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants") || [];
            const sSelectedKey = oViewModel.getProperty("/selectedKey");
            const oSelected = aVariants.find(item => item.key === sSelectedKey);
            this._oSubconPersoHelper = new TablePersoHelper(oTable, this._aColumnConfig, oSelected, sSelectedKey);

            // Attach the confirm handler to process runtime filters/sorting logic
            if (this._oSubconPersoHelper.getController) {
                this._oSubconPersoHelper.getController().attachConfirm(this.onPersoDialogApplied, this);
            }
        },
        onPersoDialogApplied: function () {
            if (this._oVM) {
                this._oVM.setModified(true);
            }

            // Extract values applied from dialog explicitly if parameters are offered
            var aFilters = oEvent.getParameter("filters") || [];
            var aSorters = oEvent.getParameter("sorters") || [];

            if (aFilters.length > 0 || aSorters.length > 0) {
                this.onTablePersoApplyRules(aFilters, aSorters);
            }
        },
        openPersoDialog: function () {
            if (this._oSubconPersoHelper) {
                this._oSubconPersoHelper.openDialog("column");
            }
        },

        _getKey: function (oControl) {
            return oControl.data("p13nKey");
        },

        handleStateChange: function (oEvent) {
            const oTable = oEvent.getParameter("control");
            const oState = oEvent.getParameter("state");
            if (!oState) { return; }

            oTable.getColumns().forEach(function (oCol) {
                oCol.setVisible(false);
            });

            oState.Columns.forEach(function (oStateCol, iIndex) {
                const oTargetColumn = oTable.getColumns().find(oCol => oCol.data("p13nKey") === oStateCol.key);
                var aHiddenKeys = ["IsMain", "RootId", "ParentId", "MainIndex", "HeaderIndex", "ItemsIndex", "EditDelQty"];

                if (aHiddenKeys.includes(oStateCol.key)) {
                    oTargetColumn.setVisible(false);
                } else {
                    oTargetColumn.setVisible(true);
                }
                oTable.removeColumn(oTargetColumn);
                oTable.insertColumn(oTargetColumn, iIndex);
            });
        },

        /* =========================================================== */
        /* UI and Formatting Logic                                     */
        /* =========================================================== */
        onRowsUpdated: function (oEvent) {
            const oTable = oEvent.getSource();
            const aRows = oTable.getRows();
            var aItemsSet = this.getModel("subconModel").getProperty("/ItemsSet");
            let oBinding = oTable.getBinding("rows");

            if (aItemsSet.length < 1) { return; }
            var iMaxRows = aRows.length;
            if (aItemsSet.length < iMaxRows) {
                iMaxRows = aItemsSet.length;
            }

            for (var i = 0; i < iMaxRows; i++) {
                var oRow = aRows[i];
                var oContext = oRow.getRowBindingContext();
                if (!oContext) { continue; }

                // Use oContext.getObject() directly to avoid context index shifting during scrolling
                var oRowObject = oContext.getObject(); 
                if (!oRowObject) { continue; }

                var oDomRow = oRow.$();

                // oDomRow.removeClass("assemblyPrd");
                var sSelector = "#" + oTable.getId() + "-rowsel" + i;

                oTable.getColumns().forEach(function (oCol) {
                    let sKey = oCol.data("p13nKey");
                    let oCell = oRow.getCells()[oTable.indexOfColumn(oCol)];
                    if (oCell) {
                        // --- FIX FOR SCROLLING / DISAPPEARING SUBHEADER LABELS ---
                        // Force input controls on SubHeader rows to be sap.m.InputType.Text
                        // so recycled controls never strip non-numeric labels ("Delivery Q.ty")
                        if (oRowObject["RootId"] === 99 || oRowObject["IsMain"] === "IsMain") {
                            if (oCell.getItems) { // Container like VBox
                                oCell.getItems().forEach(function (oChild) {
                                    if (oChild.setType && typeof oChild.setType === "function") {
                                        oChild.setType(sap.m.InputType.Text);
                                    }
                                });
                            } else if (oCell.setType && typeof oCell.setType === "function") {
                                oCell.setType(sap.m.InputType.Text);
                            }
                        }
                    }
                });  

                if (oRowObject["IsMain"] === true) {
                    $(sSelector).removeClass("hideCheckbox");
                } 
                else {
                    $(sSelector).addClass("hideCheckbox");
                }
            }
        },
    _fnHandleLinkPress: function (oEvent) {
            if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                let oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
                var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();

                let sShippingPoint = oFilterData.ShippingPoint;
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    let sBaseUrl = "#OutboundDelivery-createForSOSchedInWebGUI?sap-ui-tech-hint=GUI&";
                    let sParam1 = "ST_VSTEL-LOW=" + sShippingPoint;
                    let sParam2 = "ST_MATNR-LOW=" + oRowData["COMPONENT"];
                    let sRedirectUrl = this._startUpParemeters+ sBaseUrl + sParam1 + ";" + sParam2;
                    sap.m.URLHelper.redirect(sRedirectUrl, true);
                }
            }
        },

        _fnHandleLinkSupplierPress: function (oEvent) {
            if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                let oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();

                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    let sBaseUrl = "#Supplier-manage?sap-ui-tech-hint=GUI&";
                    let sParam = "BusinessPartner=" + oRowData["SUPP_NO"];
                    let sRedirectUrl = this._startUpParemeters + sBaseUrl + sParam;
                    sap.m.URLHelper.redirect(sRedirectUrl, true);
                }
            }
        },
         _fnValidateNumber:function(oEvent)
        {
            var sValue = oEvent.getParameter("value");
            var numberRegex = /^\d+$/;
            var t = sValue;
            var oContext = oEvent.getSource().getBindingContext("subconModel");
            var iIndex = oContext.sPath.split("/")[2];
            var oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
            var oErrInfo = {};
            // Validate numbers
            var a = numberRegex.test(t);
            if(a === true)
            {
                oEvent.getSource().setValue(t);
                oEvent.getSource().setValueState(ValueState.None);
                this.getModel("subconModel").setProperty(oContext.sPath + "/SHIP_TO", sValue);

                var aErrors = this.getModel("subconModel").getProperty("/itemsChangedError");
                oErrInfo.index = iIndex;
                oErrInfo.isErrDelQty = false;
                oErrInfo.message = "";
                let bExists = false;
                aErrors.forEach((err, i) => {
                    if (err.index === oErrInfo.index) {
                        bExists = true;
                        aErrors[i] = oErrInfo;
                    }
                });

                if (!bExists) { aErrors.push(oErrInfo); }
                this.getModel("subconModel").setProperty("/itemsChangedError", aErrors);
                
            }
            else{
                    // oEvent.getSource().setValue("")  ;
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    oEvent.getSource().setValueStateText("Invalid number!");
                    var aErrors = this.getModel("subconModel").getProperty("/itemsChangedError");
                    oErrInfo.index = iIndex;
                    oErrInfo.isErrDelQty = true;
                    oErrInfo.message = "Invalid number!";
                    let bExists = false;
                    aErrors.forEach((err, i) => {
                        if (err.index === oErrInfo.index) {
                            bExists = true;
                            aErrors[i] = oErrInfo;
                        }
                    });
                    if (!bExists) { aErrors.push(oErrInfo); }
                    this.getModel("subconModel").setProperty("/itemsChangedError", aErrors);
                }             
         } , 
        _fnCheckQty: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            if (sValue && sValue.length > 0) {
                let oContext = oEvent.getSource().getBindingContext("subconModel");
                //let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                let oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();

                let fInputQty = parseFloat(sValue);
                let fStock = parseFloat(oRowData["STOCK"]);
                let fMaxAllowed = fStock + 0;
                let oErrInfo = {};

                if (fInputQty > fMaxAllowed) {
                    oEvent.getSource().setValueState(ValueState.Error);
                    let sDescr = oRowData["COMP_DESCR"];
                    let sStockSupp = oRowData["STOCK_SUPP"];
                    let sValMsg = this.getModel("i18n").getProperty("dialog.error.validation.itemDelQty");

                    sValMsg = sValMsg.replace(/&1/g, sDescr).replace(/&2/g, sStockSupp).replace(/&3/g, fMaxAllowed);
                    oEvent.getSource().setValueStateText(sValMsg);

                    var aErrors = this.getModel("subconModel").getProperty("/itemsChangedError");
                    oErrInfo.index = iIndex;
                    oErrInfo.isErrDelQty = true;
                    oErrInfo.message = sValMsg;

                    let bExists = false;
                    aErrors.forEach((err, i) => {
                        if (err.index === oErrInfo.index) {
                            bExists = true;
                            aErrors[i] = oErrInfo;
                        }
                    });

                    if (!bExists) { aErrors.push(oErrInfo); }
                    this.getModel("subconModel").setProperty("/itemsChangedError", aErrors);
                } else {
                    oEvent.getSource().setValueState(ValueState.None);
                    this.getModel("subconModel").setProperty(oContext.sPath + "/SHIP_TO", sValue);

                    var aErrors = this.getModel("subconModel").getProperty("/itemsChangedError");
                    oErrInfo.index = iIndex;
                    oErrInfo.isErrDelQty = false;
                    oErrInfo.message = "";
                    let bExists = false;
                    aErrors.forEach((err, i) => {
                        if (err.index === oErrInfo.index) {
                            bExists = true;
                            aErrors[i] = oErrInfo;
                        }
                    });

                    if (!bExists) { aErrors.push(oErrInfo); }
                    this.getModel("subconModel").setProperty("/itemsChangedError", aErrors);
                }
            }
        },

        /* =========================================================== */
        /* Dataset Manipulations & Delivery Creation                   */
        /* =========================================================== */

        _fnGenerateDataSet: function (oData) {
            var aItems = oData.Items;
            var aHeaders = oData.Header;
            var aSubHeaders = oData.SubHeader;
            var aSubItems = oData.SubItems;
            var aTruncatedSubItems = [];
            var aTruncatedItems = [];

            for (let i = 0; i < aSubItems.length; i++) {
                if (i > this._isSizeLimit) { break; }
                aTruncatedSubItems.push(aSubItems[i]);
            }
            for (let i = 0; i < aItems.length; i++) {
                if (i > this._isSizeLimit) { break; }
                aTruncatedItems.push(aItems[i]);
            }

            return this.fnReGenerateOdataSet(aHeaders, aTruncatedItems, aSubHeaders, aTruncatedSubItems);
        },

        fnReGenerateOdataSet: function (aHeaders, aItems, aSubHeaders, aSubItems) {
            let aResult = [];
            var aIndexMap = [];

            for (let i = 0; i < aItems.length; i++) {
                let iCounter = 0;
                var oMainRow = [];
                var oMockHeaderRow = [];

                aHeaders.forEach(header => {
                    iCounter++;
                    let sPropName = header.HeaderName;
                    let sColKey = "Col" + header.HeaderIndex;
                    oMainRow[sPropName] = aItems[i][sColKey].trimStart();

                    if (iCounter === 1) {
                        oMockHeaderRow[sPropName] = aSubHeaders[0].HeaderValue;
                        aIndexMap[sColKey] = sPropName;
                    } else if (iCounter >= 6 && iCounter < 18) {
                        oMockHeaderRow[sPropName] = aSubHeaders[iCounter - 5].HeaderValue;
                        aIndexMap[sColKey] = sPropName;
                    } else if (iCounter >= 18) {
                        switch (iCounter) {
                            case 18: sPropName = "IsMain"; oMainRow[sPropName] = aItems[i][sPropName]; oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                            case 19: sPropName = "RootId"; oMainRow[sPropName] = aItems[i][sPropName].trimStart(); oMockHeaderRow[sPropName] = 99; aIndexMap[sColKey] = sPropName; break;
                            case 20: sPropName = "ParentId"; oMainRow[sPropName] = aItems[i][sPropName].trimStart(); oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                            case 21: sPropName = "MainIndex"; oMainRow[sPropName] = aItems[i][sPropName]; oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                            case 22: sPropName = "HeaderIndex"; oMainRow[sPropName] = aItems[i][sPropName]; oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                            case 23: sPropName = "ItemsIndex"; oMainRow[sPropName] = aItems[i][sPropName]; oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                            case 24: sPropName = "EditDelQty"; oMainRow[sPropName] = aItems[i][sPropName]; oMockHeaderRow[sPropName] = sPropName; aIndexMap[sColKey] = sPropName; break;
                        }
                    }
                });

                aResult.push(oMainRow);
                aResult.push(oMockHeaderRow);

                for (let j = 0; j < aSubItems.length; j++) {
                    var oSubRow = [];
                    let bMatchesParent = false;

                    aSubHeaders.forEach(subHeader => {
                        let sColPos = "Col" + subHeader.MainPosition;
                        if (oMainRow["RootId"] === aSubItems[j]["ParentId"]) {
                            oSubRow[aIndexMap[sColPos]] = aSubItems[j][sColPos].trimStart();
                            let sFlag = "";
                            switch (subHeader.MainPosition) {
                                case 18: sFlag = "IsMain"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag]; break;
                                case 19: sFlag = "RootId"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag].trimStart(); break;
                                case 20: sFlag = "ParentId"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag].trimStart(); break;
                                case 21: sFlag = "MainIndex"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag]; break;
                                case 22: sFlag = "HeaderIndex"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag]; break;
                                case 23: sFlag = "ItemsIndex"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag]; break;
                                case 24: sFlag = "EditDelQty"; oSubRow[aIndexMap[sColPos]] = aSubItems[j][sFlag]; break;
                            }
                            bMatchesParent = true;
                        }
                    });
                    if (bMatchesParent === true) {
                        aResult.push(oSubRow);
                    }
                }
            }
            return aResult;
        },

        onRowSelectionChange: function (oEvent) {
            var oSubconModel = this.getModel("subconModel");
            if (oEvent.getSource().getSelectedIndices().length >= 1) {
                oSubconModel.setProperty("/createEnable", true);
                oSubconModel.setProperty("/bDisplayEnable", true);
            } else {
                oSubconModel.setProperty("/createEnable", false);
                oSubconModel.setProperty("/bDisplayEnable", false);
            }
        },

        onCrtDlvr: function () {
            var oPayload = this.fnBuildDeepentity();
            var aSelectedIndices = this._oUIDynamicTable.getSelectedIndices();
            var aItemsSet = this.getModel("subconModel").getProperty("/ItemsSet");
            var aErrors = this.getModel("subconModel").getProperty("/itemsChangedError");

            let bHasErrors = false;
            let sErrorMsg = "";
            let aErrorList = [];

            if (aErrors.length > 0) {
                for (let i = 0; i < aErrors.length; i++) {
                    if (aErrors[i]["isErrDelQty"] === true) {
                        bHasErrors = true;
                        sErrorMsg = this.getResourceBundle().getText("dialog.error.validation.itemDelQty");
                        let sCompDescr = aItemsSet[aErrors[i]["index"]]["COMP_DESCR"];
                        let sStockSupp = aItemsSet[aErrors[i]["index"]]["STOCK_SUPP"];
                        let fStock = parseFloat(aItemsSet[aErrors[i]["index"]]["STOCK"]);
                        let fTotal = fStock + 0;

                        sErrorMsg = sErrorMsg.replace(/&1/g, sCompDescr).replace(/&2/g, sStockSupp).replace(/&3/g, fTotal);
                        if(aErrors[i]["message"] != sErrorMsg){
                            aErrorList.push(aErrors[i]["message"]);
                        }
                        else{
                              aErrorList.push(sErrorMsg);
                        }
                      
                    }
                }
                if (bHasErrors === true) {
                    sErrorMsg = this.getResourceBundle().getText("dialog.error.validation.input.itemDelQty");
                    this.showMultileLineWarningMessageBox(sErrorMsg, aErrorList, "E");
                    return;
                }
            }

            var oDeepTable = this.getModel("subconModel").getProperty("/deepDynamicTable");
            let iCount = 0;

            for (let i = 0; i < aSelectedIndices.length; i++) {
                var oRowNav = {};
                var oSelectedRow = aItemsSet[aSelectedIndices[i]];

                if (oSelectedRow.IsMain === true) {
                    oDeepTable.Header.forEach(header => {
                        iCount++;
                        var sColKey = "Col" + header.HeaderIndex;
                        if (parseInt(header.HeaderIndex) >= 18) {
                            oRowNav[header.HeaderName] = aItemsSet[aSelectedIndices[i]][header.HeaderName];
                        } else {
                            oRowNav[sColKey] = aItemsSet[aSelectedIndices[i]][header.HeaderName];
                        }
                    });
                    oPayload._ItemsNav.push(oRowNav);
                }

                aItemsSet.forEach(item => {
                    let oSubRowNav = {};
                    let bValidItem = false;
                    if (item.ParentId === oSelectedRow.RootId && item.IsMain === false && oSelectedRow.IsMain === true && oSelectedRow.RootId !== 99) {
                        oDeepTable.Header.forEach(header => {
                            iCount++;
                            var sColKey = "Col" + header.HeaderIndex;
                            if (parseInt(header.HeaderIndex) >= 18) {
                                oSubRowNav[header.HeaderName] = item[header.HeaderName];
                            } else {
                                if (header.HeaderName === "SHIP_TO") {
                                    if (parseFloat(item[header.HeaderName]) >= 1 && item["EditDelQty"] === true && item["PO_NO"] === "") {
                                        bValidItem = true;
                                    }
                                }
                                oSubRowNav[sColKey] = item[header.HeaderName];
                            }
                        });
                        if (bValidItem === true) {
                            oPayload._ItemsNav.push(oSubRowNav);
                        }
                    }
                });
            }

            if (oPayload._ItemsNav.length < 2) {
                oPayload._ItemsNav = [];
                sErrorMsg = this.getResourceBundle().getText("dialog.error.validation.input.itemDelQty");
                this._fnHandleErrorExe(sErrorMsg);
                return;
            }

            oPayload._HeaderNav = oDeepTable.Header;
            oPayload.RunMode = "C";

            if (oPayload._ItemsNav.length > 0) {
                this.setBusy(true);
                this.getService().postProcessCreateDeepEntity(oPayload).then(
                    function (oResponse) {
                        this.setBusy(false);
                        let aMessages = oResponse._Message;
                        let sMsgType = aMessages[0].MsgType;
                        let sFinalMsg = "";

                        if (sMsgType === "S") {
                            sFinalMsg = this.getResourceBundle().getText("dialog.success.create.delivery.complete");
                        } else {
                            sFinalMsg = this.getResourceBundle().getText("dialog.error.create.delivery.complete");
                        }
                        this.showMultileLineSuccessMessageBox(sFinalMsg, aMessages, sMsgType);

                        let oUpdatedDeepTable = this._fnBuildDeepDynamicTable(oResponse);
                        if (oUpdatedDeepTable.Items.length > 0 && sMsgType === "S") {
                            var aNewDataSet = this._fnGenerateDataSet(oUpdatedDeepTable);

                            for (let i = 0; i < aNewDataSet.length; i++) {
                                var oNewItem = aNewDataSet[i];
                                for (let j = 0; j < aItemsSet.length; j++) {
                                    if (oNewItem["IsMain"] === true && oNewItem["RootId"] === aItemsSet[j]["RootId"]) {
                                        aItemsSet[j]["TRAFF_LGT"] = oNewItem["TRAFF_LGT"];
                                        aItemsSet[j]["STOCK"] = oNewItem["STOCK"];
                                        aItemsSet[j]["SUM_HU"] = oNewItem["SUM_HU"];
                                        aItemsSet[j]["STOCK_SUPP"] = oNewItem["STOCK_SUPP"];
                                        aItemsSet[j]["DEMAND"] = oNewItem["DEMAND"];
                                        aItemsSet[j]["SHIP_TO"] = oNewItem["SHIP_TO"];
                                        break;
                                    }
                                }

                                aItemsSet.forEach((item, index) => {
                                    if (item.ParentId === oNewItem.ParentId && oNewItem.RootId !== 99 && oNewItem["IsMain"] === false &&
                                        item.MainIndex === oNewItem.MainIndex && item.HeaderIndex === oNewItem.HeaderIndex &&
                                        item.ItemsIndex === oNewItem.ItemsIndex && item["IsMain"] === false) {

                                        aItemsSet[index]["TRAFF_LGT"] = oNewItem["TRAFF_LGT"];
                                        aItemsSet[index]["STOCK"] = oNewItem["STOCK"];
                                        aItemsSet[index]["SUM_HU"] = oNewItem["SUM_HU"];
                                        aItemsSet[index]["STOCK_SUPP"] = oNewItem["STOCK_SUPP"];
                                        aItemsSet[index]["DEMAND"] = oNewItem["DEMAND"];
                                        aItemsSet[index]["SHIP_TO"] = oNewItem["SHIP_TO"];
                                        aItemsSet[index]["PO_NO"] = oNewItem["PO_NO"];
                                        aItemsSet[index]["EditDelQty"] = oNewItem["EditDelQty"];
                                    }
                                });
                            }
                            this.getModel("subconModel").setProperty("/ItemsSet", aItemsSet);
                            this._oUIDynamicTable.getModel("subconModel").refresh(true);
                        }
                    }.bind(this),
                    function (oError) {
                        this.setBusy(false);
                        this._fnHandleErrorExe(oError.error.message);
                    }.bind(this)
                );
            } else {
                this._fnHandleErrorExe(this.getResourceBundle().getText("dialog.infor.nodata.selected"));
            }
        },

        fnBuildDeepentity: function () {
            var oEntity = {
                MainId: 1, Title: "", RunMode: "C", Plant: "", ShipPoint: "", WareHouNo: "", Skip: 0, Top: 0,
                _HeaderNav: [], _ItemsNav: [], _VendorNav: [], _PurOrdNav: [], _ReqDatNav: [], _StorTyNav: [],
                _StorBiNav: [], _AssePrNav: [], _CompoNav: [], _Message: [], prefillDelQty: "", componentstock: ""
            };
            var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();

            oEntity.Plant = oFilterData.Plant;
            oEntity.ShipPoint = oFilterData.ShippingPoint;
            oEntity._VendorNav = oFilterData.Vendor;
            oEntity._PurOrdNav = oFilterData.PurOrder;
            oEntity._ReqDatNav = oFilterData.RequestDate;
            oEntity.WareHouNo = oFilterData.WareHouse;
            oEntity._StorTyNav = oFilterData.Stor_Type;
            oEntity._StorBiNav = oFilterData.Stor_Bin;
            oEntity._AssePrNav = oFilterData.Assembly_Prod;
            oEntity._CompoNav = oFilterData.Component;
            oEntity.Top = this._isSizeLimit;
            oEntity.prefillDelQty = oFilterData.prefillDelQty;
            oEntity.componentstock = oFilterData.componentstock;

            return oEntity;
        },

        /* =========================================================== */
        /* External Navigations                                        */
        /* =========================================================== */

        onStockOvr: function () {
            var aSelectedIndices = this._oUIDynamicTable.getSelectedIndices();
            let aContexts = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts();
            var iFirstSelection = aSelectedIndices[0];

            var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();
            let sPlant = oFilterData.Plant;
            let oRowObj = aContexts[iFirstSelection].getObject();

            let sTarget = "#Material-displayStockOverviewInWebGUI?sap-ui-tech-hint=GUI&";
            let sMatParam = "Material=" + oRowObj["COMPONENT"];
            let sPlantParam = "Plant=" + sPlant;
            let sSuffix = ";DYNP_OKCODE=ONLI";
            let sFinalUrl = this._startUpParemeters + sTarget + sMatParam + ";" + sPlantParam + sSuffix;

            sap.m.URLHelper.redirect(sFinalUrl, true);
        },

        onStockOrRqmts: function () {
            var aSelectedIndices = this._oUIDynamicTable.getSelectedIndices();
            let aContexts = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts();
            var iFirstSelection = aSelectedIndices[0];

            var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();
            let sPlant = oFilterData.Plant;
            let oRowObj = aContexts[iFirstSelection].getObject();

            let sTarget = "#MRPMaterial-monitorSupplyAndDemand?sap-ui-tech-hint=GUI&";
            let sMatParam = "Material=" + oRowObj["COMPONENT"];
            let sPlantParam = "MRPPlant=" + sPlant;
            let sAreaParam = "MRPArea=" + sPlant;
            let sFinalUrl = this._startUpParemeters + sTarget + sMatParam + ";" + sPlantParam + ";" + sAreaParam;

            sap.m.URLHelper.redirect(sFinalUrl, true);
        },
        onOpenWebGuiMM03AssPrd: function (oEvent) {
             var sMaterial = "";
            if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                let oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
               // var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    sMaterial = oRowData["ASSE_PRD"] || "";
                }
            }
            // Standardize material number padding if necessary (e.g., leading zeros for numeric materials)
            const sHost = window.location.origin; // Or retrieve your system base URL
            const sClient = "011"; // Replace with target client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Construct URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*MM03%20RMMG1-MATNR=${encodeURIComponent(sMaterial)};DYNP_OKCODE=ENTR` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        onOpenWebGuiMM03Comp: function (oEvent) {
             var sMaterial = "";
            if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                let oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
               // var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    sMaterial = oRowData["COMPONENT"] || "";
                }
            }
            // Standardize material number padding if necessary (e.g., leading zeros for numeric materials)
            const sHost = window.location.origin; // Or retrieve your system base URL
            const sClient = "011"; // Replace with target client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Construct URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*MM03%20RMMG1-MATNR=${encodeURIComponent(sMaterial)};DYNP_OKCODE=ENTR` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        onOpenPurchaseOrder: function (oEvent) {
            var sPurchaseOrder = "";
            var oRowData = [];
            if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    sPurchaseOrder = oRowData["PO_NO"] || "";
                      if (!sPurchaseOrder) {
                            sap.m.MessageToast.show("No Purchase Order number available.");
                            return;
                        }
                        const sDocType = Formatter.getDocTypeByNumber(sPurchaseOrder,oRowData["IsMain"]);
                        //ME33L when it is a MM-SA, ME23N- when it is a purchase order
                        if (sDocType === "PO") {
                            this.onOpenME23N(sPurchaseOrder);
                        } else if (sDocType === "SA") {
                            this.onOpenME33L(sPurchaseOrder);
                        }
                        else if (sDocType === "DO") {
                            this.onOpenVL03N(sPurchaseOrder);
                        }
                }
            }       
        },
         /**
         * Opens SAP WebGUI for VL03N prefilled with Outbound Delivery details
         * @param {string|number} sDeliveryNum Outbound Delivery Number (VBELN)
         */
        onOpenVL03N: function (sDeliveryNum) {
            if (!sDeliveryNum) {
                sap.m.MessageToast.show("No Delivery Document number provided.");
                return;
            }

            const sHost = window.location.origin; // Gets active server base URL
            const sClient = "011"; // Replace with target SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Pad leading zeros for standard 10-digit Delivery numbers
            const sFormattedDelivery = String(sDeliveryNum).trim().padStart(10, "0");

            // Construct full WebGUI URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*VL03N%20LIKP-VBELN=${encodeURIComponent(sFormattedDelivery)};DYNP_NO1ST=1` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        onOpenME33L: function (sAgreementNum) {
            
            if (!sAgreementNum) {
                sap.m.MessageToast.show("No Purchasing Document number available.");
                return;
            }

            const sHost = window.location.origin; // Dynamically gets base server URL
            const sClient = "011"; // Replace with your target SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Pad leading zeros if it's a 10-digit standard document number
            const sFormattedDoc = sAgreementNum.padStart(10, "0");

            // Construct WebGUI URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*ME33L%20RM06E-EVRTN=${encodeURIComponent(sFormattedDoc)};DYNP_OKCODE=%2f00` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        onOpenME23N: function (sPoNumber) {
            if (!sPoNumber) {
                sap.m.MessageToast.show("No Purchase Order number available.");
                return;
            }

            const sHost = window.location.origin; // Dynamically gets active system base URL
            const sClient = "011"; // Replace with your SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Pad leading zeros for standard 10-digit Purchase Order numbers
            const sFormattedPo = sPoNumber.padStart(10, "0");

            // Method 1: URL using OLR3_ME2XN helper transaction
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*OLR3_ME2XN%20OLR3_R3_TS_PDOC-EBELN=${encodeURIComponent(sFormattedPo)};DYNP_OKCODE=DISP` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        onOpenMMBE: function (oEvent) {
            var sMaterial = "", sPlant = "",oRowData = [];
              if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                      sMaterial = oRowData["COMPONENT"] || "";
                }
            }
            if (!sMaterial) {
                sap.m.MessageToast.show("No Material number available.");
                return;
            }
            var oFilterData = this.getOwnerComponent().getModel("filterCondData").getData();            
            sPlant =  oFilterData.Plant || ""; // Optional: Include Plant if available for more specific stock overview
            const sHost = window.location.origin; // Dynamically gets active system base URL
            const sClient = "011"; // Replace with your SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Pad leading zeros for standard 18-digit Material numbers (optional based on your backend setup)
            const sFormattedMaterial = sMaterial;

            // Construct transaction parameter string
            // MSL-MATNR: Material, MSL-WERKS: Plant, DYNP_OKCODE=ONLI: Executes search (F8)
            let sTxParam = `*MMBE%20MS_MATNR-LOW=${encodeURIComponent(sFormattedMaterial)}`;
            if (sPlant) {
                sTxParam += `;MS_WERKS-LOW=${encodeURIComponent(sPlant)}`;
            }
            sTxParam += `;DYNP_OKCODE=ONLI`;

            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=${sTxParam}` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        /**
         * Opens SAP WebGUI for transaction ME39 prefilled with the target Scheduling Agreement
         * @param {string|number} sDocNum Scheduling Agreement Number
         */
        onOpenME39: function (oEvent) {
            var sDocNum = "";
            var oRowData = [];
             if (oEvent.getSource().getParent().getRowBindingContext()) {
                let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                 oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    
                    const sDocType = Formatter.getDocTypeByNumber(sDocNum);
                    if (sDocType !== "SA") {
                      sDocNum = oRowData["PO_NO"] || "";
                    }else {
                      sDocNum = "";
                    }
                }
            if (!sDocNum) {
                sap.m.MessageToast.show("No Scheduling Agreement number provided.");
                return;
            }

            const sHost = window.location.origin; // Dynamically gets active system base URL
            const sClient = "011"; // Replace with your target SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Clean and pad leading zeros for standard 10-digit document numbers
            const sFormattedDoc = String(sDocNum).trim().padStart(10, "0");

            // Construct WebGUI URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*ME39%20RM06E-EVRTN=${encodeURIComponent(sFormattedDoc)};DYNP_OKCODE=%2f00&DYNP_NO1ST=1` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        }
    },
        /**
         * Opens SAP WebGUI for VD03 prefilled with Customer Master details
         * @param {string|number} sCustomer Customer Number (KUNNR)
         * @param {string} [sSalesOrg] Sales Organization (VKORG)
         * @param {string} [sDistChannel] Distribution Channel (VTWEG)
         * @param {string} [sDivision] Division (SPART)
         */
        onOpenVD03: function ( oEvent ) {
            var sCustomer = "";
            var oRowData = [];
            var oContext = oEvent.getSource().getBindingContext("subconModel");
              if (oContext) {
               // let oContext = oEvent.getSource().getParent().getRowBindingContext();
                let iIndex = oContext.sPath.split("/")[2];
                 oRowData = this._oUIDynamicTable.getBinding("rows").getAllCurrentContexts()[iIndex].getObject();
                if (oRowData["RootId"] === 99 && oRowData["IsMain"] === "IsMain") {
                    return;
                } else {
                    
                   // const sDocType = Formatter.getDocTypeByNumber(sDocNum);
                   sCustomer = oRowData["SHIP_TO"] || "";
                    
                }
            }
            if (!sCustomer) {
                sap.m.MessageToast.show("No Customer number provided.");
                return;
            }

            const sHost = window.location.origin; // Gets active server base URL
            const sClient = "011"; // Replace with target SAP Client
            const sLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            // Pad leading zeros for standard 10-digit Customer numbers
            const sFormattedCustomer = String(sCustomer).trim().padStart(10, "0");
            // Build parameter string dynamically
            let sParams = `RF02D-KUNNR=${encodeURIComponent(sFormattedCustomer)}`;
            sParams += `;DYNP_OKCODE=ENTR`;

            // Construct full WebGUI URL
            const sUrl = `${sHost}/sap/bc/gui/sap/its/webgui` +
                `?~transaction=*VD03%20${sParams}` +
                `&sap-client=${sClient}` +
                `&sap-language=${sLanguage}`;

            // Open in a new browser tab
            sap.m.URLHelper.redirect(sUrl, true);
        },
        fnNavigatetoExternalApp: function (sSemanticObject, sAction, oParams) {
            var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
            var sHref = (oCrossAppNav && oCrossAppNav.hrefForExternal({
                target: { semanticObject: sSemanticObject, action: sAction },
                params: oParams
            })) || "";

            if (sHref) {
                var sOrigin = window.location.href.split("#")[0];
                sap.m.URLHelper.redirect(sOrigin + sHref, true);
            } else {
                sap.m.MessageToast.show("Navigation service is not available.");
            }
        },

        /* =========================================================== */
        /* FLP Personalization Shell Services                          */
        /* =========================================================== */

        _getLoggedInUser: async function () {
            try {
                const oUserInfo = await sap.ushell.Container.getServiceAsync("UserInfo");
                this._LoggedUserId = oUserInfo.getId();
            } catch (e) {
                // Handle error siliently or log
            }
        },

        _initPersonalization: async function () {
            const oPersService = await sap.ushell.Container.getServiceAsync("Personalization");
            this._oPersContainer = await new Promise((fnResolve, fnReject) => {
                const oConfig = {
                    keyCategory: oPersService.constants.keyCategory.FIXED_KEY,
                    writeFrequency: oPersService.constants.writeFrequency.LOW,
                    clientStorageAllowed: true
                };
                //SUBCON_ALV_APP_VARIANTS - sdsubcntr_cockpit_alv
                oPersService.getPersonalizationContainer("sdsubcntr_cockpit_alv ", oConfig)
                    .done(fnResolve)
                    .fail(fnReject);
            });
        },

        _loadVariants: async function () {
            try {
                // Fetch variants from backend / service
                const oContainer = this._oPersContainer;
                const aVariants = oContainer.getItemValue("variants") || [];
                const oViewModel = this.getView().getModel("view");

                oViewModel.setProperty("/variants", aVariants);

                // 1. Ensure Standard/Default variant exists
                var bHasStandard = aVariants.some(function (v) { return v.key === "Default"; });
                if (!bHasStandard) {
                    aVariants.unshift({ key: "Default", text: "Standard", author: "SAP" });
                }

                // 2. Determine default variant key
        
                var oDefaultVariant = aVariants.find(function (v) { return v.isDefault === true; });
                var sDefaultKey = oDefaultVariant ? oDefaultVariant.key : "Default";

                // 3. Update view model state
                oViewModel.setProperty("/variants", aVariants);
                oViewModel.setProperty("/selectedKey", sDefaultKey);
                this._oVM.setDefaultKey(sDefaultKey);
                // 4. Apply selected variant state to table
                this._applyVariantState(sDefaultKey);

            } catch (oError) {
                // Fallback gracefully on failure
                this.getView().getModel("view").setProperty("/selectedKey", "Default");
            }
        },
        _loadVariants_1: async function () {
            try {
                // Example: Fetch saved variants from your persistence service or TablePersoHelper
                var aVariants = await TablePersoHelper.getVariants(); // Replace with your actual service call
                
                // Find the variant marked as default (adjust property name if needed, e.g., v.isDefault or v.def)
                var oDefaultVariant = aVariants.find(function (oVariant) {
                    return oVariant.isDefault === true || oVariant.def === true;
                });

                var oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/variants", aVariants);

                if (oDefaultVariant) {
                    // Set selected key to the saved default custom variant
                    oViewModel.setProperty("/selectedKey", oDefaultVariant.key);
                    
                    // Apply the default variant settings to the table / personalization helper
                    this._applyVariant(oDefaultVariant.key);
                } else {
                    // Fallback to Standard if no default is marked
                    oViewModel.setProperty("/selectedKey", "Default");
                    this._applyVariant("Default");
                }
            } catch (oError) {
                // Fallback gracefully on error
                this.getView().getModel("view").setProperty("/selectedKey", "Default");
            }
        },
        _applyVariantState: function (sVariantKey) {
            var oViewModel = this.getView().getModel("view");
            var aVariants = oViewModel.getProperty("/variants") || [];
            var oVariant = aVariants.find(function (v) { return v.key === sVariantKey; });

            if (oVariant && oVariant.state && oVariant.state.Columns) {
                var aColumns = oVariant.state.Columns;
                var oTable = this._oUIDynamicTable;

                aColumns.forEach(function (oColState) {
                    var oColumn = oTable.getColumns().find(function (col) {
                        return col.data("p13nKey") === oColState.id;
                    });
                    if (oColumn) {
                        oColumn.setVisible(oColState.visible);
                    }
                });
            }
        },
        _saveVariantsToPers: async function () {
            const oContainer = this._oPersContainer;
            const oViewModel = this.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants");

            oContainer.setItemValue("variants", aVariants);
            await new Promise((fnResolve, fnReject) => {
                oContainer.save().done(fnResolve).fail(fnReject);
            });
        },
        onVariantSave: async function (oEvent) {
            let sName = oEvent.getParameter("name");
            let bOverwrite = oEvent.getParameter("overwrite");
            let sKey = oEvent.getParameter("key");
            let _deFault = oEvent.getParameter("def");
            const oViewModel = this.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants") || [];

            // 1. Get updated personalization state from TablePersoHelper
            var aColumnsState = [];
            var aFiltersState = [];
            var aSortersState = [];

            if (this._oSubconPersoHelper && typeof this._oSubconPersoHelper.getStateModel === "function") {
                const oPersoStateModel = this._oSubconPersoHelper.getStateModel();
                const aPersoColumns = oPersoStateModel.getProperty("/columns") || [];

                // Map columns from helper state
                aColumnsState = aPersoColumns.map(function (oCol, iIndex) {
                    return {
                        key: oCol.key || oCol.id,
                        id: oCol.key || oCol.id,
                        visible: oCol.visible,
                        index: oCol.order !== undefined ? oCol.order : iIndex,
                        width: oCol.width || "5rem"
                    };
                });

                aFiltersState = oPersoStateModel.getProperty("/filter") || [];
                aSortersState = oPersoStateModel.getProperty("/sort") || [];
            } else {
                // Fallback to reading directly from UI Table standard columns
                aColumnsState = this._oUIDynamicTable.getColumns().map(function (oCol, iIndex) {
                    return {
                        key: oCol.data("p13nKey"),
                        id: oCol.data("p13nKey"),
                        visible: oCol.getVisible(),
                        index: iIndex
                    };
                });
            }

            // 2. Build layout payload matching the expected format
            var oCompleteLayoutPayload = {
                Columns: aColumnsState,
                Filters: aFiltersState,
                Sorters: aSortersState,
                // Also map to array properties (aColumns, aFilters, aSorters) for full compatibility
                aColumns: aColumnsState,
                aFilters: aFiltersState,
                aSorters: aSortersState
            };

            // 3. Construct new variant object
            let oNewVariant = {
                key: bOverwrite ? sKey : "variant_" + Date.now(),
                text: sName,
                executeOnSelection: _deFault ? _deFault: false ,
                state: oCompleteLayoutPayload,
                changeable: true,
                remove: true,
                author: this._LoggedUserId || "user",
                isDefault: _deFault ? _deFault: false 
            };

            if (bOverwrite) {
                const iIdx = aVariants.findIndex(item => item.key === sKey);
                if (iIdx >= 0) {
                    aVariants[iIdx] = oNewVariant;
                }
            } else {
                aVariants.push(oNewVariant);
            }

            oViewModel.setProperty("/variants", aVariants);
            oViewModel.refresh(true);
            this._sKey = oNewVariant.key;

            // 4. Save to shared Personalization Container
            await this._saveVariantsToPers();
            // 5. Select newly saved variant on main screen
            this.fnSelectVariantByKey(this._sKey);

            // 6. Synchronize layout back down to TablePersoHelper instance
            if (this._oSubconPersoHelper) {
                // if (typeof this._oSubconPersoHelper.fetchVariantsFromBackend === "function") {
                //     this._oSubconPersoHelper.fetchVariantsFromBackend();
                // }
                if (typeof this._oSubconPersoHelper.setPersonalizationData === "function") {
                    this._oSubconPersoHelper.setPersonalizationData(oCompleteLayoutPayload);
                }
            }
            this._oVM.setModified(false);
        },
        onVariantSave_backup: async function (oEvent) {
            let sName = oEvent.getParameter("name");
            let bOverwrite = oEvent.getParameter("overwrite");
            let sKey = oEvent.getParameter("key");

            const oViewModel = this.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants");

            // Capture standard structure array configuration from the UI table
            var aColumnsState = this._oUIDynamicTable.getColumns().map(function (oCol, iIndex) {
                return {
                    id: oCol.data("p13nKey"),
                    visible: oCol.getVisible(),
                    index: iIndex
                };
            });

            var oCompleteLayoutPayload = {
                Columns: aColumnsState
            };

            let oNewVariant = {
                key: bOverwrite ? sKey : "variant_" + Date.now(),
                text: sName,
                executeOnSelection: true,
                global: false,
                state: oCompleteLayoutPayload,
                changeable: true,
                remove: true,
                author: this._LoggedUserId
            };

            if (bOverwrite) {
                const iIdx = aVariants.findIndex(item => item.key === sKey);
                if (iIdx >= 0) { aVariants[iIdx] = oNewVariant; }
            } else {
                aVariants.push(oNewVariant);
            }

            oViewModel.refresh();
            this._sKey = oNewVariant.key;

            var self = this;
            await this._saveVariantsToPers();

            // Select the variant and update the UI container
            this.fnSelectVariantByKey(this._sKey);

            // Refresh the table personalization internal dialog layout instance
            if (this._oSubconPersoHelper && this._oSubconPersoHelper.getController) {
                this._oSubconPersoHelper.getController().refresh();
            }
        },

        onVariantSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key")|| this.getView().getModel("view").getProperty("/selectedKey");
            const oViewModel = this.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants");
            const oSelected = aVariants.find(item => item.key === sKey);

            if (oSelected) {
                this._applyVariant(oSelected);
                this._oVM.setModified(false);
                oViewModel.setProperty("/selectedKey", sKey);

                // Force the Table Settings Dialog to reread the shared getPersData structure
                if (this._oSubconPersoHelper && this._oSubconPersoHelper.getController) {
                    this._oSubconPersoHelper.getController().refresh();
                }
            }
        },

        fnSelectVariantByKey: function (sKey) {
            const oViewModel = this.getView().getModel("view");
            const aVariants = oViewModel.getProperty("/variants");
            const oSelected = aVariants.find(item => item.key === sKey);

            if (oSelected) {
                this._applyVariant(oSelected);
                this._oVM.setModified(false);
                oViewModel.setProperty("/selectedKey", oSelected.key);
            }
        },

        onVariantManage: async function (oEvent) {
            const oParams = oEvent.getParameters();
            const aDeleted = oParams.deleted;
            const aRenamed = oParams.renamed;
            const sDefaultKey = oParams.def;
            const oViewModel = this.getView().getModel("view");
            let aVariants = oViewModel.getProperty("/variants");

            if (aDeleted) {
                aVariants = aVariants.filter(item => !aDeleted.includes(item.key));
            }
            if (aRenamed) {
                aRenamed.forEach(renamedItem => {
                    const oTarget = aVariants.find(item => item.key === renamedItem.key);
                    if (oTarget) { oTarget.text = renamedItem.name; }
                });
            }
            // 3. Handle Default
            if (sDefaultKey) {
                aVariants.forEach(item => {
                    // Set `isDefault` to true for the selected key, and false for others
                    item.isDefault = (item.key === sDefaultKey);
                });

                // Optionally set default key on view model or VM control directly
                oViewModel.setProperty("/selectedKey", sDefaultKey);
            }

            oViewModel.setProperty("/variants", aVariants);
            await this._saveVariantsToPers();
            await this._loadVariants();
        },

        _applyVariant: function (oVariant) {
            this._oVM.setModified(true);
            if (!oVariant || !oVariant.state) { return; }

            var oTable = this._oUIDynamicTable;
            var oState = oVariant.state;

            // 1. --- APPLY THE VISIBILITY AND ORDER STATE TO THE UI COLUMNS ---
            if (oState.Columns && Array.isArray(oState.Columns)) {
                oTable.getColumns().forEach(function (oCol) {
                    oCol.setVisible(false);
                });

                oState.Columns.forEach(function (oStateCol, iIndex) {
                    const oTargetColumn = oTable.getColumns().find(oCol => oCol.data("p13nKey") === oStateCol.key);
                    var aHiddenKeys = ["IsMain", "RootId", "ParentId", "MainIndex", "HeaderIndex", "ItemsIndex", "EditDelQty"];

                    if (oTargetColumn) {
                        if (aHiddenKeys.includes(oStateCol.key)) {
                            oTargetColumn.setVisible(false);
                        } else {
                            oTargetColumn.setVisible(oStateCol.visible !== false);
                        }
                        oTable.removeColumn(oTargetColumn);
                        oTable.insertColumn(oTargetColumn, iIndex);
                    }
                });
            }

            // 2. --- APPLY FILTERS & SORTERS TO THE ENGINE LOGIC ---
            // If your working personalization rules engine filters/sorts the items array:
            this.onTablePersoApplyRules(oState.Filters || [], oState.Sorters || []);

            // 3. --- FORCE SYNCHRONIZATION WITH THE PERSO DIALOG ENGINE ---
            // This tells your helper engine to absorb the new state so the internal dialog reflects it
            if (this._oSubconPersoHelper) {
                // Construct standard personalization bundles for the dialog data provider
                var oPersoData = {
                    Columns: oState.Columns || [],
                    Filters: oState.Filters || [],
                    Sorters: oState.Sorters || [],
                    aColumns: oState.Columns || [],
                    aFilters: oState.Filters || [],
                    aSorters: oState.Sorters || [],
                };

                // Push state directly down to the helper's internal personalization manager 
                // Push state directly down to the helper's internal personalization manager 
               // debugger;
                if (this._oSubconPersoHelper && typeof this._oSubconPersoHelper.setPersonalizationData === "function") {

                    this._oSubconPersoHelper.setPersonalizationData(oPersoData);
                }
            }
            
        },

        /* =========================================================== */
        /* Table Internal Personalization Rules Engine                 */
        /* =========================================================== */

      
        onTablePersoApplyRules: function (aFilters, aSorters) {
            this._oVM.setModified(true);
            var oSubconModel = this.getModel("subconModel");
            var oDeepTable = oSubconModel.getProperty("/deepDynamicTable");
            if (!oDeepTable || !oDeepTable.Items) { return; }

            var aItemsCopy = JSON.parse(JSON.stringify(oDeepTable.Items));
            var aSubItemsRaw = oDeepTable.SubItems || [];

            // --- ELIMINATE LABEL HEADERS / DUMMY ROWS ---
            // Filter out the static text label rows (e.g., where RootId or ParentId indicates a sub-header row)
            var aSubItemsCopy = JSON.parse(JSON.stringify(
                aSubItemsRaw.filter(function (oSub) {
                    // Adjust this condition if your sub-header uses a different property (e.g., oSub.RootId !== "99")
                    return String(oSub.RootId) !== "99" && String(oSub.ParentId) !== "99";
                })
            ));

            var aFilteredItems = aItemsCopy;
            var aFilteredSubItems = aSubItemsCopy;

            // 1. Filtering Logic
            var bHasFilters = aFilters && aFilters.some(function (f) {
                return (f.value1 !== undefined && f.value1 !== null && f.value1 !== "") || (f.values && f.values.length > 0);
            });

            if (bHasFilters) {
                aFilteredItems = aItemsCopy.filter(function (oItem) {
                    var aChildren = aSubItemsCopy.filter(function (oSub) {
                        return String(oSub.ParentId) === String(oItem.RootId);
                    });
                    var bMainMatches = this._evalPersoRowMatches(oItem, aFilters);
                    var bSubMatches = aChildren.some(function (oSub) {
                        return this._evalPersoRowMatches(oSub, aFilters);
                    }.bind(this));
                    return bMainMatches || bSubMatches;
                }.bind(this));

                var aValidRootIds = aFilteredItems.map(function (oItem) { return String(oItem.RootId); });
                aFilteredSubItems = aSubItemsCopy.filter(function (oSub) {
                    return aValidRootIds.indexOf(String(oSub.ParentId)) !== -1;
                });
            }

            // 2. Sorting Logic
            if (aSorters && aSorters.length > 0) {
                var oSorterConfig = aSorters[0];
                var sSortKey = oSorterConfig.key;
                var sActualPath = sSortKey;
                var bDescending = oSorterConfig.descending === true || oSorterConfig.descending === "true";
                var oTableInstance = this._oUIDynamicTable || this.byId("tblsubcon");
                var aColumns = oTableInstance ? oTableInstance.getColumns() : [];

                var oTargetCol = aColumns.find(function (oCol) {
                    return oCol.data("p13nKey") === sSortKey;
                });

                if (oTargetCol) {
                    var iColIndex = aColumns.indexOf(oTargetCol);
                    sActualPath = "Col" + (iColIndex + 1);
                }

                // --- Core Sort Comparator ---
                var fnCompareValues = function (oLeft, oRight) {
                    var vLeftVal = oLeft[sActualPath];
                    var vRightVal = oRight[sActualPath];

                    if (vLeftVal === undefined || vLeftVal === null) { vLeftVal = ""; }
                    if (vRightVal === undefined || vRightVal === null) { vRightVal = ""; }

                    var sLeftStr = String(vLeftVal).trim();
                    var sRightStr = String(vRightVal).trim();

                    // Strip commas for valid numeric parsing ("1,000" -> "1000")
                    var sLeftClean = sLeftStr.replace(/,/g, "");
                    var sRightClean = sRightStr.replace(/,/g, "");

                    var nLeft = Number(sLeftClean);
                    var nRight = Number(sRightClean);

                    var bLeftIsNum = sLeftClean !== "" && !isNaN(nLeft);
                    var bRightIsNum = sRightClean !== "" && !isNaN(nRight);

                    if (bLeftIsNum && bRightIsNum) {
                        return bDescending ? nRight - nLeft : nLeft - nRight;
                    }

                    if (bLeftIsNum && !bRightIsNum) { return -1; }
                    if (!bLeftIsNum && bRightIsNum) { return 1; }

                    var sLowLeft = sLeftStr.toLowerCase();
                    var sLowRight = sRightStr.toLowerCase();

                    if (sLowLeft < sLowRight) { return bDescending ? 1 : -1; }
                    if (sLowLeft > sLowRight) { return bDescending ? -1 : 1; }
                    return 0;
                };

                // Step A: Sort main items
                aFilteredItems.sort(fnCompareValues);

                // Step B: Sort sub-items cleanly grouped under parents
                aFilteredSubItems.sort(function (oLeft, oRight) {
                    if (String(oLeft.ParentId) !== String(oRight.ParentId)) {
                        var iLeftParentIdx = aFilteredItems.findIndex(function (p) { return String(p.RootId) === String(oLeft.ParentId); });
                        var iRightParentIdx = aFilteredItems.findIndex(function (p) { return String(p.RootId) === String(oRight.ParentId); });
                        return iLeftParentIdx - iRightParentIdx;
                    }
                    return fnCompareValues(oLeft, oRight);
                });
            }

            // 3. Reassemble and push to Model
            var oFinalPayload = {
                Header: oDeepTable.Header,
                SubHeader: oDeepTable.SubHeader,
                Items: aFilteredItems,
                SubItems: aFilteredSubItems
            };
            var aFinalDataSet = this._fnGenerateDataSet(oFinalPayload);
            oSubconModel.setProperty("/ItemsSet", aFinalDataSet);
            oSubconModel.refresh(true);
            //if (this._oVM) {
                this._oVM.setModified(true);
           // }
        },
        _evalPersoRowMatches: function (oRowData, aFilters) {
            var oTableInstance = this._oUIDynamicTable || this.byId("tblsubcon");
            var aColumns = oTableInstance ? oTableInstance.getColumns() : [];

            return aFilters.every(function (oFilter) {
                var sKey = oFilter.key;
                var sResolvedPath = sKey;

                // Find the UI5 Column by personalization key
                var oColumn = aColumns.find(function (oCol) { return oCol.data("p13nKey") === sKey; });

                if (oColumn) {
                    // Option A: If you store the "colX" key directly on the column custom data, e.g., data("modelPath")
                    // sResolvedPath = oColumn.data("modelPath"); 

                    // Option B: Fallback if your model data keys correspond to the index of the columns (e.g., Column 0 = col1)
                    var iColIndex = aColumns.indexOf(oColumn);
                    sResolvedPath = "Col" + (iColIndex + 1); // Yields "col1", "col2", etc.
                }

                // Now oRowData[sResolvedPath] will correctly grab oRowData["col1"] instead of undefined
                var vRowValue = oRowData[sResolvedPath];
                if (vRowValue === undefined || vRowValue === null) { vRowValue = ""; }
                vRowValue = String(vRowValue).toLowerCase();

                var aValues = oFilter.values || [];
                if (aValues.length > 0) {
                    return aValues.some(function (vVal) {
                        var sLowVal = String(vVal || "").toLowerCase();
                        if (oFilter.operator === "Contains") {
                            return vRowValue.indexOf(sLowVal) !== -1;
                        }
                        return vRowValue === sLowVal;
                    });
                }

                if (oFilter.operator === "BT") {
                    var sLowRange = String(oFilter.value1 || "").toLowerCase();
                    var sHighRange = String(oFilter.value2 || "").toLowerCase();
                    if (!sLowRange && !sHighRange) { return true; }
                    return Number(vRowValue) >= Number(sLowRange) && Number(vRowValue) <= Number(sHighRange);
                }

                var sCompareValue = String(oFilter.value1 || "").toLowerCase();
                if (!sCompareValue) { return true; }

                switch (oFilter.operator) {
                    case "Contains": return vRowValue.indexOf(sCompareValue) !== -1;
                    case "EQ": return vRowValue === sCompareValue;
                    case "GT": return Number(vRowValue) > Number(sCompareValue);
                    case "LT": return Number(vRowValue) < Number(sCompareValue);
                    default: return true;
                }
            });
        }
    });
});
