sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    "../custom/CusValueHelpDialog",
    "sap/m/Token",
     "../util/Formatter",
     "sap/m/VariantItem"
], (JSONModel, Base, CusValueHelpDialog, Token,Formatter,VariantItem) => {
    "use strict";
    
    return Base.extend("com.bosch.rb1m.sd.sd_subcontr.controller.Main", {
         onInit: async function () {
                Base.prototype.onInit.apply(this);
                 this._oVM = this.getView().byId("variantManagement");
                this.oSemanticPage = this.byId("_IDGenPage"); 
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
                        D.setValueState(sap.ui.core.ValueState.None);
                        D.setValueStateText("");
                        let n = Formatter.fnFormatStringDateTime(e.text);
                       // D.setValueState(sap.ui.core.ValueState.None);
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

            // Initialize the View model for variant items
            const oViewModel = new JSONModel({
                selectedKey: "",
                variants: []
            });
            this.getView().setModel(oViewModel, "view");
             // Initialize Personalization container
             await this._initPersonalization();
            //Load Starup Parameters
            this.fnGetStarUpParameters();
            // Load stored variants
            await this._loadVariants();
            this._getLoggedInUser();
            this.showFooter(true);
            return true;
        },
        _getLoggedInUser: async function () {
            try {
                const UserInfo = await sap.ushell.Container.getServiceAsync("UserInfo");
                 this._LoggedUserId = UserInfo.getId();
            } catch (error) {
                //console.error("Error getting user info:", error);
               // MessageToast.show("Could not retrieve user information.");
            }
        },
        /** -------------------------------------------
         *  PERSONALIZATION INITIALIZATION
         *  -------------------------------------------
         */
        _initPersonalization: async function () {
            const oPersService = await sap.ushell.Container.getServiceAsync("Personalization");
            this._oPersContainer = await new Promise((resolve, reject) => {
                const oScope = { keyCategory: oPersService.constants.keyCategory.FIXED_KEY,
                                writeFrequency: oPersService.constants.writeFrequency.LOW,
                                clientStorageAllowed: true };

                oPersService.getPersonalizationContainer("comboschsdsubcntr", oScope)
                .done(resolve)
                .fail(reject);
            });
        },
         /** -------------------------------------------
         *  LOAD VARIANTS FROM PERSISTENCE
         *  -------------------------------------------
         */
        _loadVariants: async function () {
            const oContainer = this._oPersContainer;
            const oVariantData = oContainer.getItemValue("variants") || [];

            const oModel = this.getView().getModel("view");
            oModel.setProperty("/variants", oVariantData);

            if (oVariantData.length) {
                for(let i =0 ; i < oVariantData.length; i++ ){
                 if(oVariantData[i].key == "Default"){
                     oModel.setProperty("/selectedKey", oVariantData[i].key);
                      this._applyVariant(oVariantData[i]);
                    break;
                 }
               }             
               
            }else{
                 this._oVM.fireSave();
                  oModel.setProperty("/selectedKey", "Default");
            }
        },

        /** -------------------------------------------
         *  SAVE VARIANTS TO PERSISTENCE
         *  -------------------------------------------
         */
        _saveVariantsToPers: async function () {
            const oContainer = this._oPersContainer;
            const oModel = this.getView().getModel("view");
            const aVariants = oModel.getProperty("/variants");

            oContainer.setItemValue("variants", aVariants);
            await new Promise((resolve, reject) => {
                oContainer.save().done(resolve).fail(reject);
            });
        },

        /** -------------------------------------------
         *  EVENT: SAVE VARIANT
         *  -------------------------------------------
         */
        onVariantSave: async function (oEvent) {
            let sName = oEvent.getParameter("name");
            let bOverwrite = oEvent.getParameter("overwrite");
            let sKey = oEvent.getParameter("key");

            const oModel = this.getView().getModel("view");
            const aVariants = oModel.getProperty("/variants");
            const oSelectedFilterData= this.fnGetFilterVaules(); 
            let currentState = {
                    key:  "" ,
                    text: "",
                    executeOnSelection: true,
                    global: false,
                    state: oSelectedFilterData,
                    changeable:true,
                    remove: true,
                    author:  this._LoggedUserId
              }; 
            let o = this.getModel("dataModel").getProperty("/ContinueRun");  
            if(aVariants.length < 1){
                 sKey = "Default";
                 sName = "Default";
                 currentState = {
                            key:  sKey ,
                            text: sName,
                            executeOnSelection: true,
                            global: false,
                            state: oSelectedFilterData,
                            changeable:true,
                            remove: false,
                            author: 'SAP'
                        };
            }else{

                if( sKey == undefined && o == true){
                    let flagCheck = false;
                    for(let i =0 ; i < aVariants.length; i++ ){
                        if(aVariants[i].key == "Default"){
                            sKey =  aVariants[i].key;
                            sName = "Default";
                            bOverwrite = "X"
                            flagCheck = true;
                            break;
                        }
                    } 
                    if(flagCheck == false){
                            sKey =  "Default";
                            sName = "Default";
                            bOverwrite = "";           
                    }    
                        currentState = {
                            key:  sKey ,
                            text: sName,
                            executeOnSelection: true,
                            global: false,
                            state: oSelectedFilterData,
                             changeable:true,
                            remove: true,
                            author:  this._LoggedUserId

                    };         
                    }
                    else{
                        currentState = {
                            key: bOverwrite ? sKey : "variant_" + Date.now(),
                            text: sName,
                            executeOnSelection: true,
                            global: false,
                            state: oSelectedFilterData,
                            changeable:true,
                            remove: true,
                            author:  this._LoggedUserId
                    };
                }
            }
            if (bOverwrite) {
             const index = aVariants.findIndex(v => v.key === sKey);
             if (index >= 0) aVariants[index] = currentState;
            // aVariants[0] = currentState;
            } else {
                aVariants.push(currentState);
            }

             oModel.refresh();
             this._sKey = currentState.key;
             var that = this;
             this._saveVariantsToPers().then(function (oData) {
                that.fnSelectVariantByKey(that._sKey);
             });

            this._oVM.setModified(false);
            this.getModel("dataModel").setProperty("/ContinueRun",false);  
            // oModel.setProperty("/selectedKey", sKey);
            //sap.m.MessageBox.show(`Variant "${sName}" saved`);
            //that.fnSelectVariantByKey();
        },

        /** -------------------------------------------
         *  EVENT: SELECT VARIANT
         *  -------------------------------------------
         */
        onVariantSelect: function (oEvent) {
            const sKey = oEvent.getParameter("key");
            const oModel = this.getView().getModel("view");
            const aVariants = oModel.getProperty("/variants");

            const oVariant = aVariants.find(v => v.key === sKey);
            if (oVariant) {
                this._applyVariant(oVariant);
                //sap.m.MessageBox.show(`Variant applied: ${oVariant.text}`);
                this._oVM.setModified(false);
            }
        },
        fnSelectVariantByKey: function(sKey){
            const oModel = this.getView().getModel("view");
            const aVariants = oModel.getProperty("/variants");

            const oVariant = aVariants.find(v => v.key === sKey);
            if (oVariant) {
                this._applyVariant(oVariant);
                //sap.m.MessageBox.show(`Variant applied: ${oVariant.text}`);
                this._oVM.setModified(false);
                oModel.setProperty("/selectedKey", oVariant.key);
            }
        },
        /** -------------------------------------------
         *  EVENT: MANAGE VARIANT
         *  -------------------------------------------
         */
        onVariantManage: async function (oEvent) {
            const mParams = oEvent.getParameters();
            const aDeleted = mParams.deleted;
            const aRenamed = mParams.renamed;
            const oModel = this.getView().getModel("view");
            let aVariants = oModel.getProperty("/variants");

            // Remove deleted variants
            if(aDeleted){
             aVariants = aVariants.filter(v => !aDeleted.includes(v.key));
            }
            // Update renamed variants
            if(aRenamed){
                aRenamed.forEach(r => {
                    const v = aVariants.find(v => v.key === r.key);
                    if (v) v.text = r.name;
                });
            }
            oModel.setProperty("/variants", aVariants);
            await this._saveVariantsToPers();
           // sap.m.MessageBox.show("Variants updated");
            // Load stored variants
            await this._loadVariants();
        },

        /** -------------------------------------------
         *  APPLY VARIANT STATE TO UI
         *  -------------------------------------------
         */
        _applyVariant: function (variant) {
           //debugger;
           this.fnApplyFilerValue(variant.state);
        },

         showFooter: function (bShow) {
            this.oSemanticPage.setShowFooter(bShow);
        },
            /* Settings Model */
        fnInitializeSettingsModel: function () {
            var oSettingsModel = new JSONModel({
                languages: [],
                FieldsSetInlineCount: [],
                valueHelpSet: [],
                ContinueRun: false
            });
            this.setModel(oSettingsModel, "dataModel");
        },
         onExit: function () {
            var oSettingsModel = new JSONModel({
                languages: [],
                FieldsSetInlineCount: [],
                valueHelpSet: []
            });
            this.setModel(oSettingsModel,"dataModel");
        },
        onHandleContinuePress(oEvent){
             var a = this.fnGetFilterVaules(); 
             let b = this.fnCheckGoQueryPara(a);
            if(b==true){
                this.getOwnerComponent().getModel("filterCondData").setData(a);      
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Subconalv");
            }
        },
         fnCheckGoQueryPara: function (i) {
            var a = true,
                b = "";
          
            if (i.Plant.length < 1) {
                a = false;
                b = this.getModel("i18n").getProperty("dialog.error.check.input.Plant");
            } else if (i.ShippingPoint.length < 1) {
                a = false;
                b = this.getModel("i18n").getProperty("dialog.error.check.input.Shippingpoint");

            } else if (i.WareHouse.length < 1) {
                a = false;
                b = this.getModel("i18n").getProperty("dialog.error.check.input.Warehouse");
            }
             else if (i.RequestDate.length < 1) {
                a = false;
                b = this.getModel("i18n").getProperty("dialog.error.check.input.ReqirementDate");
            }
            if (a == false) {
                sap.m.MessageBox.show(b, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                })
            }
            return a;
        },
        fnGetFilterVaules: function(){
            var oFilterCondData = {
                    Plant: "",
                    ShippingPoint: "",
                    Vendor: [],
                    PurOrder:[],
                    RequestDate:[],
                    WareHouse:"",
                    Stor_Type:[],
                    Stor_Bin:[],
                    Assembly_Prod:[],
                    Component:[],
                    KeepLatestVar: false
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
                let _valLow = "";
                // arrFilter = new Array();
                if (oToken.data("range")) {
                    let oRange = oToken.data("range");
                    if(oRange.value1.includes("*") == true){
                        _valLow = oRange.value1;
                    }
                    else{
                        _valLow = "*" + oRange.value1 + "*";
                    }
                    var _oRow1 = {
                        "MainIndex": 0,
                        "SoIndex": 0,
                        "Sign": "I",
                        "Optio": "CP",
                        "Low":  _valLow,
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
                            if(i=="" && s==""){
                                var _oRow1 = {
                                    "MainIndex": 0,
                                    "SoIndex": 0,
                                    "Sign": "I",
                                    "Optio": "BT",
                                    "Low":  e ,
                                    "High": t 
                                    }   
                            }    
                            else{
                                var _oRow1 = {
                                    "MainIndex": 0,
                                    "SoIndex": 0,
                                    "Sign": "I",
                                    "Optio": "BT",
                                    "Low":  "*" + i + "*",
                                    "High": "*" + s + "*" 
                                    }   
                            }                
                        } else {
                               // let t = Formatter.formatOdataDateTimeZone(e);
                                t = Formatter.formatOdataDateTimeZone(e);
                                if (t) {
                                    var _oRow1 = {
                                    "MainIndex": 0,
                                    "SoIndex": 0,
                                    "Sign": "I",
                                    "Optio": n.operation,
                                    "Low":  "*" + t + "*" ,
                                    "High": ""
                                        };
                                 }
                                 else{
                                      var _oRow1 = {
                                    "MainIndex": 0,
                                    "SoIndex": 0,
                                    "Sign": "I",
                                    "Optio": n.operation,
                                    "Low":  e ,
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
                         if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
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
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {

                            arrFieldsSet.push(oData.oData[i]);
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
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_vendor"), false);
                       // let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_vendor"), _entityName, _inlineCount,_tblPrefliter);
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
                         if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_purchase_oder"), false);
                        // let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_purchase_oder"), _entityName, _inlineCount,_tblPrefliter);
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
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_warehouse_number"), false);
                        // let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        this.onValueHelpInputPopup(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_warehouse_number"), _entityName, _inlineCount,_tblPrefliter);
                   
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
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_type"), false);
                        let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        if (this.getView().byId("idip_warehouse_number").getValue()) {
                            let _f4Value = this.getView().byId("idip_warehouse_number").getValue();
                            if (_f4Value.length > 0) {
                                _arrPrefliter = {
                                    path: arrayColumns[0]["Field3"],
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    values: [_f4Value]
                                };
                                _tblPrefliter.push(_arrPrefliter);
                            }
                        }
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_storage_type"), _entityName, _inlineCount,_tblPrefliter);
                    }.bind(this), function (oError) {
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_type"), false);
                    }.bind(this));
                    break;     
                  case "idip_storage_bin":
                    // for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("lbl_storage_bin")
                    data.Field2 = this.getResourceBundle().getText("lbl_storage_type")
                    data.Field3 = this.getResourceBundle().getText("lbl_warehouse_number")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "StorBinId"
                    data.Field2 = "StorTypId"
                    data.Field3 = "WareHNo"              
                    arrayColumns.push(data);

                    var _inlineCount = 2;
                    var arrFieldsSet = [];

                    this.getService().getStorBinSet(aFilter).then(function (oData) {
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_storage_bin"), false);
                         let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        if (this.getView().byId("idip_warehouse_number").getValue()) {
                            let _f4Value = this.getView().byId("idip_warehouse_number").getValue();
                            if (_f4Value.length > 0) {
                                _arrPrefliter = {
                                    path: arrayColumns[0]["Field3"],
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    values: [_f4Value]
                                };
                                _tblPrefliter.push(_arrPrefliter);
                            }
                        }
                        if (this.getView().byId("idip_storage_type").getTokens()) {
                           // let _f4Value = this.getView().byId("idip_warehouse_number").getValue();
                            var _f4Value = this.getView().byId("idip_storage_type").getTokens();
                            if (_f4Value.length > 0) {
                                    _f4Value.forEach(e_f4Value => {
                                        _arrPrefliter = {
                                        path: arrayColumns[0]["Field2"],
                                        operator: sap.ui.model.FilterOperator.Contains,
                                        values: [e_f4Value.getKey()]
                                    };
                                    _tblPrefliter.push(_arrPrefliter);
                                });
                                
                            }
                        }
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_storage_bin"), _entityName, _inlineCount,_tblPrefliter);
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
                        if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                     
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_assembly_prod"), false);
                        // let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_assembly_prod"), _entityName, _inlineCount,_tblPrefliter);
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
                         if( oData.oData.length<=100){
                            _inlineCount = oData.oData.length;
                        } 
                        else{
                              _inlineCount = oData.oCount;
                        }
                        for (let i = 0; i < oData.oData.length; i++) {
                            arrFieldsSet.push(oData.oData[i]);
                        }
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("idip_component"), false);
                        // let _arrPrefliter = {};
                        let _tblPrefliter = [];
                        this.onValueHelpPopupAuto(arrayFieldsLabel, arrayColumns, arrFieldsSet, this.oControl, this.getResourceBundle().getText("lbl_component"), _entityName, _inlineCount,_tblPrefliter);
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
         onValueHelpPopupAuto: async function (_oLabels, _oColumns, _oData1, oControl, _title, _entityName, _inlineCount,_otblPrefliter) { // debugger;
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
            if(_otblPrefliter.length>0){
                _otblPrefliter.forEach(_etblPrefliter => {
                    _tblPrefliter.push(_etblPrefliter);
                });
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
                            var oToken1 = new Token(
                                {
                                    key: selectedRow[i][arrCols["Field1"]],
                                    text: selectedRow[i][arrCols["Field1"]]

                                }).data("range", {
                                "include": true,
                                "operation": sap.ui.model.FilterOperator.Contains,
                                "keyField": "",
                                "value1": selectedRow[i][arrCols["Field1"]],
                                "value2": ""
                            });
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
                        this._o_IDMultiInputReqDate.fireSubmit();
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
            this._oInputDate_req_date.update()
        },
         onAfterRendering:  function (oEvent) {      
           //this._loadVariant()
            // Load stored variants
           // await this._loadVariants();
         },
         fnGetStarUpParameters: function(){
            var _startUpParemeters = this.getOwnerComponent().getModel("startupParameters").getProperty("/startupParameters");
            this.fnSetDefaultValue(_startUpParemeters.ShippingPoint,this.byId("idip_shipping_point"));
            this.fnSetDefaultValue(_startUpParemeters.Plant,this.byId("idip_plant"));
            this.fnSetDefaultTokenValue(_startUpParemeters.Supplier,this.byId("idip_vendor"));
            this.fnSetDefaultValue(_startUpParemeters.Warehouse,this.byId("idip_warehouse_number"));
            this.fnSetDefaultTokenValue(_startUpParemeters.Material,this.byId("idip_assembly_prod"));
         },
         fnApplyFilerValue: function(oData){
            this.fnSetDefaultValue(oData.ShippingPoint,this.byId("idip_shipping_point"));
            this.fnSetDefaultValue(oData.Plant,this.byId("idip_plant"));
            this.fnSetDefaultArrayTokenValues(oData.Vendor,this.byId("idip_vendor"));
            this.fnSetDefaultValue(oData.WareHouse,this.byId("idip_warehouse_number"));
            this.fnSetDefaultArrayTokenValues(oData.Assembly_Prod,this.byId("idip_assembly_prod"));
            //Component
            this.fnSetDefaultArrayTokenValues(oData.Component,this.byId("idip_component"));
             //PurOrder
            this.fnSetDefaultArrayTokenValues(oData.PurOrder,this.byId("idip_purchase_oder"));
             //RequestDate
            this.fnSetDefaultRangeDateTokenValues(oData.RequestDate,this.byId("iddate_req_date"));
              //Stor_Bin
            this.fnSetDefaultArrayTokenValues(oData.Stor_Bin,this.byId("idip_storage_bin"));
               //Stor_Type
            this.fnSetDefaultArrayTokenValues(oData.Stor_Type,this.byId("idip_storage_type"));
         }
         ,
         fnSetDefaultValue: function (a,o) {
            if (a) { 
                if (a.length > 0) {
                    o.setValue(a);
                }
                else{
                      o.setValue("");
                }
            }
        },
        fnSetDefaultTokenValue: function (a,o) {
            if (a) { 
                if (a.length > 0) {
                    let aTokens = [];
                    var oToken1 = new Token({key: a, text: a});
                    aTokens.push(oToken1);
                    o.setTokens(aTokens);
                }
                else{
                  
                    o.setTokens([]);
                }
            }
        },
        fnSetDefaultArrayTokenValues: function (a,o) {
             let aTokens = [];
            if (a) { 
                if (a.length > 0) {
                    a.forEach(oToken => {
                     var oToken1 = new Token({key: oToken.Low, text:  oToken.Low}).data("range", {
                            include: true,
                            operation: sap.ui.model.FilterOperator.Contains,
                            keyField: "",
                            value1: oToken.Low,
                            value2: oToken.High
                        });
                     aTokens.push(oToken1);
                    });
                               
                    o.setTokens(aTokens);
                }
                else{
                    o.setTokens([]); 
                }
            }
        },
         fnSetDefaultRangeDateTokenValues: function (a,o) {
             let aTokens = [];
            if (a) { 
                if (a.length > 0) {
                    a.forEach(oToken => {
                        let _lowDate =  oToken.Low.substring(1, 11);
                        let t = new Date(_lowDate);
                        let n = Formatter.fnFormatDateUI5Display(t);
                        let _highDate =  oToken.High.substring(1, 11);
                        let r = new Date(_highDate);
                        let i = Formatter.fnFormatDateUI5Display(r);

                        var u = "";
                        if(n && i){
                            // u = n + "..." + i; 
                            u  = Formatter.convertRangeOperationToText(oToken.Optio, n, i);
                            var l = new Token({key: u, text: u}).data("range", {
                            include: true,
                            operation: oToken.Optio,
                            keyField: "",
                            value1: oToken.Low,
                            value2: oToken.High
                        });
                        }
                        else{
                            //u = n;
                            u  = Formatter.convertRangeOperationToText(oToken.Optio, n, i);
                            var l = new Token({key: u, text: u}).data("range", {
                            include: true,
                            operation: oToken.Optio,
                            keyField: "",
                            value1: oToken.Low,
                            value2: oToken.High
                             });
                        }                      
                        aTokens.push(l);
                    });                             
                    o.setTokens(aTokens);
                }
            }
        },
        onInputChange : function(oEvent){
            this._oVM.setModified(true);
          // let a = this._oVM.getItemByKey( this._oVM.getSelectedKey());
             if(oEvent.oSource.getId().includes("iddate_req_date")){
                if(oEvent.oSource.getValue().length < 1){
                      oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
                      oEvent.oSource.setValueStateText(""); 
                }            
             }          
        },
        onTokenUpdate: function (oEvent) {
             if(oEvent.oSource.getId().includes("iddate_req_date")){
                 oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
                oEvent.oSource.setValueStateText(""); 
             }
            this._oVM.setModified(true);
        },
        onSubmitInput: function(oEvent){
         this._oVM.setModified(true);
          //debugger;
          if(oEvent.oSource.getId().includes("iddate_req_date")){

                oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
                oEvent.oSource.setValueStateText("");       
          }        
        }
    });
});