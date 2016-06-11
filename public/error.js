/**
 * Created by Александр on 23.04.2016.
 */

function call() {
    var msg = $('.postreg').serialize();
    $.ajax({
        type: 'POST',
        url: '/signup',
        data: msg,
        success: function(data) {
            $('.error').html(data);
            console.log(data);
            if (data ==  "<p>Успешно!</p>") {
              setTimeout(function(){document.location.href = "/"},5000);
            }
        },
        error: function(xhr, str) {
            alert('Возникла ошибка: ' + xhr.responseCode);
        }
    });

}
$(document).ready(function() {
    $(".poster").click(function() {
        console.log("нажали");
        call();
    });
});
