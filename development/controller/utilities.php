<?php
class Utilities {
  
  public function encrypt_decrypt($action, $string) {
    $output = false;
    $encrypt_method = "AES-256-CBC";
    $secret_key = $this->config->saltKey; // $this->config is assumed to be included since this class is ONLY used to be extended from
    $secret_iv = $this->config->saltKey;
    
    // hash
    $key = hash('sha256', $secret_key);
    
    // iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
    $iv = substr(hash('sha256', $secret_iv), 0, 16);
    if ( $action == 'encrypt' ) {
        $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
    } else if( $action == 'decrypt' ) {
        $output = openssl_decrypt($string, $encrypt_method, $key, 0, $iv);
    }
    return $output;
  }
}
?>