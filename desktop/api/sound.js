/* 
 * Group: api
 * 
 * Package: sound
 * 
 * Summary:
 * 		An API that allows an app to play audio content.
 */
dojo.require("dijit._Widget");
dojo.provide("api.sound");
dojo.declare("api.sound", dijit._Widget, {
	src: "",
	loop: false,
	timer: null,
	position: 0,
	startTime: 0,
	timeInterval: 1000,
	autoStart: false,
	flash: false,
	_startPos: 0,
	flReady: false,
	flSound: {},
	_aflax: {},
	postCreate: function() {
		var r = new com.deconcept.PlayerVersion([8,0,0]);
		var i = com.deconcept.FlashObjectUtil.getPlayerVersion();
		this.flash = i.versionIsValid(r);
		this.domNode.style.position="absolute";
		this.domNode.style.left="-999px";
		this.domNode.style.top="-999px";
		document.body.appendChild(this.domNode);
		if(this.flash) {
			this.aflax = new api.aflax();
			window["flashcallback"+this.id] = dojo.hitch(this, this.flashCallback);
			this.aflax.addFlashToElement(this.domNode, 1, 1, "#FFFFFF", "flashcallback"+this.id, true);
		}
	},
	flashCallback: function() {
		console.log("callback triggered");
		delete window["flashcallback"+this.id];
		this.flSound = new api.aflax.FlashObject(this.aflax, "Sound");
		this.flSound.exposeFunction("loadSound", this.flSound);		
		this.flSound.exposeFunction("start", this.flSound);		
		this.flSound.exposeFunction("stop", this.flSound);		
		this.flSound.exposeFunction("setVolume", this.flSound);	
		this.flSound.exposeFunction("getVolume", this.flSound);		
		this.flSound.exposeProperty("position", this.flSound);	
		this.flSound.exposeProperty("duration", this.flSound);
		this.flSound.exposeProperty("id3", this.flSound);
		this.flSound.mapFunction("addEventHandler");
		window["flashcallback"+this.id] = dojo.hitch(this, this._ready);
		this.flSound.addEventHandler("onLoad", "flashcallback"+this.id);
		this.flSound.loadSound(this.src, true);
		if(!this.autoStart) this.stop();
	},
	getId3: function() {
		if(this.flReady && this.flash) return this.flSound.getId3;
		else return false;
	},
	setVolume: function(val) {
		if(this.flReady && this.flash) return this.flSound.setVolume(val);
		else return false;
	},
	getVolume: function(val) {
		if(this.flReady && this.flash) return this.flSound.getVolume(val);
		else return false;
	},
	_ready: function() {
		delete window["flashcallback"+this.id];
		this.flReady = true;
	},
	play: function() {
		if (!this.flash) {
			if (this.domNode.innerHTML != "") 
				this.stop();
			this.position = 0;
			this.domNode.innerHTML = "<embed src=\"" + this.src + "\" hidden=\"true\" autoplay=\"true\" loop=\"" + (this.loop ? "true" : "false") + "\">";
			this.timer = setInterval(dojo.hitch(this, this.fixtime), this.timeInterval);
		}
		else {
			if(this.flReady) {
				this.flSound.start(this._startPos);
				this._startPos = 0;
			}
			else setTimeout(dojo.hitch(this, this.play), 100);
		}
	},
	getPosition: function() {
		if (this.flReady && this.flash) {
			return this.flSound.getPosition();
		}
		else {
			return this.position;
		}
	},
	getDuration: function() {
		if (this.flReady && this.flash) {
			return this.flSound.getDuration();
		}
		else {
			return 0;
		}
	},
	pause: function() {
		if(!this.flash) {
			this.stop();
		}
		else {
			this.flSound.stop();
			this._startPos = this.getPosition() / 1000;
		}
	},
	fixtime: function() {
		this.position += this.timeInterval;
	},
	stop: function() {
		if (!this.flash) {
			clearInterval(this.timer);
			this.domNode.innerHTML = "";
		}
		else {
			this._startPos = 0;
			this.flSound.stop();
		}
	},
	uninitialize: function() {
		document.body.removeChild(this.domNode);
		if(!this.flash) clearInterval(this.timer);
	}
});
	