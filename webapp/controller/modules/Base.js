sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../service/Service",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function (Controller, Service, MessageBox, History) {
	"use strict";
	let _oService = Service; // Service is shared between all controllers
	let _oRouteCallBack = {};
	return Controller.extend("com.bosch.rb1m.sd.sd_subcontr.controller.modules.Base", {
		_oStoredBeforeData: null,
		onInit:  function () {
			 _oService.init(this);
		},
		getService: function () {
			//debugger;
			return _oService;
		},

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		/*
			Set root view busy
		*/
		
		setBusy: function (bBusy) {
			this.getView().setBusy(bBusy);
		},

		setGlobalBusy: function (bBusy) {
			this.getOwnerComponent().getModel("screenModel").setProperty("/isBusy", bBusy);
		},

		// Set oData to null to prevent checking
		setBeforeData: function (oData) {
			if (oData) {
				this._oStoredBeforeData = Object.assign({}, oData);
			} else {
				this._oStoredBeforeData = null;
			}
		},
		checkIfWorkingDataChanged: function (oCurrentData) {
			if (!this._oStoredBeforeData) {
				return false;
			}

			return JSON.stringify(this._oStoredBeforeData) !== JSON.stringify(oCurrentData);
		},
			/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
			/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
			getResourceBundle: function () {
				return this.getModel("i18n").getResourceBundle();
			},
	
			/* Check phone device or not */
			isPhoneDevice: function () {
				return sap.ui.Device.system.phone;
			},
			// Warning message handling
			showMultileLineWarningMessageBox: function (sMainMessage, aErrorMessage,aErrorMesType) {
			if (!aErrorMessage || aErrorMessage.length === 0) {
				return;
			}

			// Build error message
			let sDetail = "";
			sDetail += "<ul>";
			for (let sMessage of aErrorMessage) {
				sDetail += `<li>${sMessage}</li>`
			}
			sDetail += "</ul>";
			if(aErrorMesType == "W"){
				MessageBox.warning((sMainMessage), {
				title: "Warning",
				details: sDetail
				});
			}
			else if(aErrorMesType == "E"){
				MessageBox.error((sMainMessage), {
				title: "Error",
				details: sDetail
				});
			}
			else{
				MessageBox.success((sMainMessage), {
				title: "Sucess",
				details: sDetail
				});
			}
			
		},
		 showMultileLineSuccessMessageBox: function (sMainMessage, aErrorMessage,_messageType) {
			if (!aErrorMessage || aErrorMessage.length === 0) {
				return;
			}

			// Build error message
			let sDetail = "";
			sDetail += "<ul>";
			for (let sMessage of aErrorMessage) {
				sDetail += `<li>${sMessage.MsgContent}</li>`
			}
			sDetail += "</ul>";
            if(_messageType == "S"){
                sap.m.MessageBox.success((sMainMessage), {
				title: "Success",
				details: sDetail
			    });
            }
            else{
               sap.m.MessageBox.error((sMainMessage), {
				title: "Error",
				details: sDetail
			    });
            }

		},
		 _fnHandleErrorExe: function (_aMessage) {
            this.setBusy(false);
            var _message = "";
            if (_aMessage.length > 0) {
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
            
        },
		fnSetBusyIndicatorOnDetailControls: function (oControl, bShowBusy) {
			if (oControl) {
				var iDelay = 0;
				if (!bShowBusy) {
					iDelay = 1000;
				}
				oControl.setBusyIndicatorDelay(iDelay).setBusy(bShowBusy);
			}
		},
		/* Check phone device or not */
		isPhoneDevice: function () {
			return sap.ui.Device.system.phone;
		},
		/* Check Desktop device or not */
		isDesktopDevice: function () {
			return sap.ui.Device.system.desktop;
		}
	});
});