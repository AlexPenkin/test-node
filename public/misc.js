/**
 * Created by Александр on 23.04.2016.
 */

$(document).ready(function(){
    var ass = $('.drag');
   ass.mouseenter(function () {

       $(this).animate({paddingBottom: '30px'},"slow");

        console.log('HERE');
    });
    ass.mouseleave(function () {
        $(this).animate({paddingBottom: '20px'},"slow");

        console.log('THERE');
    });
   });

