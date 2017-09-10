<?php ?>
<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Knowledge Database | Good Humans</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">

    <link href="css/normalize.min.css" rel="stylesheet"><link href="css/tingle.min.css" rel="stylesheet"><link href="css/MyFontsTradeGothic.css" rel="stylesheet"><link href="css/main.css" rel="stylesheet"></head>
    <body class="loading signed-out">
        <!--[if lt IE 8]>
            <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->

        <div id="main-wrapper" class="wrapper">


          <header>
            <div id="user-signed-in">
              <div id="user-info">
                <span id="signin-name"></span> | <span id="signin-email"></span> | <span id="sign-out" class="link-style">Sign Out</span>
              </div>
            </div>
            <div class="page-nav">
            </div>
            <div class="logo-container">
              <img src='./img/gh-knowledge-logo.jpg' alt="logo" />
            </div>
          </header>


          <div class="input-area">
            <input class="searchbar" id="main-search" type="search" />
            <img src='./img/grid.svg' id="view-grid" alt="4 blocks - to view grid" class='active input-icon' />
            <img src='./img/list.svg' id="view-list" alt="3 horizontal lines blocks - to view list" class='input-icon' />
            <img src='./img/daterange.svg' id="sort-list" style="display: none;" alt="a to z - to sort" class='input-icon' />
            <div id='brand-selection'>
              <a class="brand-logo" href="?brand=monster" id="logo-monster" >
                <img src="./img/brands/monster-logo-2.png" alt="monster logo"/>
              </a>
              <a class="brand-logo" href="?brand=meatliquor" id="logo-meatliquor">
                <img src="./img/brands/meliq-logo.png" alt="meatliquor logo"/>
              </a>
            </div>
          </div>

          <div id="dataArea">
            <button class="button" id="google-sign-in">Sign in with Google</button>
            <div id="loading-spinner" class="hidden"><img src="./img/spinner2.gif" /></div>
            <div class="" id="main-list"></div>
          </div>

        </div>

        <footer>
          <div class="wrapper">
            <div id="footerData">
            </div>
          </div>
        </footer>

        <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase-app.js"></script>
        <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase-auth.js"></script>
        <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase-database.js"></script>
        <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase-storage.js"></script>
        <script src="https://www.gstatic.com/firebasejs/4.0.0/firebase.js"></script>
    <script type="text/javascript" src="js/modernizr-2.8.3.min.js"></script><script type="text/javascript" src="js/tingle.min.js"></script><script type="text/javascript" src="js/holmes.js"></script><script type="text/javascript" src="js/mustache.min.js"></script><script type="text/javascript" src="js/request.min.js"></script><script type="text/javascript" src="app_bundle.js"></script></body>

</html>