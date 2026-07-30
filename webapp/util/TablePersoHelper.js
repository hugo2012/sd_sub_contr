sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/CheckBox",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/SearchField",
	"sap/m/Toolbar",
	"sap/base/Log",
	"sap/m/Token",
	"sap/m/MultiInput",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
], function (
	BaseObject,
	JSONModel,
	Sorter,
	Filter,
	FilterOperator,
	Dialog,
	List,
	CustomListItem,
	HBox,
	VBox,
	CheckBox,
	Text,
	Label,
	Input,
	Button,
	Select,
	CoreItem,
	MessageBox,
	MessageToast,
	coreLibrary,
	IconTabBar,
	IconTabFilter,
	SearchField,
	Toolbar,
	Log,
	Token,
	MultiInput,
	SelectDialog,
	StandardListItem,
	OverflowToolbar,
	ToolbarSpacer,
	SegmentedButton,
	SegmentedButtonItem
) {
	"use strict";

	return BaseObject.extend("com.bosch.rb1m.sd.sd_subcontr.util.TablePersoHelper", {
		
		/* =========================================================== */
		/* Lifecycle / Initialization                                  */
		/* =========================================================== */

		constructor: function (oTable, aColumnConfig, avariants, sDefaultVariant) {
			this._oTable = oTable;
			this._aColumnConfig = aColumnConfig || [];
			this._stateModel = new JSONModel({
				columns: [],
				filter: [],
				sort: []
			});
			// set data for this._stateModel
			this._initDefaultState();
			var oPersoData = {};
			var _configCols = this._stateModel.getProperty("/columns");
			var _varColumns = avariants.state.Columns || [];

			_configCols.forEach(function (oConfigCol) {
				// Find the matching column configuration in the variant array by ID/Key
				var oMatchedVarCol = _varColumns.find(function (oVarCol) {
					return oVarCol.id === oConfigCol.id || oVarCol.key === oConfigCol.key;
				});

				if (oMatchedVarCol) {
					// Set visibility based on the variant state property
					oConfigCol.visible = oMatchedVarCol.visible;
				} else {
					// Fallback if column is not found in variant state (e.g., set to false or keep default)
					oConfigCol.visible = false; 
				}
			});

			// Notify the model that data has updated so the view refreshes
			//this._stateModel.setProperty("/columns", _configCols);
			if(avariants.state)
			{
				oPersoData = {
                    aColumns: _configCols || [],
                    aFilters: avariants.state.Filters || [],
                    aSorters: avariants.state.Sorters || []
                };
			}
			else{
				oPersoData = {
                    aColumns: [],
                    aFilters:  [],
                    aSorters: []
                };
			}		
			
			this._stateModel.setProperty("/columns", oPersoData.aColumns);
			this._stateModel.setProperty("/filter", oPersoData.aFilters);
			this._stateModel.setProperty("/sort", oPersoData.aSorters);

			this._variantModel = new JSONModel({
				variants: avariants,
				selected: sDefaultVariant || "Default",
				newVariantName: "",
				setAsDefault: false
			});
			this._oDialog = null;
			this._oVariantDialog = null;
			this._oPersonalizationContainer = null; // Container Reference
			this._sContainerKey = "sdsubcntr_cockpit_alv";//"SUBCON_ALV_APP_VARIANTS"; // Unique app container key
			
			
			this._initPersonalizationService(sDefaultVariant);
		},
		/**
		 * Sets and applies personalization state down into the helper's models
		 * @param {object} oPersoData Personalization state object containing columns, filters, or sorters
		 */
		setPersonalizationData: function (oPersoData) {
			if (!oPersoData) {
				return;
			}

			// 1. Update columns state using 'aColumns' from the screenshot
			if (oPersoData.aColumns) {
				const aCurrentColumns = this._stateModel.getProperty("/columns") || [];
				const aUpdatedColumns = aCurrentColumns.map(function (col) {
					const oSavedCol = oPersoData.aColumns.find(sc => sc.key === col.key || sc.id === col.key);
					if (oSavedCol) {
						col.visible = oSavedCol.visible;
						if (oSavedCol.width) { col.width = oSavedCol.width; }
					}
					return col;
				});
					/* var _configCols = this._aColumnConfig;
					var _varColumns = avariants.state.Columns || [];

					_configCols.forEach(function (oConfigCol) {
						// Find the matching column configuration in the variant array by ID/Key
						var oMatchedVarCol = _varColumns.find(function (oVarCol) {
							return oVarCol.id === oConfigCol.id || oVarCol.key === oConfigCol.key;
						});

						if (oMatchedVarCol) {
							// Set visibility based on the variant state property
							oConfigCol.visible = oMatchedVarCol.visible;
						} else {
							// Fallback if column is not found in variant state (e.g., set to false or keep default)
							oConfigCol.visible = false; 
						}
					}); */
				this._stateModel.setProperty("/columns", aUpdatedColumns);

			}

			// 2. Update filters & sorters state using 'aFilters' and 'aSorters'
			if (oPersoData.aFilters) {
				this._stateModel.setProperty("/filter", oPersoData.aFilters);
			}
			if (oPersoData.aSorters) {
				this._stateModel.setProperty("/sort", oPersoData.aSorters);
			}

			this._stateModel.refresh(true);
			this._applyStateToUI5Table();
		},
		_initDefaultState: function () {
			if (!this._aColumnConfig || this._aColumnConfig.length === 0) {
				return;
			}
			const aColumns = this._aColumnConfig.map((oCol, iIndex) => ({
				key: oCol.key,
				label: oCol.label || oCol.key,
				visible: oCol.visible !== undefined ? oCol.visible : true,
				order: oCol.order !== undefined ? oCol.order : iIndex,
				width: oCol.width !== undefined ? oCol.width : "5rem",
				selected: oCol.selected !== undefined ? oCol.selected : true
			}));
			this._stateModel.setProperty("/columns", aColumns);
		},

		/**
		 * Initializes Fiori Standard Personalization Container Asynchronously
		 */
		_initPersonalizationService: function (sDefaultVariantKey ) {
			//this._sDefaultVarKey = sDefaultVariantKey;
			this.fetchVariantsFromBackend(sDefaultVariantKey);
			// var that = this;
			// /* const oPersService = await sap.ushell.Container.getServiceAsync("Personalization");
            // this._oPersonalizationContainer =  await new Promise((fnResolve, fnReject) => {
            //     const oConfig = {
            //         keyCategory: oPersService.constants.keyCategory.FIXED_KEY,
            //         writeFrequency: oPersService.constants.writeFrequency.LOW,
            //         clientStorageAllowed: true
            //     };
            //     //SUBCON_ALV_APP_VARIANTS - sdsubcntr_cockpit_alv
            //     oPersService.getPersonalizationContainer("sdsubcntr_cockpit_alv ", oConfig)
            //         .done(fnResolve)
            //         .fail(fnReject);
            // }); */

			// if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getServiceAsync) {
			// 	sap.ushell.Container.getServiceAsync("Personalization")
			// 		.then(function (oPersoService) {
						
			// 			// Open or create a container for this table component
			// 			return oPersoService.getPersonalizationContainer(this._sContainerKey, {
			// 				validity: Infinity
			// 			});
			// 		}.bind(this))
			// 		.then(function (oContainer) {
			// 			this._oPersonalizationContainer = oContainer;
			// 			// Automatically fetch existing variants once container loaded
			// 			this.fetchVariantsFromBackend(that._sDefaultVarKey);
			// 		}.bind(this))
			// 		.catch(function (oError) {
			// 			Log.error("Failed to initialize Fiori Personalization Service Container: " + oError);
			// 		});
			// } else {
			// 	Log.warning("UShell Container Services are unavailable. Running in standalone fallback.");
			// } 
		},

		/* =========================================================== */
		/* Main Dialog Methods                                         */
		/* =========================================================== */

		openDialog: function (sSelectedTabKey) {
			if (!this._oDialog) {
				this._oDialog = this._createDialogStructure();
				this._oDialog.setModel(this._stateModel, "state");
				this._oDialog.setModel(this._variantModel, "variant");
			}

			if (!this._stateModel.getProperty("/filter")) {
				this._stateModel.setProperty("/filter", []);
			}
			if (!this._stateModel.getProperty("/sort")) {
				this._stateModel.setProperty("/sort", []);
			}

			if (this._oTabBar) {
				if (sSelectedTabKey) {
					this._oTabBar.setSelectedKey(sSelectedTabKey);
				}
				this._oTabBar.getItems().forEach(oItem => oItem.setVisible(true));
			}
			this._oDialog.open();
		},

		_createDialogStructure: function () {
			this._oTabBar = new IconTabBar({
				expandable: false,
				items: [
					this._columnsTab().setKey("columnTab"),
					this._sortTab().setKey("sortTab"),
					this._filterTab().setKey("filterTab")
				]
			});

			return new Dialog({
				title: "Table Columns Settings",
				contentWidth: "550px",
				contentHeight: "450px",
				draggable: true,
				content: [this._oTabBar],
				buttons: [
					new Button({
						text: "Manage Layout",
						icon: "sap-icon://action-settings",
						type: "Default",
						visible: false,
						press: () => this.openVariantDialog()
					}),
					new Button({
						text: "Apply",
						type: "Emphasized",
						press: () => {

							this._applyStateToUI5Table();
							this._oDialog.close();
						}
					}),
					new Button({
						text: "Close",
						press: () => this._oDialog.close()
					})
				]
			});
		},

		/* =========================================================== */
		/* Columns Tab & Sorting Tab Elements                         */
		/* =========================================================== */

		_columnsTab: function () {
			let oList;
			const oSearchField = new SearchField({
				width: "100%",
				placeholder: "Search columns...",
				liveChange: (oEvent) => {
					const sValue = oEvent.getParameter("newValue");
					if (oList) {
						const oBinding = oList.getBinding("items");
						if (oBinding) {
							if (sValue && sValue.trim().length > 0) {
								oBinding.filter([new Filter({
									path: "label",
									operator: FilterOperator.Contains,
									value1: sValue
								})]);
							} else {
								oBinding.filter([]);
							}
						}
					}
				}
			});

			const oToolbar = new Toolbar({
				design: "Info",
				content: [new ToolbarSpacer(), oSearchField]
			}).addStyleClass("sapUiTinyMarginBottom");

			oList = new List({
				mode: "SingleSelectMaster",
				items: {
					path: "state>/columns",
					template: new CustomListItem({
						content: [
							new HBox({
								alignItems: "Center",
								justifyContent: "SpaceBetween",
								width: "100%",
								items: [
									new CheckBox({
										selected: "{state>visible}",
										text: "{state>label}"
									}),
									new HBox({
										items: [
											new Button({
												icon: "sap-icon://collapse-group",
												tooltip: "Move First",
												type: "Transparent",
												press: (e) => this._moveColumnItemToExtreme(e, "first")
											}),
											new Button({
												icon: "sap-icon://navigation-up-arrow",
												tooltip: "Move Up",
												type: "Transparent",
												press: (e) => this._moveColumnItem(e, "up")
											}),
											new Button({
												icon: "sap-icon://navigation-down-arrow",
												tooltip: "Move Down",
												type: "Transparent",
												press: (e) => this._moveColumnItem(e, "down")
											}),
											new Button({
												icon: "sap-icon://expand-group",
												tooltip: "Move Last",
												type: "Transparent",
												press: (e) => this._moveColumnItemToExtreme(e, "last")
											})
										]
									}).addStyleClass("alvActionButtonsGroup hideActionButtons")
								]
							}).addStyleClass("sapUiTinyMargin")
						]
					})
				}
			});

			return new IconTabFilter({
				key: "columnTab",
				text: "Columns Display",
				icon: "sap-icon://table-column",
				content: [
					new VBox({
						width: "100%",
						items: [oToolbar, oList]
					})
				]
			});
		},

		_sortTab: function () {
			return new IconTabFilter({
				key: "sortTab",
				text: "Sort",
				icon: "sap-icon://sort",
				content: [
					new OverflowToolbar({
						content: [
							new ToolbarSpacer(),
							new Button({
								text: "Add Sort",
								icon: "sap-icon://add",
								type: "Emphasized",
								press: () => {
									const aSort = this._stateModel.getProperty("/sort") || [];
									const sFirstKey = this._aColumnConfig[0]?.key || "";
									aSort.push({ key: sFirstKey, descending: false });
									this._stateModel.setProperty("/sort", aSort);
									this._stateModel.refresh(true);
								}
							})
						]
					}),
					new List({
						items: {
							path: "state>/sort",
							template: new CustomListItem({
								content: new HBox({
									alignItems: "Center",
									justifyContent: "Start",
									items: [
										new Text({ text: "Sort by" }).addStyleClass("sapUiTinyMarginEnd"),
										new Select({
											selectedKey: "{state>key}",
											width: "180px",
											items: this._getItems()
										}),
										new SegmentedButton({
											width: "120px",
											selectedKey: {
												path: "state>descending",
												formatter: (bValue) => bValue ? "true" : "false"
											},
											items: [
												new SegmentedButtonItem({ key: "false", icon: "sap-icon://sort-ascending", tooltip: "Ascending" }),
												new SegmentedButtonItem({ key: "true", icon: "sap-icon://sort-descending", tooltip: "Descending" })
											],
											selectionChange: (oEvent) => {
												const sKey = oEvent.getParameter("item").getKey();
												const oContext = oEvent.getSource().getBindingContext("state");
												oContext.getObject().descending = (sKey === "true");
												this._stateModel.refresh(true);
											}
										}).addStyleClass("sapUiTinyMarginBegin"),
										new Text({
											text: {
												path: "state>descending",
												formatter: (bValue) => bValue ? "Descending" : "Ascending"
											}
										}).addStyleClass("sapUiTinyMarginBegin"),
										new Button({
											icon: "sap-icon://delete",
											type: "Transparent",
											tooltip: "Remove Sort",
											press: (oEvent) => {
												const oContext = oEvent.getSource().getBindingContext("state");
												const iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
												const aSort = this._stateModel.getProperty("/sort");
												aSort.splice(iIndex, 1);
												this._stateModel.refresh(true);
											}
										}).addStyleClass("sapUiTinyMarginBegin")
									]
								})
							})
						}
					})
				]
			});
		},

		/* =========================================================== */
		/* Filters Tab Elements                                        */
		/* =========================================================== */

		_filterTab: function () {
			return new IconTabFilter({
				key: "filterTab",
				text: "Filters",
				visible: false,
				icon: "sap-icon://filter",
				content: [
					new OverflowToolbar({
						content: [
							new ToolbarSpacer(),
							new Button({
								text: "Add Filter",
								icon: "sap-icon://add",
								type: "Emphasized",
								press: () => {
									const aFilter = this._stateModel.getProperty("/filter") || [];
									const sFirstKey = this._aColumnConfig[0]?.key || "TRAFF_LGT";
									aFilter.push({
										key: sFirstKey,
										operator: "EQ",
										value1: "",
										value2: "",
										values: [],
										exclude: false
									});
									this._stateModel.setProperty("/filter", aFilter);
									this._stateModel.refresh(true);
								}
							})
						]
					}),
					new List({
						id: this.createId ? this.createId("perso_filterColumnList") : undefined,
						noDataText: "No filters defined. Click 'Add Filter' to begin.",
						items: {
							path: "state>/filter",
							template: new CustomListItem({
								content: new HBox({
									alignItems: "Center",
									justifyContent: "Start",
									items: [
										new Select({
											selectedKey: "{state>operator}",
											width: "120px",
											change: () => this._stateModel.refresh(true),
											items: [
												new CoreItem({ key: "EQ", text: "Equals" }),
												new CoreItem({ key: "Contains", text: "Contains" }),
												new CoreItem({ key: "BT", text: "Between" }),
												new CoreItem({ key: "GT", text: "Greater Than" }),
												new CoreItem({ key: "LT", text: "Less Than" })
											]
										}).addStyleClass("sapUiTinyMarginEnd"),
										new Select({
											selectedKey: "{state>key}",
											width: "180px",
											items: this._getItems(),
											change: () => this._stateModel.refresh(true)
										}).addStyleClass("sapUiTinyMarginEnd"),
										this._createValueControl(),
										new ToolbarSpacer(),
										new Button({
											icon: "sap-icon://delete",
											type: "Transparent",
											press: (oEvent) => {
												const oContext = oEvent.getSource().getBindingContext("state");
												const iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
												const aFilters = this._stateModel.getProperty("/filter");
												aFilters.splice(iIndex, 1);
												this._stateModel.setProperty("/filter", aFilters);
												this._stateModel.refresh(true);
											}
										})
									]
								}).addStyleClass("sapUiSmallMargin")
							})
						}
					})
				]
			});
		},

		_createValueControl: function () {
			return new HBox({
				alignItems: "Center",
				items: [
					new MultiInput({
							width: "160px",
							placeholder: "Select or type...",
							showValueHelp: true,
							valueHelpRequest: (e) => this._onFilterValueHelpRequest(e, "values"),
							visible: {
								path: "state>operator",
								formatter: (sOp) => sOp !== "BT"
							},
							tokens: {
								path: "state>values",
								template: new Token({ key: "{state>}", text: "{state>}" })
							},
							// 1. Handle keyboard submit / focus loss for manually typed text
							change: function (oEvent) {
								const sValue = oEvent.getParameter("value") ? oEvent.getParameter("value").trim() : "";
								if (!sValue) {
									return;
								}

								const oMultiInput = oEvent.getSource();
								const oContext = oMultiInput.getBindingContext("state");
								const aValues = oContext.getProperty("values") || [];

								// Add manually typed value if it doesn't exist yet
								if (aValues.indexOf(sValue) === -1) {
									aValues.push(sValue);
									oContext.getModel().setProperty(oContext.getPath() + "/values", aValues);
									oContext.getModel().setProperty(oContext.getPath() + "/value1", aValues[0] || "");
								}

								// Clear the input text box after token creation
								oMultiInput.setValue("");
							},
							// 2. Handle token additions/removals
							tokenUpdate: function (oEvent) {
								const oContext = oEvent.getSource().getBindingContext("state");
								const aValues = oContext.getProperty("values") || [];
								const sType = oEvent.getParameter("type");

								if (sType === "removed") {
									const aRemoved = oEvent.getParameter("removedTokens");
									aRemoved.forEach(oToken => {
										const sKey = oToken.getKey() || oToken.getText();
										const iIdx = aValues.indexOf(sKey);
										if (iIdx !== -1) {
											aValues.splice(iIdx, 1);
										}
									});
								} else if (sType === "added") {
									const aAdded = oEvent.getParameter("addedTokens");
									aAdded.forEach(oToken => {
										const sKey = oToken.getKey() || oToken.getText();
										if (sKey && aValues.indexOf(sKey) === -1) {
											aValues.push(sKey);
										}
									});
								}

								oContext.getModel().setProperty(oContext.getPath() + "/values", aValues);
								oContext.getModel().setProperty(oContext.getPath() + "/value1", aValues[0] || "");
							}
						}),
					new HBox({
						alignItems: "Center",
						visible: {
							path: "state>operator",
							formatter: (sOp) => sOp === "BT"
						},
						items: [
							new Input({
								value: "{state>value1}",
								placeholder: "From...",
								width: "110px",
								showValueHelp: true,
								valueHelpRequest: (e) => this._onFilterValueHelpRequest(e, "value1")
							}).addStyleClass("sapUiTinyMarginEnd"),
							new Label({ text: "to" }).addStyleClass("sapUiTinyMarginEnd"),
							new Input({
								value: "{state>value2}",
								placeholder: "To...",
								width: "110px",
								showValueHelp: true,
								valueHelpRequest: (e) => this._onFilterValueHelpRequest(e, "value2")
							})
						]
					})
				]
			});
		},

		_onFilterValueHelpRequest: function (oEvent, sTargetProperty) {
			const oInput = oEvent.getSource();
			const oContext = oInput.getBindingContext("state");
			const sKey = oContext.getProperty("key");
			// Get all columns from context data
			const aColumns = oContext.getObject("/columns");

			// Search for label
			const oFound = aColumns.find(item => item.key === sKey);
			const sLabel = oFound ? oFound.label : sKey;
			//const sLabel = oContext.getProperty("label") || sKey;
			const sOperator = oContext.getProperty("operator");
			const oTable = this._oTable;
			
			let aRowData = [];
			const oBinding = oTable.getBinding("rows");
			if (oBinding) {
				const oBindingModel = oBinding.getModel();
				const sPath = oBinding.getPath();
				if (oBindingModel && sPath) {
					aRowData = oBindingModel.getProperty(sPath) || [];
				}
			}

			if (!aRowData || aRowData.length === 0) {
				const oSubconModel = oTable.getModel("subconModel");
				if (oSubconModel) {
					aRowData = oSubconModel.getProperty("/ItemsSet") || [];
				}
			}

			const aDistinctValues = [];
			if (Array.isArray(aRowData)) {
				aRowData.forEach(oRow => {
					if (oRow) {
						if(oRow["RootId"] !== 99){
							const vValue = oRow[sKey];
							if (vValue !== undefined && vValue !== null && vValue !== "") {
								const sValStr = String(vValue).trim();
								if (aDistinctValues.indexOf(sValStr) === -1) {
									aDistinctValues.push(sValStr);
								}
							}
						}
					}
				});
			}
			aDistinctValues.sort();

			let aItems = aDistinctValues.map(sVal => ({ key: sVal, text: sVal }));
			if (aItems.length === 0) {
				aItems = [{ key: "", text: "No values found" }];
			}

			const bMultiSelect = (sTargetProperty === "values" && sOperator !== "BT");
			const oSelectDialog = new SelectDialog({
				title: "Select Values for " + sLabel,
				noDataText: "No matching items located",
				rememberSelections: true,
				multiSelect: bMultiSelect,
				confirm: function (oEvt) {
					const oModel = oContext.getModel();
					const sPath = oContext.getPath();
					if (bMultiSelect) {
						const aSelectedItems = oEvt.getParameter("selectedItems") || [];
						const aTokens = aSelectedItems.map(oItem => oItem.getTitle());
						oModel.setProperty(sPath + "/values", aTokens);
						oModel.setProperty(sPath + "/value1", aTokens[0] || "");
					} else {
						const oSelectedItem = oEvt.getParameter("selectedItem");
						if (oSelectedItem) {
							oModel.setProperty(sPath + "/" + sTargetProperty, oSelectedItem.getTitle());
						}
					}
					this._stateModel.refresh(true);
					oSelectDialog.destroy();
				}.bind(this),
				cancel: () => oSelectDialog.destroy()
			});

			oSelectDialog.setModel(new JSONModel({ items: aItems }));
			oSelectDialog.bindAggregation("items", {
				path: "/items",
				 template: new StandardListItem({ title: "{text}", description: "{key}", type: "Active" })
				//template: new StandardListItem({ title: "{text}", type: "Active" })
			});

			oSelectDialog.attachSearch((oEvt) => {
				const sQuery = oEvt.getParameter("value");
				const oFilter = new Filter("text", FilterOperator.Contains, sQuery);
				oEvt.getSource().getBinding("items").filter([oFilter]);
			});

			oSelectDialog.open();
		},

		_getItems: function () {
			return this._aColumnConfig.map(oCol => new CoreItem({ key: oCol.key, text: oCol.label }));
		},

		/* =========================================================== */
		/* Standard Personalization Container Variant Handling         */
		/* =========================================================== */

		openVariantDialog: function () {
			if (!this._oVariantDialog) {
				this._oVariantDialog = this._createVariantDialogStructure();
				this._oVariantDialog.setModel(this._variantModel, "variant");
			}
			this._oVariantDialog.open();
		},

		_createVariantDialogStructure: function () {
			const oList = new List({
				headerText: "Available Layout Variants",
				mode: "None",
				items: {
					path: "variant>/variants",
					template: new CustomListItem({
						content: new HBox({
							justifyContent: "SpaceBetween",
							alignItems: "Center",
							width: "100%",
							items: [
								new Text({ text: "{variant>text}", design: "Bold" }),
								new HBox({
									items: [
										new Button({
											text: "Load Layout",
											icon: "sap-icon://drill-up",
											type: "Transparent",
											press: (oEvent) => {
												const sVariantKey = oEvent.getSource().getBindingContext("variant").getProperty("key");
												this._variantModel.setProperty("/selected", sVariantKey);
												this.applyBackendVariant(sVariantKey);
												this._oVariantDialog.close();
											}
										}),
										new Button({
											icon: "sap-icon://delete",
											type: "Transparent",
											tooltip: "Delete Variant",
											visible: {
												path: "variant>key",
												formatter: (sKey) => sKey !== "Default"
											},
											press: (oEvent) => {
												const sVariantKey = oEvent.getSource().getBindingContext("variant").getProperty("key");
												this.deleteVariantFromContainer(sVariantKey);
											}
										})
									]
								})
							]
						}).addStyleClass("sapUiSmallMargin")
					})
				}
			});

			const oNewVariantBox = new VBox({
				items: [
					new Text({ text: "Create New Layout Variant Name:", design: "Bold" }).addStyleClass("sapUiSmallMarginTop"),
					new HBox({
						width: "100%",
						alignItems: "Center",
						items: [
							new Input({
								value: "{variant>/newVariantName}",
								placeholder: "Type layout identity...",
								width: "60%"
							}),
							new CheckBox({
								text: "Set Default",
								selected: "{variant>/setAsDefault}"
							}).addStyleClass("sapUiSmallMarginBegin")
						]
					})
				]
			}).addStyleClass("sapUiContentPadding");

			return new Dialog({
				title: "Manage Table Layout Variants",
				contentWidth: "450px",
				contentHeight: "400px",
				type: "Message",
				content: [oList, oNewVariantBox],
				buttons: [
					new Button({
						text: "Save As",
						icon: "sap-icon://save",
						type: "Emphasized",
						tooltip: "Overwrite currently active selected variant settings",
						press: () => {
							const sSelected = this._variantModel.getProperty("/selected");
							if (sSelected === "Default") {
								MessageBox.warning("System Standard template cannot be overwritten. Please save a new variant.");
								return;
							}
							this.saveVariantToBackend(sSelected, sSelected, false);
							this._oVariantDialog.close();
						}
					}),
					new Button({
						text: "Save New",
						icon: "sap-icon://add",
						type: "Accept",
						press: () => {
							const sNewName = this._variantModel.getProperty("/newVariantName");
							const bDefault = this._variantModel.getProperty("/setAsDefault");
							if (!sNewName) {
								MessageToast.show("Please enter a layout name.");
								return;
							}
							this.saveVariantToBackend(sNewName, sNewName, bDefault);
							this._oVariantDialog.close();
						}
					}),
					new Button({
						text: "Back",
						press: () => this._oVariantDialog.close()
					})
				]
			});
		},

		/**
		 * Reads all dynamic variants saved in the standard personalization container
		 */
		fetchVariantsFromBackend: function (sDefaultVariant) {
			//if (!this._oPersonalizationContainer) { return; }

			//const sTableId = this._oTable.getId().split("---")[1] || "tblsubcon";
			// Fetch the list index key where variant metadata references are stored
			//const aSavedKeys = this._oPersonalizationContainer.getItemKeys();
			//const aVariants = [{ key: "Default", text: "Standard (Default System)" }];
			let sDefaultVariantKey = "Default";
			// Fetch variants from backend / service
            //const oContainer = this._oPersonalizationContainer;
            //const aVariants = oContainer.getItemValue("variants") || [];
			/* aSavedKeys.forEach(function (sKey) {
				// We prefix custom variant entries with Table ID to isolate items cleanly
				if (sKey.indexOf(sTableId + "_VAR_") === 0) {
					const oVariantWrapper = this._oPersonalizationContainer.getItemValue(sKey);
					if (oVariantWrapper) {
						aVariants.push({
							key: oVariantWrapper.variantId,
							text: oVariantWrapper.isDefault ? oVariantWrapper.variantName + " (Default)" : oVariantWrapper.variantName
						});
						if (oVariantWrapper.isDefault) {
							sDefaultVariantKey = oVariantWrapper.variantId;
						}
					}
				}
			}.bind(this)); */

			//this._variantModel.setProperty("/variants", aVariants);

			// On first application initialization, auto-load the default layout
			//if (this._variantModel.getProperty("/selected") === "Default" && sDefaultVariantKey !== "Default") {
				//this._variantModel.setProperty("/selected", sDefaultVariantKey);
				sDefaultVariantKey = this._variantModel.getProperty("/selected");
				this.applyBackendVariant(sDefaultVariantKey);
			//}
		},

		/**
		 * Creates/Updates variant profiles locally in Personalization Container and saves synchronously
		 */
		saveVariantToBackend: function (sVariantId, sVariantName, bDefault) {
			if (!this._oPersonalizationContainer) {
				MessageBox.error("Personalization backend services are unavailable.");
				return;
			}

			sap.ui.core.BusyIndicator.show(0);
			const sTableId = this._oTable.getId().split("---")[1] || "tblsubcon";
			const sStorageKey = sTableId + "_VAR_" + sVariantId.replace(/\s+/g, "_");

			// If this new variant is flagged default, unset former default profiles
			if (bDefault) {
				const aSavedKeys = this._oPersonalizationContainer.getItemKeys();
				aSavedKeys.forEach(function (sKey) {
					if (sKey.indexOf(sTableId + "_VAR_") === 0) {
						const oItem = this._oPersonalizationContainer.getItemValue(sKey);
						if (oItem && oItem.isDefault) {
							oItem.isDefault = false;
							this._oPersonalizationContainer.setItemValue(sKey, oItem);
						}
					}
				}.bind(this));
			}

			// Bundle layout configuration states
			const oVariantDataWrapper = {
				variantId: sVariantId,
				variantName: sVariantName,
				isDefault: bDefault,
				payload: this._stateModel.getData()
			};

			// Write into standard UShell framework container
			this._oPersonalizationContainer.setItemValue(sStorageKey, oVariantDataWrapper);

			// Trigger container replication save back to SAP Frontend Server DB registry
			this._oPersonalizationContainer.save()
				.done(function () {
					sap.ui.core.BusyIndicator.hide();
					MessageToast.show("Variant saved successfully via Fiori Personalization.");
					this._variantModel.setProperty("/newVariantName", "");
					this._variantModel.setProperty("/setAsDefault", false);
					this.fetchVariantsFromBackend();
				}.bind(this))
				.fail(function () {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Failed to commit personalization container values.");
				});
		},

		/**
		 * Loads variant layouts directly from the personalization instance cache mapping
		 */
		applyBackendVariant: function (sVariantId) {
			if (sVariantId === "Default") {
				this._initDefaultState();
				this._applyStateToUI5Table();
				return;
			}
			
			//if (!this._oPersonalizationContainer) { return; }

			//const sTableId = this._oTable.getId().split("---")[1] || "tblsubcon";
			//const sStorageKey = sTableId + "_VAR_" + sVariantId.replace(/\s+/g, "_");
			//const oVariantWrapper = this._oPersonalizationContainer.getItemValue(sStorageKey);
			// Fetch variants from backend / service
            //const oContainer = this._oPersonalizationContainer;		
           // const aVariants = this._variantModel.getProperty("/variants");
			//const oVariantWrapper = aVariants.find(item => item.key === sVariantId);
			//debugger;
			if (this._stateModel.getProperty("/columns")) {
				//this._stateModel.setData(JSON.parse(JSON.stringify(oVariantWrapper.payload)));
				this._applyStateToUI5Table();
			} else {
				MessageBox.error("Requested personalization layout profile cannot be loaded.");
			}
		},

		/**
		 * Handles variant deletion from within the Personalization Container service
		 */
		deleteVariantFromContainer: function (sVariantId) {
			if (!this._oPersonalizationContainer) { return; }

			MessageBox.confirm("Are you sure you want to delete this variant layout?", {
				onClose: function (sAction) {
					if (sAction === MessageBox.Action.OK) {
						sap.ui.core.BusyIndicator.show(0);
						const sTableId = this._oTable.getId().split("---")[1] || "tblsubcon";
						const sStorageKey = sTableId + "_VAR_" + sVariantId.replace(/\s+/g, "_");

						// Remove entry from container instance
						this._oPersonalizationContainer.delItem(sStorageKey);

						// Replicate/sync deletion state permanently
						this._oPersonalizationContainer.save()
							.done(function () {
								sap.ui.core.BusyIndicator.hide();
								MessageToast.show("Variant removed successfully.");
								if (this._variantModel.getProperty("/selected") === sVariantId) {
									this._variantModel.setProperty("/selected", "Default");
									this.applyBackendVariant("Default");
								}
								this.fetchVariantsFromBackend();
							}.bind(this))
							.fail(function () {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Failed to save deletion state.");
							});
					}
				}.bind(this)
			});
		},

		/* =========================================================== */
		/* Internal Table State Realignment                            */
		/* =========================================================== */

		_applyStateToUI5Table: function () {
			//debugger;		
			const oTable = this._oTable;
			const aColumnsState = this._stateModel.getProperty("/columns") || [];

			oTable.getColumns().forEach(oCol => oCol.setVisible(false));

			aColumnsState.forEach((oColState, iIndex) => {
				const oTargetCol = oTable.getColumns().find(oCol => oCol.data("p13nKey") === oColState.key);
				if (oTargetCol) {
					const bSystemCol = ["IsMain", "RootId", "ParentId", "MainIndex"].includes(oColState.key);
					if (bSystemCol) {
						oTargetCol.setVisible(false);
					} else {
						oTargetCol.setVisible(oColState.visible);
					}

					if (oColState.width) {
						oTargetCol.setWidth(oColState.width);
					}
					oTable.removeColumn(oTargetCol);
					oTable.insertColumn(oTargetCol, iIndex);
				}
			});

			const aFilters = this._stateModel.getProperty("/filter") || [];
			const aSorters = this._stateModel.getProperty("/sort") || [];
			let oController = null;
			let oParent = oTable;

			while (oParent && !oController) {
				if (oParent.getMetadata().getName().indexOf("sap.ui.core.mvc.View") !== -1 || typeof oParent.getController === "function") {
					oController = oParent.getController();
					break;
				}
				oParent = oParent.getParent();
			}

			if (oController && typeof oController.onTablePersoApplyRules === "function") {
				if(!this._stateModel.getProperty("/variants")){
					oController._applyVariant(this._stateModel.getProperty("/variants"));			
					//oController.onTablePersoApplyRules(aFilters, aSorters);
				}
				else{
					oController._applyVariant(this._stateModel.getProperty("/variants"));
					oController.onTablePersoApplyRules(aFilters, aSorters);
				}
				
			} else {
				Log.warning("TablePersoHelper: Target controller callback 'onTablePersoApplyRules' could not be resolved.");
			}
		},

		/* =========================================================== */
		/* Sorting & Column Positioning Helper Operations              */
		/* =========================================================== */

		_moveColumnItem: function (oEvent, sDirection) {
			const iIndex = this._getIndex(oEvent);
			this._moveColumn(iIndex, sDirection);
		},

		_moveColumnItemToExtreme: function (oEvent, sPosition) {
			const iIndex = this._getIndex(oEvent);
			this._moveColumn(iIndex, sPosition);
		},

		_moveColumn: function (iIndex, sAction) {
			const aColumns = this._stateModel.getProperty("/columns");
			if (iIndex < 0 || iIndex >= aColumns.length) {
				return;
			}
			const [oColumn] = aColumns.splice(iIndex, 1);

			if (sAction === "first") {
				aColumns.unshift(oColumn);
			} else if (sAction === "last") {
				aColumns.push(oColumn);
			} else if (sAction === "up") {
				aColumns.splice(Math.max(0, iIndex - 1), 0, oColumn);
			} else if (sAction === "down") {
				aColumns.splice(Math.min(aColumns.length, iIndex + 1), 0, oColumn);
			}

			aColumns.forEach((oCol, iIdx) => {
				oCol.order = iIdx;
			});
			this._stateModel.setProperty("/columns", aColumns);
			this._stateModel.refresh(true);
		},

		_getIndex: function (oEvent) {
			return parseInt(oEvent.getSource().getBindingContext("state").getPath().split("/").pop(), 10);
		},

		_getIndexFromItem: function (oItem) {
			return parseInt(oItem.getBindingContext("state").getPath().split("/").pop(), 10);
		},

		_reorderByDrag: function (iFromIndex, iToIndex) {
			const aColumns = this._stateModel.getProperty("/columns");
			const [oColumn] = aColumns.splice(iFromIndex, 1);
			aColumns.splice(iToIndex, 0, oColumn);
			aColumns.forEach((oCol, iIdx) => {
				oCol.order = iIdx;
			});
			this._stateModel.setProperty("/columns", aColumns);
			this._stateModel.refresh(true);
		},
		/**
		 * Getter for the internal state model (columns, filters, sorters)
		 * @returns {sap.ui.model.json.JSONModel} The internal state JSON model
		 */
		getStateModel: function () {
			return this._stateModel;
		},
	});
});
