<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.user");
	import("models.share");
    import("lib.Json.Json");
	if($_GET['section'] == "action")
	{
		if ($_GET['action'] == "new") {
			$current = $User->get_current();
			$data = Zend_Json::Decode($_POST['data']);
			$name = $data['name'];
			$groups = $data['groups'];
			if(!$name || !$groups) internal_error("generic_err");
			//User haz adminz?
			if(!$current->has_permission("core.administration"))
				internal_error("permission_denied");
			//Does a share of this name currently exist?
			if($Share->filter("name", $name))
				internal_error("generic_err");
			//Time to do some srs creating bro'
			$omfgnewshare = new Share();
			$omfgnewshare->name = $name;
			$omfgnewshare->groups = $groups;
			$omfgnewshare->save();
			$omfgnewshare->create_fs();
			internal_error("ok");
		}
		elseif ($_GET['action'] == "delete") {
			$data = Zend_Json::Decode($_POST['data']);
			$current = $User->get_current();
			$name = $data['name'];
			if(!$name) {
				$id = $data['id'];
				if(!$id) internal_error("generic_err");
			}
			//User haz adminz?
			if(!$current->has_permission("core.administration"))
				internal_error("permission_denied");
			//Does a share of this name even currently exist?
			if(!$name) $curshare = $Share->get($id);
			else $curshare = $Share->filter("name", $name);
			if(!$curshare) internal_error("generic_err");
			//Time to do some srs fragging bro'
			$curshare->frag_fs();
			$curshare->delete();
			internal_error("ok");
		}
	}
