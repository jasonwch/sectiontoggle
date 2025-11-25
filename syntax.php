<?php
/**
 
 */

if(!defined('DOKU_INC')) define('DOKU_INC',realpath(dirname(__FILE__).'/../../').'/');
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

//2025 code refactoring - Jason
//require_once(DOKU_PLUGIN.'syntax.php');

/**
 * All DokuWiki plugins to extend the parser/rendering mechanism
 * need to inherit from this class
 */
class syntax_plugin_sectiontoggle extends DokuWiki_Syntax_Plugin {


    function getType(){
        return 'substition';
    }
	

    function getPType(){
        return 'block';
    }

 
    function getSort(){
        return 199;
    }


    function connectTo($mode) {
      $this->Lexer->addSpecialPattern('~~stoggle_buttons~~',$mode,'plugin_sectiontoggle');
      $this->Lexer->addSpecialPattern('~~stoggle_excludeStart~~',$mode,'plugin_sectiontoggle');
      $this->Lexer->addSpecialPattern('~~stoggle_excludeEnd~~',$mode,'plugin_sectiontoggle');
    }


    function handle($match, $state, $pos, Doku_Handler $handler){
       // Extract the command between ~~stoggle_ and ~~
       // Use preg_match for more reliable extraction
       if(preg_match('/~~stoggle_(\w+)~~/', $match, $m)) {
           $match = $m[1];
       } else {
           $match = substr($match,10,-2);
       }
        switch ($state) {   
          case DOKU_LEXER_SPECIAL :
           return array($state, $match);
        }
        return array($state,"");
    }


    function render($mode, Doku_Renderer $renderer, $data) {
        if($mode == 'xhtml'){
           $renderer->nocache();
           list($state,$match) = $data;
            switch ($state) {          
              case DOKU_LEXER_SPECIAL :    
               if($match == 'buttons') { 
                $open = $this->getLang('open_all');
                $close = $this->getLang('close_all');               
                $renderer->doc .= '<p class="sectoggle"><button onclick = "SectionToggle.open_all();" style="white-space:nowrap;" >' . $open . '</button>&nbsp;&nbsp;<button onclick = "SectionToggle.close_all();" style="white-space:nowrap;" >' . $close .'</button></p>';     // ptype = 'block'
                }
                elseif($match == 'excludeStart') {
                   // Marker span for JavaScript to detect exclusion zone start
                   // Add data attribute for debugging
                   $renderer->doc .= '<span class="stoggle_exclude_start" data-stoggle="exclude-start"></span>';                    
                }
                elseif($match == 'excludeEnd') {
                   // Marker span for JavaScript to detect exclusion zone end
                   $renderer->doc .= '<span class="stoggle_exclude_end" data-stoggle="exclude-end"></span>';                    
                }                                
               return true;
            }
        }
        return false;
    }
}

?>