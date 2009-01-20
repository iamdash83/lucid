<?php

import("models.session");
/*class session_manager {
    var $session_id;
    function _makeSession($session_id){
        global $Session;
        $p = new $Session(array(
            "session_id" => $session_id,
            "date_creatd" => getTimeStamp(),
            "last_updated" => getTimeStamp(),
        ));
        $p->save();
        return $p;
    }
    function open($save_path, $session_name){
        //do nothing
        return true;
    }
    function close(){
        if (!empty($this->fieldarray)) {
            // perform garbage collection
            $result = $this->gc(ini_get('session.gc_maxlifetime'));
            return $result;
        } // if
        
        return FALSE;
    }
    function __destruct(){
        @session_write_close();

    }
    function read($session_id){
        global $Session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            return $p[0]->session_data;
        }
        else{
            return '';
        }
    }
    function write($session_id, $session_data){
        global $Session;
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            $p = $p[0];
            $p->last_updated = getTimeStamp();
        }else{
            $p = $this->_makeSession();
        }
        $p->session_data = $session_data;
        $p->save();
        return true;
    }
    function destroy($session_id){
        global $Session
        $p=$Session->filter("session_id", $session_id);
        if($p != false){
            $p = $p[0];
            $p->delete();
            return true;
        }
        return false;
    }
    function gc($max_lifetime){
        global $Session;
        $real_now = date('Y-m-d H:i:s');
        $dt1 = strtotime("$real_now -2 hours");
        $dt2 = date('YmdHis', $dt1);
        
        $count = $Session->filter(array("last_updated__lte" => $dt2));
        return TRUE;
    }
}*/
echo "asdf";
