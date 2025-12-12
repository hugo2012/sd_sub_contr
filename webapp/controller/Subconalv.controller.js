sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    'sap/ui/core/library',
    '../util/Formatter',
    "../custom/Input",
    "sap/ui/core/routing/History",
    "sap/ui/table/rowmodes/Fixed",
    'sap/m/p13n/Engine',
	'sap/m/p13n/SelectionController',
    'sap/m/p13n/MetadataHelper',
    'sap/m/table/ColumnWidthController',
    "com/bosch/rb1m/sd/sd_subcontr/model/models"
], function (JSONModel, Base, coreLibrary, Formatter, Input,History,FixedRowMode,
    Engine,SelectionController,MetadataHelper,ColumnWidthController,models
    ) {
    "use strict";
    var ValueState = coreLibrary.ValueState;
    return Base.extend("com.bosch.rb1m.sd.sd_subcontr.controller.Subconalv", {
        onInit:  function () {
            Base.prototype.onInit.apply(this);
            this.oSemanticPage = this.byId("idObjectPage");
            this.fnInitializeSettingsModel();
            this._oUIDynamicTable = this.byId("tblsubcon");
            this._oUIDynamicTable.bindRows("subconModel>/ItemsSet");    
            this._isSizeLimit = 500;
            this.getRouter().getRoute("Subconalv").attachMatched(this.onRouteMatched, this);
            this._flagRenderTable = false;
            this._oUIDynamicTable.attachEvent("rowsUpdated", this.onRowsUpdated, this);
            this._startUpParemeters = this.getOwnerComponent().getModel("startupParameters").getProperty("/startupParameters");
            //this._registerForP13n();
        },
        onExit: function () {
           // this.fnInitializeSettingsModel();
        },
        /* Settings Model */
        fnInitializeSettingsModel: function () { // debugger;
            var oSettingsModel = new JSONModel({
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
            this.setModel(oSettingsModel, "subconModel");
        },
        onRouteMatched: function () {
            var a = this.getOwnerComponent().getModel("filterCondData").getData();
            if (a.Plant==undefined) {
                this.onNavBack();
                return;               
            } else {
               this.onLoadData(a);
            }
        },
        navBack: function() {
            debugger;
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
        onLoadData: function (oData) {
            this.getModel("subconModel").setProperty("/itemsChangedError", []);
            this.getModel("subconModel").setProperty("/deepDynamicTable", []);
            this.getModel("subconModel").setProperty("/ItemsSet", []);
            var _payload_deep_rt = this.fnBuildDeepentity();
            // var _jSonObj =  JSON.stringify(_payload_deep_rt);
            _payload_deep_rt.RunMode = "R";
            // debugger;
            this.setBusy(true);
            this.getService().queryProcessDeepEntity(_payload_deep_rt).then(function (aData) {
                 this.setBusy(false);
                if (aData._ItemsNav.length > 0) {
                    let deepDynamicTable = this._fnBuildDeepDynamicTable(aData);
                    this.getModel("subconModel").setProperty("/deepDynamicTable", deepDynamicTable);
                    this.getModel("subconModel").setProperty("/bDisplayEnable", true);
                    this.fnBuildDynamicTableData(deepDynamicTable);
                   
                }else{
                    let deepDynamicTable = this._fnBuildDeepDynamicTable(aData);
                    this.getModel("subconModel").setProperty("/deepDynamicTable", deepDynamicTable);
                    this.fnBuildDynamicTableData(deepDynamicTable);
                    this.getModel("subconModel").setProperty("/bDisplayEnable", false);
                    let _sMessage = this.getResourceBundle().getText("dialog.error.nodata.found");
                    this._fnHandleErrorExe(_sMessage);
                    //this.onNavBack();
                    //return;
                }              
                // create mock sample
              //  this.fnCreateMockData();
            }.bind(this), function (oError) {
                this.setBusy(false);
                this._fnHandleErrorExe();
            }.bind(this)); 
            //Call mock data
            // this.fnCreateMockData();
        },
        fnCreateMockData: function(){
            this.getModel("subconModel").setProperty("/bDisplayEnable", true);
            var deepDynamicTable = models.fnCreateMockData();            
            this.getModel("subconModel").setProperty("/deepDynamicTable", deepDynamicTable);
            this.fnBuildDynamicTableData(deepDynamicTable);
            this.setBusy(false);
            // create mock sample data   
            },
        _fnBuildDeepDynamicTable: function(aData){
            var deepDynamicTable = {
                Header: [],
                Items: [],
                SubHeader: [],
                SubItems: []
            };
              if (aData._HeaderNav) {
                    if (aData._HeaderNav.length > 0) {
                        aData._HeaderNav.forEach(eHeaderNav => {
                            if (eHeaderNav.IsMain == true) {
                                deepDynamicTable.Header.push(eHeaderNav);
                            }
                            else {
                                deepDynamicTable.SubHeader.push(eHeaderNav);
                            }
                        });
                    }
                }
                if (aData._ItemsNav) {
                    if (aData._ItemsNav.length > 0) {
                        aData._ItemsNav.forEach(eItemsNav => {
                            if (eItemsNav.IsMain == true) {
                                deepDynamicTable.Items.push(eItemsNav);
                            }
                            else {
                                deepDynamicTable.SubItems.push(eItemsNav);
                            }
                        });
                    }
                }
                return deepDynamicTable;
        },
       
        fnBuildDynamicTableData: function (oData) {
            if (oData.Header.length === 0 ) {
                this.getModel("subconModel").setProperty("/ItemsSet", []);
                return;
            }
            var aData = oData.Items;
            var aHeader = oData.Header;
            var aHeaders = [];
            var aRows = [];
            aHeaders = aHeader;
            for (var i = 0; i < aData.length; i++) {
                if(i > this._isSizeLimit){
                    break;
                }
                else{
                    aRows.push(aData[i]);
                }            
            }
            var oTable = {
                "headerDetails": aHeaders,
                "rowDetails": aRows
            };
            var _dataMainItemSet = this._fnGenerateDataSet(oData);
            this.getModel("subconModel").setProperty("/ItemsSet", _dataMainItemSet);
            if(_dataMainItemSet.length > this._isSizeLimit){
                this._oUIDynamicTable.setRowMode(sap.ui.table.rowmodes.Type.Auto);
            }
            else{
                this._oUIDynamicTable.setRowMode(sap.ui.table.rowmodes.Type.Auto);
            }
            this._fnBuildTable(oTable);
           // init persionlizationengine
           //this._registerForP13n();

        },
        _registerForP13n: function() {
			const oTable = this.byId("tblsubcon");

			this.oMetadataHelper = new MetadataHelper([
                {key: 'TRAFF_LGT', label: 'Traffic Light', path: 'Traffic Light'},
                {key: 'SUPP_NO', label: 'Supplier Number', path: 'Supplier Number'},
                {key: 'SUPP_NAME', label: 'Supplier Name', path: 'Supplier Name'},
                {key: 'SUPP_CITY', label: 'Supplier City', path: 'Supplier City'},
                {key: 'SUPP_CTRY', label: 'Supplier Country', path: 'Supplier Country'}, 
                {key: 'PO_NO', label: 'Purchase Document', path: 'Purchase Document'},
                {key: 'ASSE_PRD', label: 'Assembly Product', path: 'Assembly Product'},
                {key: 'PRD_DESCR', label: 'Product Description', path: 'Product Description'},
                {key: 'COMPONENT', label: 'Component', path: 'Component'},
                {key: 'COMP_DESCR', label: 'Component Description', path: 'Component Description'},
                {key: 'STOCK', label: 'Stock', path: 'Stock'},
                {key: 'UOM', label: 'Unit Of Measure', path: 'Unit Of Measure'},
                {key: 'SUM_HU', label: 'Sum. HU', path: 'Sum. HU'}, 
                {key: 'STOCK_SUPP', label: 'Stock At Supplier', path: 'Stock At Supplier'}, 
                {key: 'BEN', label: '', path: ''}, 
                {key: 'DEMAND', label: 'Demand', path: 'Demand'},
                {key: 'SHIP_TO', label: 'Ship To Party', path: 'Ship To Party'},
                {key: 'IsMain', label: 'Is Main', path: 'Is Main'},
                {key: 'RootId', label: 'Root ID', path: 'Root ID'},
                {key: 'ParentId', label: 'Parent ID', path: 'Parent ID'} ,
                {key: 'MainIndex', label: 'Main Index', path: 'Main Index'},
                {key: 'HeaderIndex', label: 'Header Index', path: 'Header Index'},
                {key: 'ItemsIndex', label: 'Items Index', path: 'Items Index'},
                {key: 'EditDelQty', label: 'Edit Del.Qty', path: 'Edit Del.Qty'}

			]);

			this._mIntialWidth = {
                "TRAFF_LGT":  "3rem",
                "SUPP_NO":  "3.5rem",
                "SUPP_NAME":  "3.5rem",
                "SUPP_CITY":  "3.5rem",
                "SUPP_CTRY":  "3.5rem",
                "PO_NO":  "4rem",
                "ASSE_PRD":  "6rem",
                "PRD_DESCR":  "6rem",
                "COMPONENT": "6rem",
                "COMP_DESCR": "6rem",
                "STOCK": "4rem",             
                "UOM": "4rem",
                "SUM_HU": "4rem",
                "STOCK_SUPP":"4rem",
                "BEN": "3rem",
                "DEMAND": "4rem",
                "SHIP_TO": "6rem"     
			};
            Engine.getInstance().register(oTable, {
                helper: this.oMetadataHelper,
                controller: {
                    Columns: new SelectionController({
                        targetAggregation: "columns",
                        control: oTable
                    }),
                    // Sorter: new SortController({
                    //     control: oTable
                    // }),
                    // Groups: new GroupController({
                    //     control: oTable
                    // }),
                     ColumnWidth: new ColumnWidthController({
                        control: oTable
                     })
                }
			});

			Engine.getInstance().attachStateChange(this.handleStateChange, this);
         },
        openPersoDialog: function(oEvt) {
			const oTable = this._oUIDynamicTable;

			Engine.getInstance().show(oTable, ["Columns"], {
				contentHeight: "35rem",
				contentWidth: "32rem",
				source: oEvt.getSource()
			});
		},
        _getKey: function(oControl) {
			return oControl.data("p13nKey");
		},

		handleStateChange: function(oEvt) {
			const oTable = oEvt.getParameter("control");
			const oState = oEvt.getParameter("state");

			if (!oState) {
				return;
			}

			oTable.getColumns().forEach(function(oColumn) {

				//const sKey = oColumn.data("p13nKey");
				//const sColumnWidth = oState.ColumnWidth[sKey];

				//oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

				oColumn.setVisible(false);
				//oColumn.setSortOrder(CoreLibrary.SortOrder.None);
			}.bind(this));

			oState.Columns.forEach(function(oProp, iIndex) {
				const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
				if(oProp.key=="IsMain" || oProp.key=="RootId" || oProp.key=="ParentId" || oProp.key=="MainIndex"  
                  || oProp.key=="HeaderIndex" || oProp.key=="ItemsIndex" || oProp.key=="EditDelQty"       
                 )
                 {
                     oCol.setVisible(false);
                 }
                 else{
                     oCol.setVisible(true);
                 }               
				oTable.removeColumn(oCol);
				oTable.insertColumn(oCol, iIndex);
			}.bind(this));

		},
        _fnGenerateDataSet:function(oData){
            var aData = oData.Items;
            var aHeader = oData.Header;
            var aHeaders = [];
            var aRows = [];
            var aSubHeaders = oData.SubHeader;
            var aDataSub = oData.SubItems;
            var aRowsSub = [];
            let i = 0;
            for ( i = 0; i < aDataSub.length; i++) {
                if(i > this._isSizeLimit){
                    break;
                }
                else{
                     aRowsSub.push(aDataSub[i]);
                }             
            }
            aHeaders = aHeader;
            i = 0;
            for ( i = 0; i < aData.length; i++) {
                if(i > this._isSizeLimit){
                    break;
                }
                else{
                     aRows.push(aData[i]);
                }              
            }
            var _dataMainItemSet = this.fnReGenerateOdataSet(aHeaders, aRows, aSubHeaders, aRowsSub);
            return _dataMainItemSet;
        },
        _fnBuildTable: function (aTableData) {
            this._oUIDynamicTable.destroyColumns();
            var _aFixedColumn = aTableData.headerDetails
            for (var t = 0; t < _aFixedColumn.length; t++) {
                var a = "{subconModel>" + _aFixedColumn[t].HeaderName + "}";
                var b = "subconModel>" + _aFixedColumn[t].HeaderName;
                let s;
                if (t === 0) {
                    s = new sap.ui.table.Column({
                        width: "3rem",
                        headerMenu: "menu",
                        resizable: true,
                        label: new sap.m.Label(
                            { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                        ),
                        template: new sap.ui.core.Icon({
                            src: {
                                path: b,
                                formatter: function (v) {
                                    return Formatter.statusIcon(v);
                                }
                            },
                            size: "1rem",
                            color: {
                                path: b,
                                formatter: function (v) {
                                    return Formatter.statusColor(v);
                                }
                            },
                            tooltip: {
                                path: b,
                                formatter: function (v) {
                                    return Formatter.statusText(v);
                                }
                            }
                        })
                    });
                    s.data("p13nKey",_aFixedColumn[t].HeaderName) ;
                    this._oUIDynamicTable.addColumn(s)
                }
                else {
                    switch (_aFixedColumn[t].HeaderName) {
                        case "IsMain":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "auto",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;
                         case "RootId":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;
                        case "ParentId":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break; 
                         case "MainIndex":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;  
                         case "HeaderIndex":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;      
                        case "ItemsIndex":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;   
                          case "EditDelQty":
                            // code block
                            s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                 headerMenu: "menu",
                                 resizable: true,
                                label: new sap.m.Label(
                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                ),
                                template: new sap.m.Text(
                                    { text: a }
                                )
                            });
                            break;           
                        default:
                             let _width = "5rem";
                            // code block
                            if(sap.ui.Device.resize.width >=585 && sap.ui.Device.resize.height >=456){
                                _width = "100%";
                            }
                            else{
                                   switch (_aFixedColumn[t].HeaderName) {
                                        case "COMPONENT":
                                            _width = "6rem"
                                            break;
                                        case "STOCK":
                                            _width = "4rem"
                                            break;
                                        case "UOM":
                                            _width = "4rem"
                                            break;
                                        case "SUM_HU":
                                            _width = "4rem"
                                            break;
                                        case "STOCK_SUPP":
                                            _width = "4rem"
                                            break;
                                        case "BEN":
                                            _width = "3rem"
                                            break;
                                        case "DEMAND":
                                            _width = "4rem"
                                            break;
                                        case "SHIP_TO":
                                            _width = "6rem"
                                            break;
                                        case "SUPP_CTRY":
                                            _width = "3.5rem"
                                            break;
                                    }
                            }
                           
                         
                            if (_aFixedColumn[t].HeaderName != "SHIP_TO") {

                                switch (_aFixedColumn[t].HeaderName) {
                                    case "STOCK":
                                        s = new sap.ui.table.Column({
                                                width: _width,
                                                headerMenu: "menu",
                                                resizable: true,
                                                label: new sap.m.Label(
                                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                                ),
                                                template: new sap.m.Link(
                                                    {
                                                        text: {
                                                            parts: [
                                                                { path: b },
                                                                { path: 'subconModel>IsMain' },
                                                                { path: 'subconModel>RootId' }
                                                                 
                                                            ],
                                                            formatter: function (n, l,p) {
                                                                  this.removeStyleClass("cussapMLnkSubtle");
                                                                  this.removeStyleClass("myCustomLinkClass");    
                                                                if(Formatter.fnFormatNumericRet(n,l,p) == true){
                                                                   this.addStyleClass("cussapMLnkSubtle");
                                                                }
                                                                else{
                                                                      this.addStyleClass("myCustomLinkClass");                                                       
                                                                }
                                                                return Formatter.fnFormatNumeric(n, l,p);
                                                            }
                                                        },
                                                        press: function (e) {
                                                            this._fnHandleLinkPress(e);
                                                        }.bind(this),
                                                        subtle: false
                                                    }
                                                )
                                            });   
                                         break;    
                                        case "SUPP_NO":
                                        s = new sap.ui.table.Column({
                                                width: _width,
                                                headerMenu: "menu",
                                                resizable: true,
                                                label: new sap.m.Label(
                                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                                ),
                                                template: new sap.m.Link(
                                                    {
                                                        text: {
                                                            parts: [
                                                                { path: b },
                                                                { path: 'subconModel>IsMain' },
                                                                { path: 'subconModel>RootId' }
                                                                 
                                                            ],
                                                            formatter: function (n, l,p) {
                                                                  this.removeStyleClass("cussapMLnkSubtle");    
                                                                if(l == true){
                                                                   this.addStyleClass("cussapMLnkSubtle");
                                                                }
                                                                return Formatter.fnFormatNumeric(n, l,p);
                                                            }
                                                        },
                                                        press: function (e) {
                                                            this._fnHandleLinkSupplierPress(e);
                                                        }.bind(this),
                                                        subtle: false
                                                    }
                                                )
                                            });   
                                         break;        
                                    default:
                                        s = new sap.ui.table.Column({
                                                width: _width,
                                                headerMenu: "menu",
                                                resizable: true,
                                                label: new sap.m.Label(
                                                    { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                                ),
                                                template: new sap.m.Text(
                                                    {
                                                         text: a
                                                        
                                                    }
                                                )
                                            });
                                    }                              
                            }
                            else {
                                 s = new sap.ui.table.Column({
                                    width: _width,
                                    headerMenu: "menu",
                                    resizable: true,
                                    label: new sap.m.Label(
                                        { text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue }
                                    ),
                                    template: new Input(
                                        {
                                            value: a,                                         
                                            type: {
                                                parts: [
                                                    { path: b },
                                                    { path: 'subconModel>IsMain' },
                                                    { path: 'subconModel>RootId' },
                                                    { path: 'subconModel>EditDelQty' }
                                                ],
                                                formatter: function (n, l,p,g) {
                                                    this.removeStyleClass("noneEdit"); 
                                                    if(g==false && l == false && p !=99){
                                                        //noneEdit
                                                         this.addStyleClass("noneEdit"); 
                                                          return sap.m.InputType.Number
                                                    }
                                                    else{
                                                         return Formatter.fnFormatType(n, l,p);
                                                    }
                                                   
                                                }
                                            }, 
                                            editable:true,
                                            liveChange: function (e) {
                                                Formatter._fnValidateNumber(e);
                                                this._fnCheckQty(e);
                                            }.bind(this),
                                            submit: function (e) {
                                                this._fnCheckQty(e);
                                            }.bind(this),
                                            maxLength: 20,
                                             inputColorMode: {
                                                 normal: "#f7f7f7",
                                                 edit: "#ffffff",
                                                 fixed: "#e8eff6",
                                                 assembly: "#F9EFDB",
                                                 noneEdit: "#a9b4be"
                                             }
                                        }
                                    )
                                });
                            }
                    }
                    //s.addData("p13nKey",_aFixedColumn[t].HeaderName);
                     s.data("p13nKey",_aFixedColumn[t].HeaderName) ;
                    this._oUIDynamicTable.addColumn(s)
                }
            }
            this._oUIDynamicTable.setFixedColumnCount(1);
        },
        onRowsUpdated: function(oEvent){
             // Your logic to execute after rows are rendered/updated
            // You can access the table instance using oEvent.getSource()
            const oTable = oEvent.getSource();
            const aVisibleRows = oTable.getRows(); // Get the currently visible rows
            //console.log("Rows updated. Visible rows:", aVisibleRows.length);
            var oData = this.getModel("subconModel").getProperty("/ItemsSet");
            let _rowAllData = this._oUIDynamicTable.getBinding('rows');
            var count =  aVisibleRows.length;
            if(oData.length < count){
                count = oData.length;
            }
            var rowStart = this._oUIDynamicTable.getFirstVisibleRow();
            var currentRowContext;
            if(oData.length < 1){
                return;
            }
            for (var i = 0; i < count; i++) {
                var selectedRow = aVisibleRows[i];
                rowStart = rowStart + 1;
                currentRowContext = selectedRow.getRowBindingContext();
                 let index = currentRowContext.sPath.split("/")[2];
                var _rowData = _rowAllData.getAllCurrentContexts()[index].getObject();
                var columId = "#" + oTable.getId()+ "-rowsel" + i;
                 for (let v = 5; v <= 16; v++) {
                    let columId_hdr_1 = "#" + oTable.getId() + "-rows-row" + i + "-col" + v;
                    $(columId_hdr_1).removeClass("subHeader");                                 
                }  
                selectedRow.getCells()[16].setProperty("editable", false);     
                $(columId).removeClass("hideCheckbox");   
                 selectedRow.$().removeClass("assemblyPrd");     
                 // check editbale for Delivery Q.ty
                 var _EditDelQty = _rowData["EditDelQty"];
                if (_rowData["IsMain"] != true) {
                    $(columId).addClass("hideCheckbox");
                    if (_rowData["IsMain"]) {
                        if (_rowData["RootId"] == 99) {                  
                            for (let v = 5; v <= 16; v++) {
                                let columId_hdr = "#" + oTable.getId() + "-rows-row" + i + "-col" + v;
                                $(columId_hdr).addClass("subHeader");
                                if(v==10)
                                {
                                    $(columId_hdr).addClass("cussapMLnkSubtle");
                                }  
                                else if(v==16){
                                   //  $(columId_hdr).addClass("noneEdit1");
                                }                                    
                            }
                              selectedRow.getCells()[16].setProperty("editable", false);
                             
                        }
                        else {
                            $(columId).removeClass("subHeader");
                            selectedRow.getCells()[16].setProperty("editable", _EditDelQty);
                        }
                    }
                    else {
                         $(columId).removeClass("subHeader");
                        selectedRow.getCells()[16].setProperty("editable", _EditDelQty);
                        
                    }
                }
                else{
                      selectedRow.$().removeClass("assemblyPrd");
                      selectedRow.$().addClass("assemblyPrd");
                }
            } 

        },
        _fnHandleLinkPress:  function(e){
           // debugger;
             if (e.getSource().getParent().getRowBindingContext()) {
                let a = e.getSource().getParent().getRowBindingContext();
                let index = a.sPath.split("/")[2];
                let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts()[index].getObject();
                var _filterCondData = this.getOwnerComponent().getModel("filterCondData").getData();
                let _ShippingPoint = _filterCondData.ShippingPoint;
                let oSelTableRow = aTableContext;
                if(oSelTableRow["RootId"] == 99 && oSelTableRow["IsMain"] == "IsMain"){
                   return; 
                }
                else{
                    let _oSemanticObj = "#OutboundDelivery-createForSOSchedInWebGUI?sap-ui-tech-hint=GUI&";
                    let _para1 = "ST_VSTEL-LOW=&1"
                    let _para2 = "ST_MATNR-LOW=&2"
                    // let _execCommand = ";DYNP_OKCODE=ENTR";
                    _para1 = _para1.replace(/&1/g, _ShippingPoint);
                    _para2 = _para2.replace(/&2/g, oSelTableRow["COMPONENT"]);               
                    let _fullURL =  this._startUpParemeters._navURL  + _oSemanticObj + _para1 + ";" + _para2 ;
                    sap.m.URLHelper.redirect(_fullURL,true);    
                 
                }

                }
        },
        _fnHandleLinkSupplierPress:  function(e){
           // debugger;
             if (e.getSource().getParent().getRowBindingContext()) {
                let a = e.getSource().getParent().getRowBindingContext();
                let index = a.sPath.split("/")[2];
                let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts()[index].getObject();                
                let oSelTableRow = aTableContext;
                let _BusinessPartner = oSelTableRow["SUPP_NO"];
                if(oSelTableRow["RootId"] == 99 && oSelTableRow["IsMain"] == "IsMain"){
                   return; 
                }
                else{
                    let _oSemanticObj = "#Supplier-manage?sap-ui-tech-hint=GUI&";
                    let _para1 = "BusinessPartner=&1"
                    _para1 = _para1.replace(/&1/g, _BusinessPartner);               
                    let _fullURL =  this._startUpParemeters._navURL  + _oSemanticObj + _para1  ;
                    sap.m.URLHelper.redirect(_fullURL,true);    
                 
                }

                }
        },
        _fnCheckQty: function (e) {
            //debugger;
            if (e.getParameter("value")) {
                if (e.getParameter("value").length > 0) {
                    let a = e.getSource().getParent().getRowBindingContext();
                    let index = a.sPath.split("/")[2];
                    let _rowData = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts()[index].getObject();
                    let _currInput = e.getParameter("value");//parseFloat
                    _currInput = parseFloat(_currInput);
                    let _stock = parseFloat(_rowData["STOCK"]);
                    let _sum_hu = 0;
                    let _total = _stock + _sum_hu;
                    let b = {};
                    if (_currInput > _total) {
                        //raise error
                        e.getSource().setValueState(ValueState.Error);
                        let material = _rowData["COMP_DESCR"];
                        let batch = _rowData["STOCK_SUPP"];
                        let _message = this.getModel("i18n").getProperty("dialog.error.validation.itemDelQty");
                        _message = _message.replace(/&1/g, material);
                        _message = _message.replace(/&2/g, batch);
                        _message = _message.replace(/&3/g, _total);
                        e.getSource().setValueStateText(_message);
                        var c = this.getModel("subconModel").getProperty("/itemsChangedError");
                        b.index = index;
                        b.isErrDelQty = true;
                        let flagCheck = false;
                        let i = 0;
                        c.forEach(item => {
                            if (item.index == b.index) {
                                flagCheck = true;
                                c[i] = b;
                            }
                            i = i + 1;
                        });
                        if (flagCheck == false) {
                            c.push(b);
                        }
                        if (c.length < 1) {
                            c.push(b);
                        }

                        this.getModel("subconModel").setProperty("/itemsChangedError", c);
                    }
                    else {
                        e.getSource().setValueState(ValueState.None);
                        this.getModel("subconModel").setProperty(a.sPath + "/SHIP_TO", e.getParameter("value"));
                        var c = this.getModel("subconModel").getProperty("/itemsChangedError");
                        b.index = index;
                        b.isErrDelQty = false;
                        let flagCheck = false;
                        let i = 0;
                        c.forEach(item => {
                            if (item.index == b.index) {
                                flagCheck = true;
                                c[i] = b;
                            }
                            i = i + 1;
                        });
                        if (flagCheck == false) {
                            c.push(b);
                        }
                        if (c.length < 1) {
                            c.push(b);
                        }
                        this.getModel("subconModel").setProperty("/itemsChangedError", c);
                    }
                }
            }
        },
        fnReGenerateOdataSet: function (headerData, itemsData, headerSubData, itemsSubData) {
            let arrFieldsSet = [];
            var subMappingHdr = [];
            for (let a = 0; a < itemsData.length; a++) {
                let i = 0;
                var data = new Array();
                var data_2 = new Array();
                headerData.forEach(oHeader => {
                    i = i + 1;
                    let j = oHeader.HeaderName;
                    let c = "Col" + oHeader.HeaderIndex;
                    data[j] = itemsData[a][c].trimStart();
                    //get sub header data.
                    if (i == 1) {
                        //Traffic light
                        data_2[j] = headerSubData[0].HeaderValue;
                        subMappingHdr[c] = j;
                    }
                    else if (i >= 6 && i < 18) {
                        let h = i - 5;
                        data_2[j] = headerSubData[h].HeaderValue;
                        subMappingHdr[c] = j;
                    }
                    else if (i >= 18) {
                        //let h = i - 8;
                        switch (i) {
                            case 18:
                                j = "IsMain";
                                data[j] = itemsData[a][j];
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;
                            case 19:
                                j = "RootId";
                                data[j] = itemsData[a][j].trimStart();
                                data_2[j] = 99;
                                subMappingHdr[c] = j;
                                break;
                            case 20:
                                j = "ParentId";
                                data[j] = itemsData[a][j].trimStart();
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;
                           case 21:
                                j = "MainIndex";
                                data[j] = itemsData[a][j];
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;   
                            case 22:
                                j = "HeaderIndex";
                                data[j] = itemsData[a][j];
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;      
                            case 23:
                                j = "ItemsIndex";
                                data[j] = itemsData[a][j];
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;      
                            case 24:
                                j = "EditDelQty";
                                data[j] = itemsData[a][j];
                                data_2[j] = j;
                                subMappingHdr[c] = j;
                                break;                  
                        }
                    }
                });
                // one row of main item data
                arrFieldsSet.push(data);
                // sub-header label
                arrFieldsSet.push(data_2);
                //based on main row to collect all the sub-item along with.               
                for (let s = 0; s < itemsSubData.length; s++) {
                    var data_3 = new Array();
                    let y = false;
                    headerSubData.forEach(oHeader => {
                        let c = "Col" + oHeader.MainPosition;
                        if (data["RootId"] == itemsSubData[s]["ParentId"]) {
                            data_3[subMappingHdr[c]] = itemsSubData[s][c].trimStart();
                            let g = "";
                            switch (oHeader.MainPosition) {
                                case 18:
                                    g = "IsMain";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                    break;
                                case 19:
                                    g = "RootId";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g].trimStart();
                                    break;
                                case 20:
                                    g = "ParentId";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g].trimStart();
                                    break;
                                 case 21:
                                    g = "MainIndex";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                    break;
                                  case 22:
                                    g = "HeaderIndex";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                    break;
                                  case 23:
                                    g = "ItemsIndex";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                    break;     
                                 case 24:
                                    g = "EditDelQty";
                                    data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                    break;            
                            }
                            y = true;
                        }
                    })
                    // debugger;
                    if (y == true)
                        arrFieldsSet.push(data_3);
                }
            }
            return arrFieldsSet;
        },

        onRowSelectionChange: function (oEvent) {
            if (oEvent.getSource().getSelectedIndices().length >= 1) {
                this.getModel("subconModel").setProperty("/createEnable", true);
                this.getModel("subconModel").setProperty("/bDisplayEnable", true);
                var aItemsSelected = this._oUIDynamicTable.getSelectedIndices();
                let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts();
                for (let sIndex in aTableContext) {
                    sIndex = parseInt(sIndex);
                    aItemsSelected.forEach(_aIndex => {
                        if (sIndex == _aIndex) {
                            if (aTableContext[sIndex].getObject()['IsMain'] == true) {
                                //this._oUIDynamicTable.setSelectionInterval(sIndex, sIndex)
                                //set selection for all of child row.
                                 // sub-item data
      /*                          for(let i = sIndex + 1; i < aTableContext.length; i++ ){
                                let b = aTableContext[i].getObject();
                                if(b['ParentId'] == aTableContext[sIndex].getObject()['RootId'] && b['IsMain'] == false){
                                    this._oUIDynamicTable.setSelectedIndex(i)
                                }
                               } */
                            }
                        }
                    })
                }
            }
            else {
                this.getModel("subconModel").setProperty("/createEnable", false);
                this.getModel("subconModel").setProperty("/bDisplayEnable", false);
            }
        },
        onCrtDlvr: function (oEvent) {
            var _payload_deep_rt = this.fnBuildDeepentity();
            var aItems = this._oUIDynamicTable.getSelectedIndices();
            var aTblItemSet = this.getModel("subconModel").getProperty("/ItemsSet");
            //debugger;
            var k = this.getModel("subconModel").getProperty("/itemsChangedError");
            let flagCheck = false;
            let _message = "";
            let _aMessage = [];
            if (k.length > 0) {
                flagCheck = false;
                for (let a = 0; a < k.length; a++) {
                    
                    if (k[a]["isErrDelQty"] == true) {
                        flagCheck = true;
                        _message = this.getResourceBundle().getText("dialog.error.validation.itemDelQty");
                        let material = aTblItemSet[k[a]["index"]]["COMP_DESCR"];
                        let batch = aTblItemSet[k[a]["index"]]["STOCK_SUPP"];
                        let _stock = parseFloat(aTblItemSet[k[a]["index"]]["STOCK"]);
                        let _sum_hu = 0;
                        let _total = _stock + _sum_hu;
                        _message = _message.replace(/&1/g, material);
                        _message = _message.replace(/&2/g, batch);
                         _message = _message.replace(/&3/g, _total);
                         _aMessage.push(_message);
                       // break;
                    }
                };
                if (flagCheck == true) {
                    _message = this.getResourceBundle().getText("dialog.error.validation.input.itemDelQty"); 
                    this.showMultileLineWarningMessageBox(_message,_aMessage,"E");
                   // this._fnHandleErrorExe(_message);
                    return;
                }
            }
            var deepDynamicTable = this.getModel("subconModel").getProperty("/deepDynamicTable");

            let i = 0;
            let _CheckQty = false;
             _aMessage = [];
            for (let k = 0; k < aItems.length; k++) {
                var data1 = {};
                //main item data
                var rowData = aTblItemSet[aItems[k]];
                deepDynamicTable.Header.forEach(ocolumn => {
                    i = i + 1;
                    var c = "Col" + ocolumn.HeaderIndex;
                  
                    if (parseInt(ocolumn.HeaderIndex) >= 18){
                      data1[ocolumn.HeaderName] =  aTblItemSet[aItems[k]][ocolumn.HeaderName];
                    }
                    else{
                          data1[c] = aTblItemSet[aItems[k]][ocolumn.HeaderName];
                    }
                       
                });
                //Add MainIndex,HeaderIndex,ItemIndex.
                _payload_deep_rt._ItemsNav.push(data1);
                // sub-item data
                aTblItemSet.forEach(_rowData => {
                    let data1 = {};
                    let _CheckQty = false;
                    if (_rowData.ParentId == rowData.RootId && rowData.RootId != 99) {
                        deepDynamicTable.Header.forEach(ocolumn => {
                            i = i + 1;
                            var c = "Col" + ocolumn.HeaderIndex;                      
                            if (parseInt(ocolumn.HeaderIndex) >=18)
                            {
                                data1[ocolumn.HeaderName] = _rowData[ocolumn.HeaderName];                            
                            }
                            else{
                                 if(ocolumn.HeaderName == "SHIP_TO"){                               
                                   if(parseFloat(_rowData[ocolumn.HeaderName])>=1 && _rowData["EditDelQty"] == true && _rowData["PO_NO"] ==""){
                                     _CheckQty = true;
                                   }
                                }                                
                                data1[c] = _rowData[ocolumn.HeaderName];                            
                            }                          
                        });
                        if(_CheckQty == true){
                             _payload_deep_rt._ItemsNav.push(data1);    
                            }
                                          
                    }
                })
            }
            if(_payload_deep_rt._ItemsNav.length < 2){
               _payload_deep_rt._ItemsNav = []; 
                _message = this.getResourceBundle().getText("dialog.error.validation.input.itemDelQty"); 
               this._fnHandleErrorExe(_message);
               return;

            }
            _payload_deep_rt._HeaderNav = deepDynamicTable.Header;
            _payload_deep_rt.RunMode = "C";
            if (_payload_deep_rt._ItemsNav.length > 0 ) {
                this.setBusy(true);
                this.getService().postProcessCreateDeepEntity(_payload_deep_rt).then(function (aData) { // debugger;
                    this.setBusy(false);
                    //update data and status
                    //Display message
                    let _aMessage = aData._Message;
                    let _messageType = _aMessage[0].MsgType;
                    let _message = "";
                    if(_messageType=="S")
                    {
                     _message = this.getResourceBundle().getText("dialog.success.create.delivery.complete");
                    }
                    else{
                         _message = this.getResourceBundle().getText("dialog.error.create.delivery.complete");
                    }
                    this.showMultileLineSuccessMessageBox(_message,_aMessage,_messageType);
                    //process to update back mainscreen
                   let _aODataDeepTable = this._fnBuildDeepDynamicTable(aData);
                   if(_aODataDeepTable.Items.length > 0 && _messageType=="S"){
                        var _dataMainItemSet = this._fnGenerateDataSet(_aODataDeepTable); 
                        let i = 0;
                        for (let k = 0; k < _dataMainItemSet.length; k++) {
                            var rowMainData = {};
                            //main item data
                            var rowDataNew = _dataMainItemSet[k];
                            for(let y =0; y< aTblItemSet.length; y++){
                                if(rowDataNew["IsMain"]==true && rowDataNew["RootId"] == aTblItemSet[y]["RootId"] ){
                                   // rowMainData = aTblItemSet[y];
                                    //Process update data for main item
                                        aTblItemSet[y]["TRAFF_LGT"] = rowDataNew["TRAFF_LGT"];
                                        aTblItemSet[y]["STOCK"] = rowDataNew["STOCK"];
                                        aTblItemSet[y]["SUM_HU"] = rowDataNew["SUM_HU"];
                                        aTblItemSet[y]["STOCK_SUPP"] = rowDataNew["STOCK_SUPP"];
                                        aTblItemSet[y]["DEMAND"] = rowDataNew["DEMAND"];
                                        aTblItemSet[y]["SHIP_TO"] = rowDataNew["SHIP_TO"];
                                        
                                    break;
                                }
                            }
                            // sub-item data
                            aTblItemSet.forEach((_rowData,oIndex) => {
                                //let data1 = {};
                                if (_rowData.ParentId == rowDataNew.ParentId && rowDataNew.RootId != 99 && rowDataNew["IsMain"]==false
                                    && _rowData.MainIndex == rowDataNew.MainIndex  && _rowData.HeaderIndex == rowDataNew.HeaderIndex
                                    && _rowData.ItemsIndex == rowDataNew.ItemsIndex && _rowData["IsMain"]==false
                                ) {
                                    // process update for sub-item
                                            aTblItemSet[oIndex]["TRAFF_LGT"] = rowDataNew["TRAFF_LGT"];
                                            aTblItemSet[oIndex]["STOCK"] = rowDataNew["STOCK"];
                                            aTblItemSet[oIndex]["SUM_HU"] = rowDataNew["SUM_HU"];
                                            aTblItemSet[oIndex]["STOCK_SUPP"] = rowDataNew["STOCK_SUPP"];
                                            aTblItemSet[oIndex]["DEMAND"] = rowDataNew["DEMAND"];
                                            aTblItemSet[oIndex]["SHIP_TO"] = rowDataNew["SHIP_TO"];
                                            aTblItemSet[oIndex]["PO_NO"]   = rowDataNew["PO_NO"];
                                }
                            })
                        }
                        //binding new data to table
                        this.getModel("subconModel").setProperty("/ItemsSet",aTblItemSet);
                        this._oUIDynamicTable.getModel("subconModel").refresh(true)
                   }                 
                }.bind(this), function (oError) {
                    this.setBusy(false);
                    this._fnHandleErrorExe();

                }.bind(this));
            } else {
               this._fnHandleErrorExe(this.getResourceBundle().getText("dialog.infor.nodata.selected"));
            }
        },
       
        fnBuildDeepentity: function () {
            // Call expand query for dynamic table.
            var _payload_deep_rt = {
                MainId: 1,
                Title: "",
                RunMode: "C",
                Plant: "",
                ShipPoint: "",
                WareHouNo: "",
                Skip: 0,
                Top: 0,
                _HeaderNav: [],
                _ItemsNav: [],
                _VendorNav: [],
                _PurOrdNav: [],
                _ReqDatNav: [],
                _StorTyNav: [],
                _StorBiNav: [],
                _AssePrNav: [],
                _CompoNav: [],
                _Message:[]
            };
            var _filterCondData = this.getOwnerComponent().getModel("filterCondData").getData();
            _payload_deep_rt.Plant = _filterCondData.Plant;
            _payload_deep_rt.ShipPoint = _filterCondData.ShippingPoint;
            _payload_deep_rt._VendorNav = _filterCondData.Vendor;
            _payload_deep_rt._PurOrdNav = _filterCondData.PurOrder;
            _payload_deep_rt._ReqDatNav = _filterCondData.RequestDate;
            _payload_deep_rt.WareHouNo = _filterCondData.WareHouse;
            _payload_deep_rt._StorTyNav = _filterCondData.Stor_Type;
            _payload_deep_rt._StorBiNav = _filterCondData.Stor_Bin;
            _payload_deep_rt._AssePrNav = _filterCondData.Assembly_Prod;
            _payload_deep_rt._CompoNav = _filterCondData.Component;
            _payload_deep_rt.Top = this._isSizeLimit;
            return _payload_deep_rt;
        },
        onStockOvr:  function(oEvent){
              var aItemsSelected = this._oUIDynamicTable.getSelectedIndices();
              let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts();
              aItemsSelected =  aItemsSelected[0];
              var _filterCondData = this.getOwnerComponent().getModel("filterCondData").getData();
              let _Plant = _filterCondData.Plant;
              let oSelTableRow = aTableContext[aItemsSelected].getObject();
              let _oSemanticObj = "#Material-displayStockOverviewInWebGUI?sap-ui-tech-hint=GUI&";
              let _para1 = "Material=&1"
              let _para2 = "Plant=&2"
              let _execCommand = ";DYNP_OKCODE=ONLI";
             _para1 = _para1.replace(/&1/g, oSelTableRow["COMPONENT"]);
             _para2 = _para2.replace(/&2/g, _Plant);
              let _fullURL =  this._startUpParemeters._navURL + _oSemanticObj + _para1 + ";" + _para2 + _execCommand;
              let _intExt = true;
              sap.m.URLHelper.redirect(_fullURL,_intExt);   
           
        },
        onStockOrRqmts:  function(oEvent){
           var aItemsSelected = this._oUIDynamicTable.getSelectedIndices();
              let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts();
              aItemsSelected =  aItemsSelected[0];
              var _filterCondData = this.getOwnerComponent().getModel("filterCondData").getData();
              let _Plant = _filterCondData.Plant;
              let oSelTableRow = aTableContext[aItemsSelected].getObject();
              let _oSemanticObj = "#MRPMaterial-monitorSupplyAndDemand?sap-ui-tech-hint=GUI&";
               let _para1 = "Material=&1"
              let _para2 = "MRPPlant=&2"
              let _para3 = "MRPArea=&3"
             // let _execCommand = ";DYNP_OKCODE=ENTR";
             _para1 = _para1.replace(/&1/g, oSelTableRow["COMPONENT"]);
             _para2 = _para2.replace(/&2/g, _Plant);
             _para3 = _para3.replace(/&3/g, _Plant);
              let _fullURL =  this._startUpParemeters._navURL + _oSemanticObj + _para1 + ";" + _para2 +  ";" + _para3 ;
              let _intExt = true;
              // debugger
              sap.m.URLHelper.redirect(_fullURL,_intExt);    
            },

            fnNavigatetoExternalApp: function(sSemanticObject,sAction,oNavigationParams){
                 var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                  // Generate the URL hash for the target app
                var sHash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: sSemanticObject,
                        action: sAction
                    },
                    params: oNavigationParams
                })) || "";

                // Check if hash was generated successfully
                    if (sHash) {
                        // Construct the full URL
                        var sBaseUrl = window.location.href.split('#')[0];
                        var sFullUrl = sBaseUrl + sHash;

                        // Open in a new tab (second parameter set to true)
                        sap.m.URLHelper.redirect(sFullUrl, true);
                    } else {
                        // Handle error or inform user
                        sap.m.MessageToast.show("Navigation service is not available.");
                    }
            }
        });
});

