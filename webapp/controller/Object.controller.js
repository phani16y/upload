sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter,MessageBox,Fragment,Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("upload.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            debugger;
            this.setModel(oViewModel, "objectView");
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
		onValueHelpRequest: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();

			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "upload.Fragment.ValueHelpDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pValueHelpDialog.then(function(oDialog) {
				// Create a filter for the binding
				oDialog.getBinding("items").filter([new Filter("Country", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sInputValue);
			});
		},

		onValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Country", FilterOperator.Contains, sValue);

			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				return;
			}

			this.byId("InputEdit5").setValue(oSelectedItem.getTitle());
		},
        handleEditPress : function () {
            debugger;
           //Clone the data
           var path = this.getView().getElementBinding().sPath;
           var boundObject = this.getView().getModel().getProperty(path);
		    this._oEmp = Object.assign({}, boundObject);
			this._toggleButtonsAndView(true);

		}, 
        handleCancelPress : function () {
			//Restore the data
			var oModel = this.getView().getModel();
			var oData = oModel.getData();
             debugger;
		//	oData.SupplierCollection[0] = this._oEmp;
		//	oModel.setData(oData);
			this._toggleButtonsAndView(false);
		},

		handleSavePress : function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getModel("objectView");
            var path = this.getView().getElementBinding().sPath;
            var uData = this.getView().getModel().getProperty(path);
            uData.Firstname = this.getView().byId("InputEdit").getValue();
            uData.Lastname = this.getView().byId("InputEdit2").getValue();
            uData.Age = this.getView().byId("InputEdit3").getValue();
            uData.Role = this.getView().byId("InputEdit4").getValue();
            //uData.Age = this.getView().byId("InputEdit5").getValue();
            oViewModel.setProperty("/busy", true);
            oModel.update(path, uData, {success: function(data) {
                MessageBox.success( "Emp " + uData.Id + " Updated Successfully " );
                oViewModel.setProperty("/busy", false);
                 }, error: function(e) {
                MessageBox.error( uData.Id + " Error Occurred " );
                 oViewModel.setProperty("/busy", false);
                }}); 
         this._toggleButtonsAndView(false);
		},
        _toggleButtonsAndView: function(bEdit)
         {
            var oView = this.getView();
			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);
            oView.byId('InputEdit').setProperty('editable',bEdit);
            oView.byId('InputEdit2').setProperty('editable',bEdit);
            oView.byId('InputEdit3').setProperty('editable',bEdit);
            oView.byId('InputEdit4').setProperty('editable',bEdit);
            oView.byId('InputEdit5').setProperty('editable',bEdit);
         },
         
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/UXT" + sObjectId);
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");
            debugger;
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Firstname,
                sObjectName = oObject.UXT;
                 debugger;
                 this.byId('edit').setEnabled(true);
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });

});
