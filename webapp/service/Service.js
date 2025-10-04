sap.ui.define([
], function () {
	"use strict";
	var _oController = null;
	var _oService = null;
	_oService = {
		init: function (oBaseController) {
			_oController = oBaseController;
		},

		postProcessCreateDeepEntity :function(oDeepEntityData)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				var sPath = "/xRB1MxSD_C_DYNTAB";
				var oListBinding = oModel.bindList(sPath); // Binding to the parent entity set
				var oContext = oListBinding.create(oDeepEntityData, {
					// Optional: specify a groupId for batch processing
					// groupId: "myChangeSet"
				});
				oContext.created().then(function() {
					// Success: Entity created successfully in the backend
					//sap.m.MessageToast.show("Deep entity created successfully!");
					 let oData = oContext.getObject();	
					resolve(oData);
				}).catch(function(oError) {
					// Error: Handle creation failure
					reject(oError);
					//sap.m.MessageBox.error("Error creating deep entity: " + oError.message);
				});
			});
		},
		queryProcessDeepEntity :function(aFilteroDeepEntityData)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				var sPath = "/xRB1MxSD_C_DYNTAB";
				var oListBinding = oModel.bindList(sPath); // Binding to the parent entity set
				var oContext = oListBinding.create(aFilteroDeepEntityData, {
					// Optional: specify a groupId for batch processing
					// groupId: "myChangeSet"
				});
				oContext.created().then(function() {
					// Success: Entity created successfully in the backend
					//sap.m.MessageToast.show("Deep entity created successfully!");
					 let oData = oContext.getObject();	
					resolve(oData);
				}).catch(function(oError) {
					// Error: Handle creation failure
					reject(oError);
					//sap.m.MessageBox.error("Error creating deep entity: " + oError.message);
				});
			});
		},
		getVendorSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_VENDOR",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter,                                    //vFilters - Dynamic Filters 
					// {                                         //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
					debugger;
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getPlantSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_PLANT",                         //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                    //vFilters - Dynamic Filters 
					 //{                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getShippingPointSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_SHIPPOINT",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                       //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getPONoSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_PURCORD",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                     //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getWareHNoSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_WAREHNO",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                       //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getStorTypSet: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_STORTYP",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                      //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
					debugger;
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getStorBinSet: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_STORBIN",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                     //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
					debugger;
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getAssePrdSet: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_ASSEPRD",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                      //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
					debugger;
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},
		getCompoSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//ListBinding
				var oListBinding = oModel.bindList(
					"/xRB1MxSD_C_COMPO",                              //sPath
					null,                                       //oContext
					null,                                       //vSorters - Dynamic Sorters 
					aFilter                                      //vFilters - Dynamic Filters 
					// {                                           //mParameters                   
					// 	"$expand": "navigationProperty",
					// 	"$select": "property1,property2"
					// }
				);
				//Fetching a List of Entities:
				oListBinding.requestContexts().then((oListContext) => {
					let oData = oListContext.map(rowContext => rowContext.getObject());	
					//Handle success
					resolve(oData);
					debugger;
				})
				.catch((oError) => {
					//Handle error
					reject(oError);
					debugger;
				});
			});
		},		
		oDataCreate: function (oModel, sPath, oDeepEntityData) {
			//oModel.create(sPath, oData, oSettings);
			//var oModel = this.getView().getModel(); // Assuming your OData V4 model is named 'oModel'
			var oListBinding = oModel.bindList(sPath); // Binding to the parent entity set

			var oContext = oListBinding.create(oDeepEntityData, {
				// Optional: specify a groupId for batch processing
				// groupId: "myChangeSet"
			});
		   oContext.created().then(function() {
				// Success: Entity created successfully in the backend
				//sap.m.MessageToast.show("Deep entity created successfully!");
				 let oData = oContext.getObject();	
				 resolve(oData);
			}).catch(function(oError) {
				// Error: Handle creation failure
				//sap.m.MessageBox.error("Error creating deep entity: " + oError.message);
				 reject(oError);
			});
		},
		showLocalErrorMessage: function (oError, fnError) {

			this.showMessageBox( fnError);
		},
		showMessageBox: function ( fnError) {
			sap.m.MessageBox.show(fnError, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error"
			}); 
		}
		
	}

	return _oService;

});