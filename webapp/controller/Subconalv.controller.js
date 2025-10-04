sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    'sap/ui/core/library',
    '../util/Formatter',
     "../custom/Input"
], function (JSONModel, Base, coreLibrary,Formatter,Input) {
    "use strict";
    var ValueState = coreLibrary.ValueState;
    return Base.extend("com.bosch.rb1m.sd.sdsubcontr.controller.Subconalv", {
            onInit: function () {
                Base.prototype.onInit.apply(this);
                this.oSemanticPage = this.byId("idObjectPage");      
                this.fnInitializeSettingsModel();
                this._oUIDynamicTable = this.byId("tblsubcon");
                this._oUIDynamicTable.bindRows("subconModel>/ItemsSet");      
               // this._oUIDynamicTable.setVisibleRowCount(1000);     
                this.getRouter().getRoute("Subconalv").attachMatched(this.onRouteMatched, this);
            },
            /* Settings Model */
            fnInitializeSettingsModel: function () { // debugger;
                var oSettingsModel = new JSONModel({
                    languages: [],
                    RowsHeader: [],
                    RowsItems: [],   
                    ItemsSet:[],        
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
                    bDisplayEnable: true,
                    itemsChangedError: [],
                    isErrDelQty: false
                });
                this.setModel(oSettingsModel, "subconModel");
            },
            onRouteMatched: function () {                     
                var a = this.getOwnerComponent().getModel("filterCondData").getData();
                this.onLoadData(a);
            },
            onLoadData: function (oData) {
                this.getModel("subconModel").setProperty("/itemsChangedError", []);
                this.getModel("subconModel").setProperty("/deepDynamicTable", []);
                this.getModel("subconModel").setProperty("/ItemsSet", []);
                var _payload_deep_rt = this.fnBuildDeepentity();
                // var _jSonObj =  JSON.stringify(_payload_deep_rt);
                _payload_deep_rt.RunMode = "R";
                
                 var deepDynamicTable = {
                    Header: [],
                    Items: [],
                    SubHeader: [],
                    SubItems:[]
                };
                // debugger;
                this.setBusy(true);
                  this.getService().queryProcessDeepEntity(_payload_deep_rt).then(function (aData) {    
                    if(aData._HeaderNav){
                        if(aData._HeaderNav.length > 0){
                           aData._HeaderNav.forEach(eHeaderNav => {
                             if(eHeaderNav.IsMain == true){
                                deepDynamicTable.Header.push(eHeaderNav);
                             }
                             else{
                                deepDynamicTable.SubHeader.push(eHeaderNav);
                             }
                           }); 
                        }
                    }                
                    if(aData._ItemsNav){
                        if(aData._ItemsNav.length > 0){
                           aData._ItemsNav.forEach(eItemsNav => {
                             if(eItemsNav.IsMain == true){
                                deepDynamicTable.Items.push(eItemsNav);
                             }
                             else{
                                deepDynamicTable.SubItems.push(eItemsNav);
                             }
                           }); 
                        }
                    }   
                    this.getModel("subconModel").setProperty("/deepDynamicTable", deepDynamicTable);
                    this.fnBuildDynamicTableData(deepDynamicTable);
                    this.setBusy(false);
                // create mock sample
                }.bind(this), function (oError) {
                    this.setBusy(false);
                    this._fnHandleErrorExe();

                }.bind(this));  
                //Call mock data
                // this.fnCreateMockData();
            },

             _fnHandleErrorExe: function (_aMessage) { 
                this.setBusy(false);
                var _message = "";
                if (_aMessage) {
                    _message = _aMessage;
                } else {
                    _message = this.getResourceBundle().getText("dialog.error.load_data.failed");
                }
                sap.m.MessageBox.show(_message, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                });
            },
            _fnHandleSuccessExe: function (_aMessage) {
            this.setBusy(false);
            var _message = "";
            if (_aMessage) {
                _message = _aMessage;
            } else {
                _message = this.getResourceBundle().getText("dialog.success.create.delivery.complete");
            }

            sap.m.MessageBox.show(_message, {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Success"
            });
            this._oUIDynamicTable.getModel("subconModel").refresh(true)
        },
             fnBuildDynamicTableData: function (oData) {
                    if (oData.Header.length === 0 || oData.Items.length === 0) {
                        return;
                    }
                    var aData = oData.Items;
                    var aHeader = oData.Header;
                    var aHeaders = [];
                    var aRows = [];
                    var aSubHeaders = oData.SubHeader;
                    var aRowsSub = oData.SubItems;

                    aHeaders = aHeader;
                    for (var i = 0; i < aData.length; i++) {
                        aRows.push(aData[i]);
                    }
                    
                    var oTable = {
                        "headerDetails": aHeaders,
                        "rowDetails": aRows
                    };
                    var _dataMainItemSet = this.fnReGenerateOdataSet(aHeaders,aRows,aSubHeaders,aRowsSub);
                    this.getModel("subconModel").setProperty("/ItemsSet", _dataMainItemSet);
                    this._oUIDynamicTable.setVisibleRowCount(_dataMainItemSet.length)
                    this._fnBuildTable(oTable);
                },
                _fnBuildTable: function (aTableData) {
                    this._oUIDynamicTable.destroyColumns();
                    var _aFixedColumn = aTableData.headerDetails
                    for (var t = 0; t < _aFixedColumn.length; t++) {                        
                      var a = "{subconModel>" + _aFixedColumn[t].HeaderName + "}";
                      var b = "subconModel>" + _aFixedColumn[t].HeaderName ;
                      let s ;
                      if( t===0 ){
                           s = new sap.ui.table.Column({
                            width: "3rem",
                            label: new sap.m.Label(
                                {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                            ),                            
                              template: new sap.ui.core.Icon({
                                 src: {
                                   path: b,  
                                   formatter: function(v){
                                      return Formatter.statusIcon(v);   
                                    }
                                    }, 
                                 size: "1rem",
                                 color: {
                                   path: b,  
                                   formatter: function(v){
                                      return Formatter.statusColor(v);   
                                    }
                                    }, 
                                 tooltip:  {
                                   path: b,  
                                   formatter: function(v){
                                      return Formatter.statusText(v);   
                                    }
                                    }  
                             })
                        });
                         this._oUIDynamicTable.addColumn(s)
                      }
                      else{
                           switch(_aFixedColumn[t].HeaderName){
                            case "IsMain":
                                // code block
                                s = new sap.ui.table.Column({
                                width: "auto",
                                 visible: false,
                                label: new sap.m.Label(
                                    {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                                ),
                                template: new sap.m.Text(
                                    {text: a}
                                )
                               });
                                break;
                            case "RootId":
                                // code block
                                s = new sap.ui.table.Column({
                                width: "100%",
                                 visible: false,
                                label: new sap.m.Label(
                                    {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                                ),
                                template: new sap.m.Text(
                                    {text: a}
                                )
                               });
                                break;
                            case "ParentId":
                                // code block
                                s = new sap.ui.table.Column({
                                width: "100%",
                                visible: false,
                                label: new sap.m.Label(
                                    {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                                ),
                                template: new sap.m.Text(
                                    {text: a}
                                )
                               });
                                break;    
                            default:
                                // code block
                                let _width = "";
                                if(t >= 8){
                                    _width = "6rem"
                                }
                                else{
                                    _width = "6rem"
                                }
                                switch(_aFixedColumn[t].HeaderName){
                                     case "COMPONENT":
                                        _width = "6.5rem"
                                        break;
                                     case "STOCK":
                                        _width = "5rem"
                                        break;
                                     case "UOM":
                                        _width = "5rem"
                                        break;
                                     case "SUM_HU":
                                        _width = "5rem"
                                        break;
                                     case "STOCK_SUPP":
                                        _width = "5rem"
                                        break;
                                     case "BEN":
                                        _width = "5rem"
                                        break;
                                     case "DEMAND":
                                        _width = "4.5rem"
                                        break;
                                     case "SHIP_TO":
                                        _width = "7rem"
                                        break;
                                }
                                if(_aFixedColumn[t].HeaderName != "SHIP_TO"){
                                    s = new sap.ui.table.Column({
                                        width: _width,
                                        label: new sap.m.Label(
                                            {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                                        ),
                                        template: new sap.m.Text(
                                            {
                                                text: a
                                            }
                                        )
                                    });
                                }
                                else{
                                    s = new sap.ui.table.Column({
                                        width: _width,
                                        label: new sap.m.Label(
                                            {text: _aFixedColumn[t].HeaderValue, tooltip: _aFixedColumn[t].HeaderValue}
                                        ),
                                        template: new Input(
                                            {
                                                value: {
                                                        parts: [
                                                            { path:b },
                                                            { path:'subconModel>IsMain'},
                                                        ],
                                                        formatter : function(n,l) {
                                                            return Formatter.fnFormatNumeric(n,l);
                                                        }
                                                    },
                                                type: {
                                                        parts: [
                                                            { path:b },
                                                            { path:'subconModel>IsMain'},
                                                        ],
                                                        formatter : function(n,l) {
                                                            return Formatter.fnFormatType(n,l);
                                                        }
                                                    },   
                                                editable: false,
                                                liveChange: function (e) {
                                                    Formatter._fnValidateNumber(e);
                                                    }.bind(this),
                                                submit: function (e) {
                                                     this._fnCheckQty(e);
                                                }.bind(this) ,
                                                maxLength: 6  ,
                                                inputColorMode: {
                                                    normal: "#f7f7f7",                                                
                                                    edit: "#ffffff",
                                                    fixed: "#e8eff6"
                                                }
                                            }
                                        )
                                    });
                                }                     
                           } 

                         this._oUIDynamicTable.addColumn(s)
                      }                                         
                    }         
                      // Attach the updateFinished event
                    var that = this;
                    this._oUIDynamicTable.addDelegate({
                            onAfterRendering: function (oEvt) {                         
                                var oData = that.getModel("subconModel").getProperty("/ItemsSet");
                                var count = oData.length;
                                for (var i = 0; i < count; i++) {     
                                    var selectedRow = that._oUIDynamicTable.getRows()[i];                             
                                    var columId = "#" + this.getId() + "-rowsel" + i;                                
                                    if(oData[i]["IsMain"] != true){
                                        $(columId).addClass("hideCheckbox");
                                        if( oData[i]["IsMain"] ){
                                            if(oData[i]["RootId"] == 99){

                                                for(let v =8 ; v<=16; v++){                                           
                                                    let columId_hdr = "#" + this.getId() + "-rows-row" + i + "-col" + v;
                                                    $(columId_hdr).addClass("subHeader");
                                                }  
                                               // console.log(oData[i]["IsMain"]);
                                                // console.log(selectedRow.getCells());
                                                selectedRow.getCells()[16].setProperty("editable", false);
                                            }  
                                            else{
                                                selectedRow.getCells()[16].setProperty("editable", true);  
                                            }
                                        }                                         
                                        else{
                                           // debugger;
                                            selectedRow.getCells()[16].setProperty("editable", true); 
                                        }
                                    }                                                                                                           
                                 }
                              },
                        }, this._oUIDynamicTable);     

                        this._oUIDynamicTable.setFixedColumnCount(5);
                       
                },       
                   
                _fnCheckQty:function(e){
                    //debugger;
                    if(e.getParameter("value")){
                        if(e.getParameter("value").length > 0){
                            let a = e.getSource().getParent().getRowBindingContext();
                            let index = a.sPath.split("/")[2];
                            let _rowData = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts()[index].getObject();
                            let _currInput = e.getParameter("value");//parseFloat
                            _currInput = parseFloat(_currInput);
                            let _stock = parseFloat(_rowData["STOCK"]);
                            let _sum_hu = parseFloat(_rowData["SUM_HU"]);
                            let _total = _stock + _sum_hu;
                            if( _currInput > _total){
                                //raise error
                                e.getSource().setValueState(ValueState.Error);
                                let material = _rowData["COMP_DESCR"];
                                let batch = _rowData["STOCK_SUPP"];
                                let _message = this.getModel("i18n").getProperty("dialog.error.validation.itemDelQty");
                                _message = _message.replace(/&1/g, material);
                                 _message = _message.replace(/&2/g, batch);
                                e.getSource().setValueStateText(_message);
                                 var c = this.getModel("dataModel").getProperty("/itemsChangedError");
                                    b.index = idx;
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
                            else{
                                e.getSource().setValueState(ValueState.None);
                                this.getModel("subconModel").setProperty(a.sPath + "/SHIP_TO", e.getParameter("value"));
                               var c = this.getModel("dataModel").getProperty("/itemsChangedError");
                                    b.index = idx;
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

                } ,
                fnReGenerateOdataSet : function(headerData,itemsData,headerSubData,itemsSubData){
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
                            data[j] = itemsData[a][c];
                           //get sub header data.
                             if(i == 1)
                            {
                                //Traffic light
                                data_2[j] = headerSubData[0].HeaderValue;
                                subMappingHdr[c] = j;
                            }
                            else if(i >= 9 && i<18 ){
                                let h = i - 8;
                                 data_2[j] = headerSubData[h].HeaderValue;
                                 subMappingHdr[c] = j;
                            }
                            else if( i>=18){
                                 //let h = i - 8;
                                 switch ( i )
                                 {
                                    case 18:
                                         j = "IsMain";
                                         data[j] = itemsData[a][j];
                                         data_2[j] = j;
                                         subMappingHdr[c] = j;
                                        break;
                                    case 19:
                                         j = "RootId";
                                         data[j] = itemsData[a][j];
                                         data_2[j] = 99;
                                         subMappingHdr[c] = j;
                                        break;
                                    case 20:  
                                         j = "ParentId";
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
                                 if(data["RootId"] == itemsSubData[s]["ParentId"]){
                                     data_3[subMappingHdr[c]] = itemsSubData[s][c];
                                     let g = "";
                                      switch ( oHeader.MainPosition )
                                        {
                                            case 18:
                                                 g = "IsMain";
                                                data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                                break;
                                            case 19:
                                                g = "RootId";
                                                data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                                break;
                                            case 20:  
                                                g = "ParentId";
                                                data_3[subMappingHdr[c]] = itemsSubData[s][g];
                                            break;  
                                        }                                       
                                     y = true;
                                 }                                                               
                              })
                           // debugger;
                          if(y == true)  
                          arrFieldsSet.push(data_3); 
                        }
                    }
                    return arrFieldsSet;
                } ,            
              
            onRowSelectionChange:function(oEvent){
                 if (oEvent.getSource().getSelectedIndices().length >= 1) {
                    this.getModel("subconModel").setProperty("/createEnable", true);
                    this.getModel("subconModel").setProperty("/bDisplayEnable", true);
                   // var aItemsSelected = this._oUIDynamicTable.getSelectedIndices();
                    //let aTableContext = this._oUIDynamicTable.getBinding('rows').getAllCurrentContexts();
/*                     for (let sIndex in aTableContext) {
                          sIndex = parseInt(sIndex);
                          aItemsSelected.forEach(_aIndex=>{
                            if(sIndex == _aIndex ){
                                if( aTableContext[sIndex].getObject()['IsMain'] != true){
                                   // this._oUIDynamicTable.removeSelectionInterval(sIndex,sIndex)
                                }
                            }                             
                          })                     
                    } */
                } 
                else{
                    this.getModel("subconModel").setProperty("/createEnable", false);
                    this.getModel("subconModel").setProperty("/bDisplayEnable", true);
                }
            } ,
            onCrtDlvr: function () {
               var _payload_deep_rt = this.fnBuildDeepentity();
                var aItems = this._oUIDynamicTable.getSelectedIndices();
                var aTblItemSet = this.getModel("subconModel").getProperty("/ItemsSet");
                //debugger;
                var k = this.getModel("subconModel").getProperty("/itemsChangedError");
                let flagCheck = false;
                let _message = "";
                if (k.length > 0) {
                    for (let a = 0; a < k.length; a++) {
                        flagCheck = false;
                        if (k[a]["isErrDelQty"] == true) {
                            flagCheck = true;
                            _message = this.getResourceBundle().getText("dialog.error.validation.itemDelQty");                    
                            break;  
                        }
                    };
                    if (flagCheck == true) {
                        return;
                    }
                }
                var deepDynamicTable = this.getModel("subconModel").getProperty("/deepDynamicTable");
                
                let i = 0;
                for (let k = 0; k < aItems.length; k++) {
                    var data1 = {};
                   //main item data
                    var rowData = aTblItemSet[aItems[k]];
                    deepDynamicTable.Header.forEach(ocolumn => {
                        i = i + 1;
                        var c = "Col" + ocolumn.HeaderIndex;                    
                        data1[c] = aTblItemSet[aItems[k]][ocolumn.HeaderName];
                         if(parseInt(ocolumn.HeaderIndex)>17)
                         data1[c] =  "" ;   
                    });
                    _payload_deep_rt._ItemsNav.push(data1);
                    // sub-item data
                    aTblItemSet.forEach(_rowData=>{
                        let data1 = {};
                        if(_rowData.ParentId == rowData.RootId && rowData.RootId != 99){
                             deepDynamicTable.Header.forEach(ocolumn => {
                                i = i + 1;
                                var c = "Col" + ocolumn.HeaderIndex;                    
                                data1[c] = _rowData[ocolumn.HeaderName];
                                if(parseInt(ocolumn.HeaderIndex)>17)
                                 data1[c] =  "" ;   
                            });

                         _payload_deep_rt._ItemsNav.push(data1);
                        }
                    })
                }
                _payload_deep_rt._HeaderNav = deepDynamicTable.Header;
                _payload_deep_rt.RunMode = "C";

                if (_payload_deep_rt._ItemsNav.length > 0) {
                    this.setBusy(true);
                    this.getService().postProcessCreateDeepEntity(_payload_deep_rt).then(function (aData) { // debugger;
                        this.setBusy(false);
                        //update data and status
                        //Display message
                        let  _message = this.getResourceBundle().getText("dialog.success.create.delivery.complete");
                        let _doNumber = "12999999";
                        _message = _message.replace(/&1/g, _doNumber);
                        this._fnHandleSuccessExe(_message);
                    }.bind(this), function (oError) {
                        this.setBusy(false);
                        this._fnHandleErrorExe();

                    }.bind(this));
                } else {
                    MessageToast.show(this.getResourceBundle().getText("dialog.infor.nodata.selected"));
                }
            },    
              fnBuildDeepentity: function () { 
                    // Call expand query for dynamic table.
                    var _payload_deep_rt = {
                        MainId: 1,
                        Title: "",
                        RunMode: "C",
                        Plant:"",
                        ShipPoint:"",
                        WareHouNo:"",
                        _HeaderNav: [],
                        _ItemsNav:  [],
                        _VendorNav: [],
                        _PurOrdNav: [],
                        _ReqDatNav: [],
                        _StorTyNav: [],
                        _StorBiNav: [],
                        _AssePrNav: [],
                        _CompoNav: []
                    };
                    var _filterCondData = this.getOwnerComponent().getModel("filterCondData").getData();
                    _payload_deep_rt.Plant =  _filterCondData.Plant;
                    _payload_deep_rt.ShipPoint =  _filterCondData.ShippingPoint;
                    _payload_deep_rt._VendorNav =  _filterCondData.Vendor;
                    _payload_deep_rt._PurOrdNav =  _filterCondData.PurOrder;
                    _payload_deep_rt._ReqDatNav =  _filterCondData.RequestDate;
                    _payload_deep_rt.WareHouNo =  _filterCondData.WareHouse;
                    _payload_deep_rt._StorTyNav =  _filterCondData.Stor_Type;
                     _payload_deep_rt._StorBiNav =  _filterCondData.Stor_Bin;
                    _payload_deep_rt._AssePrNav =  _filterCondData.Assembly_Prod;
                    _payload_deep_rt._CompoNav =  _filterCondData.Component;
                return _payload_deep_rt;
            } ,  
           
});});
