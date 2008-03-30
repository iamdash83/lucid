<?php	
function getInfo($file) {
	global $username;
	$r = array();
	$r['path'] = $file;
	$f = "../../public/".$username."/$file";
	$r['name'] = basename($f);
	if(is_dir($f)) {
		$r["dir"] = true;
		$r["mimetype"] = "text/directory";
	}
	else if(is_file($f)) {
		$r["file"] = true;
		$r["last_modified"] = date ("F d Y H:i:s.", filemtime($f));
		$r["size"] = filesize($f);
		$r["mimetype"] = mime_content_type($f);
		if($r["mimetype"] === false && function_exists("finfo_open")) {
			//fallback on the Fileinfo PECL extention
			$finfo = finfo_open(FILEINFO_MIME);
			$r["mimetype"] = finfo_file($finfo, $f);
			finfo_close($finfo);
		}
	}
	return $r;
}

function deltree( $f ){

    if( is_dir( $f ) ){
        foreach( scandir( $f ) as $item ){
            if( !strcmp( $item, '.' ) || !strcmp( $item, '..' ) )
                continue;       
            deltree( $f . "/" . $item );
        }   
        rmdir( $f );
    }
    else{
        unlink( $f );
    }
}

function handleRequest($_GET, $_POST, $user) {
	global $username;
	$username = "";
	if ($_GET['action'] == "createDirectory") {
					$odir = $_POST['path'];
				    $dir = "../../public/".$username."/$odir";
					mkdir($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "copyFile") {
					$odir = "../../public/".$username."/".$_POST['path'];
					$odira = "../../public/".$username."/".$_POST['newpath'];
					copy($odir, $odira);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "removeFile") {
					$odir = $_POST['path'];
				    $dir = "../../public/".$username."/$odir";
					unlink($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "removeDir") {
					$odir = $_POST['path'];
				    $dir = "../../public/".$username."/$odir";
					deltree($dir);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "renameFile") {
					$file = $_POST['path'];
					$newfile = $_POST['newpath'];
				    $dir = "../../public/".$username."/$file";
					$dir2 = "../../public/".$username."/$newfile";
					rename($dir, $dir2);
					$out = new intOutput("ok");
	}
		if ($_GET['action'] == "getFolder") {
			$odir = $_POST['path'];
		    $dir = opendir("../../public/".$username."/$odir");
			if(!$dir){
				$out = new intOutput();
				$out->set("generic_err", true);
			} else {
				$arr = array();
				while(($file = readdir($dir)) !== false){
					if($file == '..' || $file == '.'){
						continue;
					} else {
						$t = strtolower($file);
						if(is_dir("../../public/".$username."/$odir" . $file)){
							$type = 'folder';
						} else {
							$type = 'file';
						}
						array_push($arr, array(
							name => $file,
							type => $type
						));
					}
				}
				$out = new jsonOutput($arr);
			}
	}
		if ($_GET['action'] == "getFile") {
					$odir = $_POST['path'];
				    	$dir = "../../public/".$username."/$odir";
					$file = file_get_contents($dir);
					$out = new jsonOutput(array(contents => $file));
	}
		if ($_GET['action'] == "writeFile") {
					$content = $_POST['content'];
					$odir = $_POST['path'];
				    	$dir = "../../public/".$username."/$odir";
					$file = file_put_contents($dir, $content);
					$out = new intOutput("ok");
	}
	if($_GET['action'] == "upload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.upload")) { die("<textarea>{status: 'failed', details: 'Contact administrator; Your account lacks uploading permissions. '}</textarea>"); }
		if(!isset($_SESSION['userid'])) {
			die("<textarea>{status: 'failed', details: 'Session is dead.'}</textarea>");
		}
		if(isset($_FILES['uploadedfile']['name'])) {
			$target_path = '../../public/'.$username.'/'.$_GET['path'];
			$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
			if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
			    echo "<textarea>{status: 'success', details: '" . $_FILES['uploadedfile']['name'] . "'}</textarea>";
			} else{
			    echo "<textarea>{status: 'failed', details: 'Contact administrator; could not write to disk'}</textarea>";
			}
		}
		else {
			#echo "/*";
			#foreach($_FILES as $file)
			#{
			#	echo $file['name'] . "\n";
			#}
			#echo "*/";
			die("<textarea>{status: 'failed', details: 'File not uploaded'}</textarea>");
		}
	}
	if($_GET['action'] == "downloadFolder") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("folder.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("folder.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("folder.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files(array("../../public/".$username."/".$_GET['path']."/*"));
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "compressDownload") {
		$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		import("lib.zip");
		if($_GET["as"] == "zip") { $newzip = new zip_file("compressed.zip"); }
		if($_GET["as"] == "gzip") { $newzip = new gzip_file("compressed.tgz"); }
		if($_GET["as"] == "bzip") { $newzip = new bzip_file("compressed.tbz2"); }
		$newzip->set_options(array('inmemory' => 1, 'recurse' => 1, 'storepaths' => 1));
		$newzip->add_files("../../public/".$username."/".$_GET['path']);
		$newzip->create_archive();
		$newzip->download_file();
	}
	if($_GET['action'] == "download") {
			$user = $User->get_current();
		if(!$user->has_permission("api.fs.download")) { die("Contact administrator; Your account lacks local download permissions."); }
		$f = "../../public/" . $username . "/" . $_GET['path'];
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header("Content-Disposition: attachment;filename=\"$name\"");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if($_GET['action'] == "display")
	{
		$f = "../../public/" . $username . "/" . $_GET['path'];
		if(file_exists($f))
		{
			$name = basename($f);
			$type = mime_content_type($f);
			$size = filesize($f);
			header("Content-type: $type");
			header('Pragma: no-cache');
			header('Expires: 0');
			header("Content-length: $size");
			readfile($f);
		}
	}
	if ($_GET['action'] == "info") {
			$odir = $_POST['path'];
			$out = new jsonOutput();
			$out->set(getInfo($odir));
	}
}
?>
