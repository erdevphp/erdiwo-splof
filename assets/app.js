/*
 * Welcome to your app's main JavaScript file!
 *
 * This file will be included onto the page via the importmap() Twig function,
 * which should already be in your base.html.twig.
 */
// import * as faceapi from '@vladmandic/face-api';

// assets/styles/app.scss
// import '../node_modules/bootstrap/dist/js/bootstrap.bundle'
import './styles/app.scss';

import './js/jquery.min.js?h=89312d34339dcd686309fe284b3f226f'
import './bootstrap/js/bootstrap.min.js?h=7c038681746a729e2fff9520a575e78c'
import './js/chart.min.js?h=2c0fc24b3d3038317dc51c05339856d0'
import './js/bs-init.js?h=08ba999e06fc97f895c72848bddb91c1'
import './js/jquery.easing'
import './js/theme.js?h=6d33b44a6dcb451ae1ea7efc7b5c5e30'
import './js/jquery.timeago'

jQuery(document).ready(function() {
    jQuery("time.timeago").timeago();
    const logout = document.querySelector('#logout')
    if (logout) {
        logout.addEventListener('click', function(e){
            e.preventDefault();
            if(confirm('Voulez-vous vraiement vous déconnectez?')) {
                window.location.href = e.target.href
            }
        })
    }
    
});