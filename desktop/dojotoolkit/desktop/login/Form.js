dojo.provide("desktop.login.Form");
dojo.config.parseOnLoad=true;
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.validate.web");
dojo.require("dojo.cookie");
dojo.require("dojox.data.PersevereStore");
dojo.requireLocalization("desktop.login", "login");

dojo.declare("desktop.login.Form", dijit.form.Form, {
	templateString: null,
	templatePath: dojo.moduleUrl("desktop.login", "Form.html"),
	_popup: null,
	widgetsInTemplate: true,
	preload: true,
	autoRedirect: false,
   focusOnLoad: false,
	postCreate: function(){
		// summary:
		// 	Intializes the form, loads l10n, etc.

		this.nls = dojo.i18n.getLocalization("desktop.login", "login", djConfig.locale);
		this.desktopMessageNode.innerHTML = this.nls.DesktopLogin;
		this.usernameLabelNode.innerHTML = this.nls.Username;
		this.passwordLabelNode.innerHTML = this.nls.Password;
		this.newWindowLabelNode.innerHTML = this.nls.NewWindow;
		this.currentWindowLabelNode.innerHTML= this.nls.CurrentWindow;
		this.registerNode.innerHTML = this.nls.Register;
		this.resetPasswordNode.innerHTML = this.nls.ResetPassword;
        this.rememberLabelNode.innerHTML = this.nls.RememberMe;
        this.submitNode.attr("label", this.nls.Login);


		this.inherited(arguments);
		if(this.preloadDesktop){
			var ontype = dojo.connect(this.domNode, "onkeydown", this, function(){
				dojo.disconnect(ontype);
				// pre-fetch the desktop.js file
				// in built versions, this should have everything we need
				dojo.xhrGet({
					url: dojo.moduleUrl("desktop", "desktop.js")
				});
			})
		}
        if(this.focusOnLoad)
            this.usernameField.focus();
		this.checkForLogin();
		this.setRadioButton();
	},
	checkForLogin: function(winClosed){
		dojo.xhrGet({
			url: dojo.baseUrl + "../../../backend/core/bootstrap.php?section=check&action=loggedin",
			load: dojo.hitch(this, function(data){
				if(data == 0 && data != ''){
					if(this.autoRedirect){
						if(dojo.cookie("desktopWindowPref") == "current"){
							//this.errorNode.innerHTML = "You are already logged in. Redirecting to desktop...";
							this.errorNode.innerHtml = this.nls.LoggedInRedirect;
							this.submitNode.setDisabled(true);
							window.location = dojo.baseUrl+"../../index.html";
						}
						else if(winClosed){
							//this.errorNode.innerHTML = "You are already logged in. <a href='" + dojo.baseUrl + "../../index.html'>Click here</a> to open the desktop.";
							this.errorNode.innerHTML = this.nls.LoggedInClickToOpen;
							dojo.query("a", this.errorNode).forEach(function(elem){
								elem.href="javascript:void(0);";
								dojo.connect(elem, "onclick", this, "onLinkClick");
							}, this);
						}
						else {
							if (this._popUp()){
								//this.errorNode.innerHTML = "You are already logged in. Window opened.";
								this.errorNode.innerHTML = this.nls.LoggedInWindowOpened;
								this.submitNode.setDisabled(true);
								this._winCheck();
							}
							else {
								//this.errorNode.innerHTML = "Your popup blocker is blocking the window. <a href='" + dojo.baseUrl + "../../index.html'>Click here</a> to try again.";
								this.errorNode.innerHTML = this.nls.PopupBlocker;
								dojo.query("a", this.errorNode).forEach(function(elem){
									elem.href="javascript:void(0);";
									dojo.connect(elem, "onclick", this, "onLinkClick");
								}, this);
							}
						}
					}
					else 
						//this.errorNode.innerHTML = "You are already logged in. <a href='" + dojo.baseUrl + "../../index.html'>Click here</a> to continue to the desktop.";
						this.errorNode.innerHTML = this.nls.LoggedInClick;
						dojo.query("a", this.errorNode).forEach(function(elem){
							elem.href="javascript:void(0);";
							dojo.connect(elem, "onclick", this, "onLinkClick");
						}, this);
				}
			})
		})
	},
	setRadioButton: function(){
		if(!dojo.cookie("desktopWindowPref") || dojo.cookie("desktopWindowPref") == "current")
			this.currentRadioNode.attr("checked", true);
		else
			this.newRadioNode.attr("checked", true);
	},
	onLinkClick: function(){
		if(dojo.cookie("desktopWindowPref") == "current"){
			window.location = dojo.baseUrl+"../../index.html";
		}
		else {
			if (this._popUp()){
			}
			else {
				//this.errorNode.innerHTML = "Your popup blocker is blocking the window. <a href='" + dojo.baseUrl + "../../index.html'>Click here</a> to try again.";
				this.errorNode.innerHTML = this.nls.PopupBlocker;
				dojo.query("a", this.errorNode).forEach(function(elem){
					elem.href="javascript:void(0);";
					dojo.connect(elem, "onclick", this, "onLinkClick");
				}, this);
			}
		}
	},
	_winCheck: function(){
		if(this._popup.closed === false){setTimeout(dojo.hitch(this, "_winCheck"), 500);}
		else {
			this.submitNode.setDisabled(false);
			this.errorNode.innerHTML = "";
			this.checkForLogin(true);
		}
	},
	_popUp: function()
	{
		var URL=dojo.baseUrl+"../../index.html";
		var day=new Date();
		var id=day.getTime();
		this._popup=window.open(URL,id,"toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=786,left = 0,top = 0");
		if(!this._popup)
			return false;
		else
			return true;
	},
	onSubmit: function(e){
		dojo.stopEvent(e);
		if(this.submitNode.disabled == true) return;
		var contents = this.getValues();
		dojo.cookie("desktopWindowPref", contents.windowAct, {
			expires: 365,
			path: window.location.pathname
		});
		this.errorNode.innerHTML = "";
		this.submitNode.disabled=true;
		if(contents.username && contents.password)
		{
			//this.errorNode.innerHTML = "Logging in...";
			this.errorNode.innerHTML = this.nls.LoggingIn;/*
			dojo.xhrPost({
				url: dojo.baseUrl+"../../../backend/core/user.php?section=auth&action=login",
				content: contents,
				load: dojo.hitch(this, function(data)
				{
					if(data == "0")
					{
						if(contents.windowAct == "current"){
							//this.errorNode.innerHTML = "Logged in. Redirecting to desktop...";
							this.errorNode.innerHTML = this.nls.LoggedInRedirecting;
							window.location = dojo.baseUrl+"../../index.html";
						}
						else {
							if (this._popUp()){
								this._winCheck();
								this.domNode.username.value = "";
								this.domNode.password.value = "";
								//this.errorNode.innerHTML = "Logged in. Window open.";
								this.errorNode.innerHTML = this.nls.LoggedInWindowOpened;
							}
							else {
								//this.errorNode.innerHTML = "Your popup blocker is blocking the Psych Desktop window.";
								this.errorNode.innerHTML = this.nls.PopupBlockerBlockingDesktop;
								this.submitNode.setDisabled(false);
							}
						}
					}
					else if(data == "1")
					{
						//this.errorNode.innerHTML = "Incorrect username or password.";
						this.errorNode.innerHTML = this.nls.IncorrectUserPass;
						this.submitNode.setDisabled(false);
					}
					else if(data == "4" || data == "5" || data == "6")
					{
						//this.errorNode.innerHTML = "A database error occured. Check Psych Desktop is installed correctly or contact the Administrator.";
						this.errorNode.innerHTML = this.nls.DatabaseErrorCheckInstall;
						this.submitNode.setDisabled(false);
					}
					else if(data == "7")
					{
						//this.errorNode.innerHTML = "You do not have permission to login. Contact the Administrator.";
						this.errorNode.innerHTML = this.nls.NoPermissionLogin;
						this.submitNode.setDisabled(false);
					}
					else
					{
						//this.errorNode.innerHTML = "Unknown Error occured. Check your installation.";
						this.errorNode.innerHTML = this.nls.UnknownError;
						this.submitNode.setDisabled(false);
					}
				})
			});*/
			dojo.xhrPost({
				url: "/Class/User",
				postData: dojo.toJson({
				    method: "authenticate",
				    id:"login",
				    params:[contents.username, contents.password]
				}),
				handleAs: "json",
				load: dojo.hitch(this, function(response){
				    if(response.error != null){
					//most likely that YOU'RE DOING IT WRONG
					this.errorNode.innerHTML = this.nls.IncorrectUserPass;
					this.submitNode.disabled=false;
				    }
				    else{
					//I don't think it's even possible to implament other errors.
					this.errorNode.innerHTML = this.nls.LoggedInRedirecting;
					//window.location = dojo.baseUrl+"../../index.html";
				    }
				}),
				error: dojo.hitch(this, function(){
				    this.errorNode.innerHTML = this.nls.DatabaseErrorCheckInstall;
								this.submitNode.disabled=false;
				})
			    });
		}
		else
		{
			//this.errorNode.innerHTML = "Please provide both a username and a password";
			this.errorNode.innerHTML = this.nls.ProvideUserPass;
			this.submitNode.setDisabled(false);
		}
		return false;
	},
	_showRegister: function(){
		var form = new desktop.login._RegisterDialog({
			parentForm: this
		});
		form.show();
	},
	_showResetPass: function(){
		console.log("test");
		var form = new desktop.login._ResetPassDialog({
			parentForm: this
		});
		form.show();
	}
});

dojo.declare("desktop.login._RegisterDialog", dijit.Dialog, {
	title: "Register",
	templateString: null,
	templatePath: dojo.moduleUrl("desktop.login", "RegisterDialog.html"),
	parentForm: null,
	postCreate: function(){
		this.nls = dojo.i18n.getLocalization("desktop.login", "login");
		this.titleNode.innerHTML = this.nls.Register;
		this.usernameLabelNode.innerHTML = this.nls.Username;
		this.emailLabelNode.innerHTML = this.nls.Email;
		this.passwordLabelNode.innerHTML = this.nls.Password;
		this.confPasswordLabelNode.innerHTML = this.nls.ConfirmPassword;
		this.submitNode.value = this.nls.Submit;

		this.inherited(arguments);
		new dijit.form.TextBox({name: "username"}, this.usernameInputNode);
		new dijit.form.TextBox({name: "email"}, this.emailInputNode);
		new dijit.form.TextBox({name: "password", type: "password"}, this.passwordInputNode);
		new dijit.form.TextBox({name: "confPassword", type: "password"}, this.confPasswordInputNode);

        dojox.data.PersevereStore.getStores().addCallback(dojo.hitch(this, function(stores){
            this.store = stores.User;
        }));
	},
	onSubmit: function(e){
		dojo.stopEvent(e);
		var contents = this.getValues();
		this.submitNode.disabled=true;
		this.errorNode.innerHTML = "";
		if(contents.username && contents.email && contents.password && contents.confPassword)
		{
			if(contents.password == contents.confPassword)
			{
				if(dojox.validate.isEmailAddress(contents.email))
				{
                    // TODO: limit public registration
                    // this.parentForm.errorNode.innerHTML = this.nls.PublicRegisterDisabled;
                    dojo.xhrPost({
                        url: "/Class/User",
                        postData: dojo.toJson({
                            method: "createUser",
                            id:"register",
                            params:[contents.username, contents.password]
                        }),
                        handleAs: "json",
                        load: dojo.hitch(this, function(response){
                            if(response.error != null){
                                //most likely that the username is taken
                                this.errorNode.innerHTML = this.nls.UsernameExists;
                                this.submitNode.disabled=false;
                            }
                            else{
                                //now set the email info
                                var store = this.store;
                                dojo.xhrPost({
                                    url: "/Class/User",
                                    postData: dojo.toJson({
                                        method: "authenticate",
                                        id: "login",
                                        params: [contents.username, contents.password]
                                    }),
                                    sync: true,
                                    load: function(){}
                                });
                                store.fetch({
                                    query: {name: contents.username},
                                    onItem: dojo.hitch(this, function(item){
                                        store.setValue(item, "email", contents.email);
					//server side shit, wtf?
                                        store.save();
                                        this.hide();
                                        this.parentForm.errorNode.innerHTML = this.nls.MayLog;
                                        dojo.xhrPost({
                                            url: "/Class/User",
                                            postData: dojo.toJson({
                                                method: "authenticate",
                                                id: "logout",
                                                params: [null, null]
                                            }),
                                            load: function(){}
                                        });
                                    }),
                                    onError: dojo.hitch(this, function(){
                                        this.errorNode.innerHTML = this.nls.DatabaseErrorCheckInstall;
    			        				this.submitNode.disabled=false;
                                    })
                                })
                             }
                        }),
                        error: dojo.hitch(this, function(){
                            this.errorNode.innerHTML = this.nls.DatabaseErrorCheckInstall;
							this.submitNode.disabled=false;
                        })
                    });
				}
				else
				{
					//this.errorNode.innerHTML = "Please enter a valid email";
					this.errorNode.innerHTML = this.nls.EnterValidEmail;
					this.submitNode.disabled=false;
				}
			}
			else
			{
				//this.errorNode.innerHTML = "Two passwords don't match";
				this.errorNode.innerHTML = this.nls.PassMismatch;
				this.submitNode.disabled=false;
			}
		}
		else
		{
			//this.errorNode.innerHTML = "Please fill in all fields";
			this.errorNode.innerHTML = this.nls.FillAllFields;
			this.submitNode.disabled=false;
		}
		return false;
	}
});

dojo.declare("desktop.login._ResetPassDialog", dijit.Dialog, {
	title: "Reset Password",
	templateString: null,
	templatePath: dojo.moduleUrl("desktop.login", "ResetPassDialog.html"),
	parentForm: null,
	postCreate: function(){
		this.nls = dojo.i18n.getLocalization("desktop.login", "login");
		this.titleNode.innerHTML = this.nls.ResetPassword;
		this.userInputLabelNode.innerHTML = this.nls.Username;
		this.emailInputLabelNode.innerHTML = this.nls.Email;
		this.submitNode.value = this.nls.Submit;

		this.inherited(arguments);
		new dijit.form.TextBox({name: "username"}, this.userInputNode);
		new dijit.form.TextBox({name: "email"}, this.emailInputNode);
	},
	onSubmit: function(e){
		dojo.stopEvent(e);
		var contents = this.getValues();
		this.submitNode.disabled=true;
		this.errorNode.innerHTML = "";
		if(contents.email && contents.username)
		{
			if(dojox.validate.isEmailAddress(contents.email))
			{
				dojo.xhrPost({
					url: dojo.baseUrl+"../../../backend/core/user.php?section=auth&action=resetpass",
					content: contents,
					load: dojo.hitch(this, function(data, ioArgs){
						if(data == "2")
						{
							//this.errorNode.innerHTML = "Email on file and username don't match";
							this.errorNode.innerHTML = this.nls.EmailUserMismatch;
							this.submitNode.disabled=false;
						}
						else if(data == "1")
						{
							//this.errorNode.innerHTML = "No such user";
							this.errorNode.innerHTML = this.nls.NoSuchUser;
							this.submitNode.disabled=false;
						}
						else if(data == "0")
						{
							this.hide();
							//this.parentForm.errorNode.innerHTML = "A new password has been sent"
							this.parentForm.errorNode.innerHTML = this.nls.NewPassSent;
						}
					})
				});
			}
			else
			{
				//this.errorNode.innerHTML = "Please enter a valid email";
				this.errorNode.innerHTML = this.nls.EnterValidEmail;
				this.submitNode.disabled=false;
			}
		}
		else
		{
			//this.errorNode.innerHTML = "Please fill out all fields";
			this.errorNode.innerHTML = this.nls.FillAllFields;
			this.submitNode.disabled=false;
		}
		return false;
	}
});
